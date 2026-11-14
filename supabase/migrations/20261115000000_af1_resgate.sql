-- Resgate da raspadinha e emissão do cupom fictício (PBI-010).

insert into public.af1_settings (key, value, description) values
  ('coupon_discount_percent', '10', 'Desconto do cupom (%), emitido no primeiro resgate da conta.'),
  ('coupon_valid_days', '10', 'Validade do cupom em dias a partir da emissão.')
on conflict (key) do nothing;

create table public.af1_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^AF1-[A-HJ-NP-Z2-9]{4}$'),
  discount_percent integer not null check (discount_percent between 1 and 100),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
comment on table public.af1_coupons is 'Cupom fictício (campanha simulada): um por conta, emitido no primeiro resgate.';

alter table public.af1_coupons enable row level security;
revoke all on table public.af1_coupons from anon, authenticated;
grant select on table public.af1_coupons to authenticated;
create policy af1_coupons_select_own on public.af1_coupons
  for select to authenticated using (user_id = (select auth.uid()));

alter table public.af1_scratches
  add constraint af1_scratches_coupon_fk foreign key (coupon_id)
  references public.af1_coupons (id) on delete set null;

-- Código AF1-XXXX sem caracteres ambíguos (sem 0, O, 1, I). Uso interno.
create or replace function public.af1_new_coupon_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'AF1-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 4)
$$;
revoke all on function public.af1_new_coupon_code() from public, anon, authenticated;

-- Resgata a raspadinha: desbloqueia o par na conta e emite o cupom no primeiro
-- resgate. Exige conta permanente. Idempotente: repetir devolve o mesmo resultado.
create or replace function public.af1_redeem_scratch(p_scratch_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_is_anon boolean := coalesce(((auth.jwt()) ->> 'is_anonymous')::boolean, false);
  v_scratch public.af1_scratches;
  v_coupon public.af1_coupons;
  v_discount integer;
  v_days integer;
  v_attempt integer := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if v_is_anon then
    raise exception 'signup_required' using errcode = 'P0001', hint = 'Crie uma conta para resgatar o prêmio.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  select * into v_scratch from public.af1_scratches
  where id = p_scratch_id and user_id = v_uid
  for update;
  if not found then
    raise exception 'scratch_not_found' using errcode = 'P0002';
  end if;

  if v_scratch.status <> 'resgatada' then
    insert into public.af1_unlocks (user_id, sneaker_id, scratch_id)
    values (v_uid, v_scratch.sneaker_id, v_scratch.id)
    on conflict (user_id, sneaker_id) do nothing;

    if not exists (select 1 from public.af1_coupons where user_id = v_uid) then
      select coalesce((select (value #>> '{}')::integer from public.af1_settings where key = 'coupon_discount_percent'), 10),
             coalesce((select (value #>> '{}')::integer from public.af1_settings where key = 'coupon_valid_days'), 10)
        into v_discount, v_days;
      loop
        v_attempt := v_attempt + 1;
        begin
          insert into public.af1_coupons (user_id, code, discount_percent, expires_at)
          values (v_uid, public.af1_new_coupon_code(), v_discount, now() + make_interval(days => v_days))
          returning * into v_coupon;
          exit;
        exception when unique_violation then
          if v_attempt >= 10 then raise; end if;
        end;
      end loop;
    end if;

    update public.af1_scratches
    set status = 'resgatada',
        revealed_at = coalesce(revealed_at, now()),
        redeemed_at = now(),
        coupon_id = v_coupon.id
    where id = v_scratch.id
    returning * into v_scratch;
  end if;

  if v_scratch.coupon_id is not null then
    select * into v_coupon from public.af1_coupons where id = v_scratch.coupon_id;
  end if;

  return jsonb_build_object(
    'sneaker', (
      select jsonb_build_object('id', s.id, 'slug', s.slug, 'name', s.name, 'color_name', s.color_name)
      from public.af1_sneakers s where s.id = v_scratch.sneaker_id
    ),
    'coupon', case when v_coupon.id is null then null else jsonb_build_object(
      'code', v_coupon.code,
      'discount_percent', v_coupon.discount_percent,
      'expires_at', v_coupon.expires_at
    ) end
  );
end;
$$;
revoke all on function public.af1_redeem_scratch(uuid) from public, anon;
grant execute on function public.af1_redeem_scratch(uuid) to authenticated;

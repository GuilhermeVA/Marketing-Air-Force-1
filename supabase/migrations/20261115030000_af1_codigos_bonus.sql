-- Códigos que liberam uma raspadinha extra na hora, fora do limite diário.
-- Os códigos são cadastrados pelo painel; o cliente não lê nem escreve a tabela.
create table public.af1_bonus_codes (
  code text primary key check (code = lower(code)),
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);
alter table public.af1_bonus_codes enable row level security;
revoke all on table public.af1_bonus_codes from anon, authenticated;

insert into public.af1_bonus_codes (code, description) values
  ('admin', 'Testes: libera uma raspadinha nova a cada uso.')
on conflict (code) do nothing;

-- Histórico de usos (auditoria).
create table public.af1_bonus_code_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null references public.af1_bonus_codes (code) on delete cascade,
  scratch_id uuid references public.af1_scratches (id) on delete set null,
  used_at timestamptz not null default now()
);
create index af1_bonus_code_uses_user_idx on public.af1_bonus_code_uses (user_id, used_at desc);
alter table public.af1_bonus_code_uses enable row level security;
revoke all on table public.af1_bonus_code_uses from anon, authenticated;

-- Resgata um código: sorteia uma raspadinha nova na hora (só contas cadastradas).
-- Respostas: payload "available" | all_unlocked | invalid_code | unavailable/signup_required.
-- Se já houver raspadinha pendente, devolve ela sem consumir o código.
create or replace function public.af1_redeem_bonus_code(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_is_anon boolean := coalesce(((auth.jwt()) ->> 'is_anonymous')::boolean, false);
  v_code text := lower(btrim(coalesce(p_code, '')));
  v_scratch public.af1_scratches;
  v_sneaker uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if v_is_anon then
    return jsonb_build_object('status', 'unavailable', 'reason', 'signup_required');
  end if;
  if not exists (select 1 from public.af1_bonus_codes where code = v_code and active) then
    return jsonb_build_object('status', 'invalid_code');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  select * into v_scratch
  from public.af1_scratches
  where user_id = v_uid and status in ('livre', 'revelada')
  order by created_at desc
  limit 1;
  if found then
    return public.af1_scratch_payload(v_scratch);
  end if;

  v_sneaker := public.af1_draw_sneaker(v_uid);
  if v_sneaker is null then
    return jsonb_build_object('status', 'all_unlocked');
  end if;

  insert into public.af1_scratches (user_id, sneaker_id)
  values (v_uid, v_sneaker)
  returning * into v_scratch;

  insert into public.af1_bonus_code_uses (user_id, code, scratch_id)
  values (v_uid, v_code, v_scratch.id);

  return public.af1_scratch_payload(v_scratch);
end;
$$;
revoke all on function public.af1_redeem_bonus_code(text) from public, anon;
grant execute on function public.af1_redeem_bonus_code(text) to authenticated;

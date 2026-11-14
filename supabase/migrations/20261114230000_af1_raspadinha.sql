-- Raspadinha: disponibilidade, sorteio e reserva no servidor (PBI-007).

-- Configurações ajustáveis pelo painel (o cliente não lê nem escreve).
create table public.af1_settings (
  key text primary key,
  value jsonb not null,
  description text
);
alter table public.af1_settings enable row level security;
revoke all on table public.af1_settings from anon, authenticated;

insert into public.af1_settings (key, value, description) values
  ('scratches_per_day', '1', 'Raspadinhas por dia para contas cadastradas (fuso de São Paulo).')
on conflict (key) do nothing;

-- Pares desbloqueados por usuário (escrita feita pela função de resgate, PBI-010).
create table public.af1_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  sneaker_id uuid not null references public.af1_sneakers (id) on delete cascade,
  scratch_id uuid,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, sneaker_id)
);
alter table public.af1_unlocks enable row level security;
revoke all on table public.af1_unlocks from anon, authenticated;
grant select on table public.af1_unlocks to authenticated;
create policy af1_unlocks_select_own on public.af1_unlocks
  for select to authenticated using (user_id = (select auth.uid()));

create table public.af1_scratches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sneaker_id uuid not null references public.af1_sneakers (id),
  status text not null default 'livre' check (status in ('livre', 'revelada', 'resgatada')),
  created_at timestamptz not null default now(),
  revealed_at timestamptz,
  redeemed_at timestamptz,
  coupon_id uuid
);
create index af1_scratches_user_created_idx on public.af1_scratches (user_id, created_at desc);
-- No máximo uma raspadinha pendente (livre ou revelada) por usuário.
create unique index af1_scratches_one_pending_idx on public.af1_scratches (user_id)
  where status in ('livre', 'revelada');

alter table public.af1_unlocks
  add constraint af1_unlocks_scratch_fk foreign key (scratch_id)
  references public.af1_scratches (id) on delete set null;

alter table public.af1_scratches enable row level security;
revoke all on table public.af1_scratches from anon, authenticated;
grant select on table public.af1_scratches to authenticated;
create policy af1_scratches_select_own on public.af1_scratches
  for select to authenticated using (user_id = (select auth.uid()));

-- Sorteio ponderado por draw_weight entre os pares ativos ainda bloqueados.
-- Uso interno: não é exposta ao cliente.
create or replace function public.af1_draw_sneaker(p_user_id uuid)
returns uuid
language sql
volatile
set search_path = ''
as $$
  with candidates as (
    select s.id, s.draw_weight,
           sum(s.draw_weight) over (order by s.sort_order, s.id) as acc,
           sum(s.draw_weight) over () as total
    from public.af1_sneakers s
    where s.active
      and not exists (
        select 1 from public.af1_unlocks u
        where u.user_id = p_user_id and u.sneaker_id = s.id
      )
  ),
  pick as (select random() * max(total) as r from candidates)
  select c.id
  from candidates c, pick
  where c.acc > pick.r
  order by c.acc
  limit 1
$$;
revoke all on function public.af1_draw_sneaker(uuid) from public, anon, authenticated;

-- Dados do par para a tela da raspadinha (sem o texto de significado).
create or replace function public.af1_scratch_payload(p_scratch public.af1_scratches)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'status', 'available',
    'scratch', jsonb_build_object(
      'id', p_scratch.id,
      'status', p_scratch.status,
      'created_at', p_scratch.created_at,
      'revealed_at', p_scratch.revealed_at
    ),
    'sneaker', jsonb_build_object(
      'id', s.id, 'slug', s.slug, 'name', s.name,
      'color_name', s.color_name, 'color_hex', s.color_hex,
      'image', (
        select jsonb_build_object('url', i.url, 'alt', i.alt)
        from public.af1_sneaker_images i
        where i.sneaker_id = s.id
        order by i.position
        limit 1
      )
    )
  )
  from public.af1_sneakers s
  where s.id = p_scratch.sneaker_id
$$;
revoke all on function public.af1_scratch_payload(public.af1_scratches) from public, anon, authenticated;

-- Retorna a raspadinha pendente do usuário ou sorteia uma nova, se houver direito.
-- Estados: available | unavailable (reason: signup_required | daily_limit) | all_unlocked.
create or replace function public.af1_get_or_create_scratch()
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
  v_today_start timestamptz;
  v_limit integer;
  v_used integer;
  v_sneaker uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Serializa chamadas do mesmo usuário (evita duas raspadinhas em paralelo).
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  select * into v_scratch
  from public.af1_scratches
  where user_id = v_uid and status in ('livre', 'revelada')
  order by created_at desc
  limit 1;
  if found then
    return public.af1_scratch_payload(v_scratch);
  end if;

  if v_is_anon then
    if exists (select 1 from public.af1_scratches where user_id = v_uid) then
      return jsonb_build_object('status', 'unavailable', 'reason', 'signup_required');
    end if;
  else
    v_today_start := date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
    select coalesce((select (value #>> '{}')::integer from public.af1_settings where key = 'scratches_per_day'), 1)
      into v_limit;
    select count(*) into v_used
    from public.af1_scratches
    where user_id = v_uid and created_at >= v_today_start;
    if v_used >= v_limit then
      return jsonb_build_object(
        'status', 'unavailable',
        'reason', 'daily_limit',
        'next_available_at', v_today_start + interval '1 day'
      );
    end if;
  end if;

  v_sneaker := public.af1_draw_sneaker(v_uid);
  if v_sneaker is null then
    return jsonb_build_object('status', 'all_unlocked');
  end if;

  insert into public.af1_scratches (user_id, sneaker_id)
  values (v_uid, v_sneaker)
  returning * into v_scratch;

  return public.af1_scratch_payload(v_scratch);
end;
$$;
revoke all on function public.af1_get_or_create_scratch() from public, anon;
grant execute on function public.af1_get_or_create_scratch() to authenticated;

-- Marca a raspadinha como revelada (livre -> revelada). Idempotente.
create or replace function public.af1_mark_scratch_revealed(p_scratch_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_scratch public.af1_scratches;
begin
  update public.af1_scratches
  set status = 'revelada', revealed_at = now()
  where id = p_scratch_id and user_id = auth.uid() and status = 'livre'
  returning * into v_scratch;

  if not found then
    select * into v_scratch from public.af1_scratches
    where id = p_scratch_id and user_id = auth.uid();
    if not found then
      raise exception 'scratch_not_found' using errcode = 'P0002';
    end if;
  end if;

  return jsonb_build_object('id', v_scratch.id, 'status', v_scratch.status, 'revealed_at', v_scratch.revealed_at);
end;
$$;
revoke all on function public.af1_mark_scratch_revealed(uuid) from public, anon;
grant execute on function public.af1_mark_scratch_revealed(uuid) to authenticated;

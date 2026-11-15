-- Testes dos códigos de raspadinha extra. Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(10);

insert into auth.users (id, email, is_anonymous, aud, role) values
  ('00000000-0000-0000-0000-0000000000e0', null, true, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e1', 'bonus@example.com', false, 'authenticated', 'authenticated');

create function pg_temp.as_user(p_id text, p_anon boolean) returns void language sql as $$
  select set_config('request.jwt.claims',
    json_build_object('sub', p_id, 'role', 'authenticated', 'is_anonymous', p_anon)::text, true);
$$;

set local role authenticated;

select pg_temp.as_user('00000000-0000-0000-0000-0000000000e0', true);
select is(public.af1_redeem_bonus_code('admin') ->> 'reason', 'signup_required',
  'sessão anônima não usa código');

select pg_temp.as_user('00000000-0000-0000-0000-0000000000e1', false);
select is(public.af1_redeem_bonus_code('errado') ->> 'status', 'invalid_code', 'código inexistente é recusado');
select throws_ok('select * from public.af1_bonus_codes', '42501', null, 'cliente não lê os códigos');

-- Usa a raspadinha do dia.
create temp table d1 as select public.af1_get_or_create_scratch() as v;
select public.af1_mark_scratch_revealed((select v #>> '{scratch,id}' from d1)::uuid);
select public.af1_redeem_scratch((select v #>> '{scratch,id}' from d1)::uuid);
select is(public.af1_get_or_create_scratch() ->> 'reason', 'daily_limit', 'limite diário atingido');

-- Código libera outra na hora (sem diferenciar maiúsculas e espaços).
create temp table b1 as select public.af1_redeem_bonus_code('  ADMIN ') as v;
select is((select v ->> 'status' from b1), 'available', 'código válido libera raspadinha nova');
select isnt((select v #>> '{sneaker,id}' from b1), (select v #>> '{sneaker,id}' from d1),
  'sorteia um par ainda bloqueado');
select is(public.af1_get_or_create_scratch() #>> '{scratch,id}', (select v #>> '{scratch,id}' from b1),
  'a raspadinha extra fica reservada como pendente');
select is(public.af1_redeem_bonus_code('admin') #>> '{scratch,id}', (select v #>> '{scratch,id}' from b1),
  'com raspadinha pendente, o código devolve a mesma');

-- Depois de resgatar a extra, o código pode ser usado de novo.
select public.af1_mark_scratch_revealed((select v #>> '{scratch,id}' from b1)::uuid);
select public.af1_redeem_scratch((select v #>> '{scratch,id}' from b1)::uuid);
select isnt(public.af1_redeem_bonus_code('admin') #>> '{scratch,id}', (select v #>> '{scratch,id}' from b1),
  'código reutilizável libera mais uma');

reset role;
select is((select count(*)::int from public.af1_bonus_code_uses
  where user_id = '00000000-0000-0000-0000-0000000000e1'), 2, 'usos ficam registrados');

select * from finish();
rollback;

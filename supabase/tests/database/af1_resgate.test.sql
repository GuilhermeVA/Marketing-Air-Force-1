-- Testes do resgate e do cupom (PBI-010). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

insert into auth.users (id, email, is_anonymous, aud, role) values
  ('00000000-0000-0000-0000-0000000000e1', 'e1@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e2', null, true, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e3', 'e3@example.com', false, 'authenticated', 'authenticated');

insert into public.af1_scratches (id, user_id, sneaker_id, status, created_at)
select v.id::uuid, v.uid::uuid, (select id from public.af1_sneakers where slug = v.slug), v.status, v.created_at
from (values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000e1', 'dourado', 'revelada', now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-0000000000e2', 'rosa', 'revelada', now())
) as v (id, uid, slug, status, created_at);

create function pg_temp.as_user(p_id text, p_anon boolean) returns void language sql as $$
  select set_config('request.jwt.claims',
    json_build_object('sub', p_id, 'role', 'authenticated', 'is_anonymous', p_anon)::text, true);
$$;

set local role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000e1', false);

-- Primeiro resgate: desbloqueio + cupom.
create temp table r1 as select public.af1_redeem_scratch('10000000-0000-0000-0000-000000000001') as v;
select is((select v #>> '{sneaker,slug}' from r1), 'dourado', 'retorna o par resgatado');
select matches((select v #>> '{coupon,code}' from r1), '^AF1-[A-HJ-NP-Z2-9]{4}$', 'cupom no formato AF1-XXXX sem caracteres ambíguos');
select is((select (v #>> '{coupon,discount_percent}')::int from r1), 10, 'desconto de 10%');
select ok(
  (select (v #>> '{coupon,expires_at}')::timestamptz from r1) between now() + interval '10 days' - interval '1 minute' and now() + interval '10 days' + interval '1 minute',
  'validade de 10 dias');
select is((select count(*)::int from public.af1_unlocks where sneaker_id = (select id from public.af1_sneakers where slug = 'dourado')), 1, 'par desbloqueado na conta');
select is((select status from public.af1_scratches where id = '10000000-0000-0000-0000-000000000001'), 'resgatada', 'raspadinha marcada como resgatada');

-- Idempotência.
select is(
  (select public.af1_redeem_scratch('10000000-0000-0000-0000-000000000001')),
  (select v from r1), 'resgatar de novo devolve o mesmo resultado');
select is((select count(*)::int from public.af1_coupons), 1, 'não duplica cupom');

-- Segundo resgate (aceita raspadinha ainda "livre"): só desbloqueio.
reset role;
insert into public.af1_scratches (id, user_id, sneaker_id, status)
select '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000e1', id, 'livre'
from public.af1_sneakers where slug = 'roxo';
set local role authenticated;
select is(
  (select public.af1_redeem_scratch('10000000-0000-0000-0000-000000000002') -> 'coupon'),
  'null'::jsonb, 'segundo resgate não gera novo cupom');
select is((select count(*)::int from public.af1_unlocks), 2, 'segundo par desbloqueado');

-- Regras de acesso.
select throws_ok($$select public.af1_new_coupon_code()$$, '42501', null, 'cliente não gera códigos diretamente');

select pg_temp.as_user('00000000-0000-0000-0000-0000000000e3', false);
select throws_ok($$select public.af1_redeem_scratch('10000000-0000-0000-0000-000000000003')$$, 'P0002', 'scratch_not_found', 'usuário não resgata raspadinha de outro');
select is((select count(*)::int from public.af1_coupons), 0, 'usuário não enxerga cupom de outro');

select pg_temp.as_user('00000000-0000-0000-0000-0000000000e2', true);
select throws_ok($$select public.af1_redeem_scratch('10000000-0000-0000-0000-000000000003')$$, 'P0001', 'signup_required', 'sessão anônima precisa se cadastrar');

select * from finish();
rollback;

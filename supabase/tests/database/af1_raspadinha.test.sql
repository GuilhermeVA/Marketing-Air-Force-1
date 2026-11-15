-- Testes da raspadinha no servidor (PBI-007). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(20);

insert into auth.users (id, email, is_anonymous, aud, role) values
  ('00000000-0000-0000-0000-0000000000a0', null, true, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c0', 'conta@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d0', 'quase@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b0', 'outra@example.com', false, 'authenticated', 'authenticated');

create function pg_temp.as_user(p_id text, p_anon boolean) returns void language sql as $$
  select set_config('request.jwt.claims',
    json_build_object('sub', p_id, 'role', 'authenticated', 'is_anonymous', p_anon)::text, true);
$$;

set local role authenticated;

-- Sessão anônima.
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a0', true);
create temp table r1 as select public.af1_get_or_create_scratch() as v;
select is((select v ->> 'status' from r1), 'available', 'anônimo recebe uma raspadinha');
select ok((select v #>> '{sneaker,image,url}' from r1) is not null, 'resposta traz a imagem do par');
select ok((select v #> '{sneaker,meaning}' = 'null'::jsonb and v #> '{sneaker,keywords}' = 'null'::jsonb from r1),
  'antes de revelar, o significado não vem na resposta');
select is(
  (select public.af1_get_or_create_scratch() #>> '{scratch,id}'),
  (select v #>> '{scratch,id}' from r1),
  'segunda chamada devolve a mesma raspadinha (reserva)');

select is(
  (select public.af1_mark_scratch_revealed(((select v #>> '{scratch,id}' from r1))::uuid) #>> '{scratch,status}'),
  'revelada', 'marcar como revelada muda livre -> revelada');
select ok((select public.af1_get_or_create_scratch() #>> '{sneaker,meaning}') is not null,
  'depois de revelar, o significado vem na resposta');
select ok(jsonb_array_length((select public.af1_get_or_create_scratch() #> '{sneaker,keywords}')) > 0,
  'depois de revelar, as palavras-chave vêm na resposta');
select is(
  (select public.af1_mark_scratch_revealed(((select v #>> '{scratch,id}' from r1))::uuid) #>> '{scratch,status}'),
  'revelada', 'marcar de novo é idempotente');
select is(
  (select public.af1_get_or_create_scratch() #>> '{scratch,status}'),
  'revelada', 'reabrir mostra o mesmo prêmio já revelado');

select throws_ok($$select public.af1_draw_sneaker(auth.uid())$$, '42501', null, 'cliente não chama o sorteio interno');
select throws_ok(
  $$insert into public.af1_scratches (user_id, sneaker_id) select auth.uid(), id from public.af1_sneakers limit 1$$,
  '42501', null, 'cliente não insere raspadinhas diretamente');

-- Outro usuário não marca a raspadinha do anônimo.
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b0', false);
select throws_ok(
  format('select public.af1_mark_scratch_revealed(%L)', (select v #>> '{scratch,id}' from r1)),
  'P0002', 'scratch_not_found', 'usuário B não marca raspadinha do usuário A');
select is((select count(*)::int from public.af1_scratches where user_id = '00000000-0000-0000-0000-0000000000a0'), 0, 'B não enxerga raspadinhas de A');

-- Anônimo cujo prêmio já foi resgatado precisa se cadastrar.
reset role;
update public.af1_scratches set status = 'resgatada' where user_id = '00000000-0000-0000-0000-0000000000a0';
set local role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a0', true);
select is((select public.af1_get_or_create_scratch() ->> 'reason'), 'signup_required', 'anônimo que já usou precisa se cadastrar');

-- Conta: uma por dia (fuso de São Paulo).
reset role;
insert into public.af1_scratches (user_id, sneaker_id, status)
select '00000000-0000-0000-0000-0000000000c0', id, 'resgatada' from public.af1_sneakers order by sort_order limit 1;
set local role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c0', false);
create temp table r2 as select public.af1_get_or_create_scratch() as v;
select is((select v ->> 'reason' from r2), 'daily_limit', 'conta que já raspou hoje fica sem raspadinha');
select is(
  (select (v ->> 'next_available_at')::timestamptz from r2),
  (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day') at time zone 'America/Sao_Paulo',
  'próxima libera à meia-noite de São Paulo');

reset role;
update public.af1_scratches set created_at = now() - interval '1 day' where user_id = '00000000-0000-0000-0000-0000000000c0';
set local role authenticated;
select is((select public.af1_get_or_create_scratch() ->> 'status'), 'available', 'no dia seguinte a conta recebe nova raspadinha');

-- Só sorteia pares ainda bloqueados.
reset role;
insert into public.af1_unlocks (user_id, sneaker_id)
select '00000000-0000-0000-0000-0000000000d0', id from public.af1_sneakers where slug <> 'dourado' and active;
select is(
  (select count(distinct public.af1_draw_sneaker('00000000-0000-0000-0000-0000000000d0'))::int from generate_series(1, 30)),
  1, 'com um único par bloqueado, o sorteio sempre escolhe ele');
insert into public.af1_unlocks (user_id, sneaker_id)
select '00000000-0000-0000-0000-0000000000d0', id from public.af1_sneakers where slug = 'dourado';
set local role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000d0', false);
select is((select public.af1_get_or_create_scratch() ->> 'status'), 'all_unlocked', 'coleção completa: all_unlocked');

-- Raridade: o par raro sai bem menos que cada comum (pesos ajustados só neste teste).
reset role;
update public.af1_sneakers set draw_weight = case slug when 'dourado' then 5 else 30 end;
select ok(
  (with draws as (
     select s.slug
     from generate_series(1, 3000) g
     cross join lateral (select public.af1_draw_sneaker(gen_random_uuid()) as id where g > 0) d
     join public.af1_sneakers s on s.id = d.id
   )
   select (select count(*) from draws where slug = 'dourado')
        < (select count(*) from draws where slug = 'azul') / 2),
  'em 3000 sorteios o raro (peso 5) sai menos da metade do comum (peso 30)');

select * from finish();
rollback;

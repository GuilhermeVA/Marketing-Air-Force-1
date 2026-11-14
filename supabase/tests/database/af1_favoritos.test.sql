-- Testes dos favoritos (PBI-014). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(5);

insert into auth.users (id, email, is_anonymous, aud, role) values
  ('00000000-0000-0000-0000-0000000000f1', 'f1@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000f2', 'f2@example.com', false, 'authenticated', 'authenticated');
insert into public.af1_unlocks (user_id, sneaker_id)
select u.id, s.id from (values ('00000000-0000-0000-0000-0000000000f1'::uuid), ('00000000-0000-0000-0000-0000000000f2'::uuid)) u (id)
cross join (select id from public.af1_sneakers where slug = 'dourado') s;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","role":"authenticated","is_anonymous":false}', true);

update public.af1_unlocks set is_favorite = true;
reset role;
select is((select is_favorite from public.af1_unlocks where user_id = '00000000-0000-0000-0000-0000000000f1'), true, 'usuário favorita o próprio par');
select is((select is_favorite from public.af1_unlocks where user_id = '00000000-0000-0000-0000-0000000000f2'), false, 'update não alcança desbloqueios de outro usuário');
set local role authenticated;

select throws_ok($$update public.af1_unlocks set unlocked_at = now() - interval '1 year'$$, '42501', null, 'não altera a data do desbloqueio');
select throws_ok($$update public.af1_unlocks set sneaker_id = gen_random_uuid()$$, '42501', null, 'não troca o par desbloqueado');
select throws_ok($$delete from public.af1_unlocks$$, '42501', null, 'não apaga desbloqueios');

select * from finish();
rollback;

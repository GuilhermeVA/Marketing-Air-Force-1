-- Testes de acesso dos perfis (PBI-006). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

insert into auth.users (id, email, is_anonymous, aud, role)
values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com', false, 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000c', null, true, 'authenticated', 'authenticated');

insert into public.af1_profiles (id, nickname, consent_at)
values ('00000000-0000-0000-0000-00000000000b', 'Bia', now());

-- Usuário A (conta permanente).
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","is_anonymous":false}';

select lives_ok(
  $$insert into public.af1_profiles (id, nickname, consent_at) values ('00000000-0000-0000-0000-00000000000a', 'Ana', now())$$,
  'A cria o próprio perfil');
select is((select nickname from public.af1_profiles where id = '00000000-0000-0000-0000-00000000000a'), 'Ana', 'A lê o próprio perfil');
select is((select count(*)::int from public.af1_profiles where id = '00000000-0000-0000-0000-00000000000b'), 0, 'A não lê o perfil de B');
select throws_ok(
  $$insert into public.af1_profiles (id, nickname, consent_at) values ('00000000-0000-0000-0000-00000000000b', 'Falso', now())$$,
  '42501', null, 'A não cria perfil em nome de B');
select lives_ok(
  $$update public.af1_profiles set nickname = 'Ana Clara' where id = '00000000-0000-0000-0000-00000000000a'$$,
  'A altera o próprio apelido');
select throws_ok(
  $$update public.af1_profiles set consent_at = now() - interval '1 year' where id = '00000000-0000-0000-0000-00000000000a'$$,
  '42501', null, 'A não altera a data do consentimento');
update public.af1_profiles set nickname = 'Hacker' where id = '00000000-0000-0000-0000-00000000000b';
select throws_ok(
  $$delete from public.af1_profiles where id = '00000000-0000-0000-0000-00000000000a'$$,
  '42501', null, 'cliente não apaga perfis');

-- Usuário anônimo C.
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated","is_anonymous":true}';
select throws_ok(
  $$insert into public.af1_profiles (id, nickname, consent_at) values ('00000000-0000-0000-0000-00000000000c', 'Anon', now())$$,
  '42501', null, 'sessão anônima não cria perfil');

-- Visitante sem sessão.
reset role;
set local role anon;
select throws_ok($$select * from public.af1_profiles$$, '42501', null, 'anon não lê perfis');

reset role;
select is((select nickname from public.af1_profiles where id = '00000000-0000-0000-0000-00000000000b'), 'Bia', 'update de A no perfil de B não teve efeito');
select throws_ok(
  $$insert into public.af1_profiles (id, nickname, consent_at) values ('00000000-0000-0000-0000-00000000000a', '   ', now())$$,
  '23514', null, 'apelido vazio é rejeitado');

select * from finish();
rollback;

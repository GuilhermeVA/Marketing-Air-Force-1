-- Testes de acesso do catálogo (PBI-004). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(16);

-- Dados de teste (como dono do banco, sem RLS).
insert into public.af1_sneakers (id, slug, name, color_name, color_hex, active)
values
  ('00000000-0000-0000-0000-0000000000a1', 'teste-ativo', 'Teste Ativo', 'Cinza', '#808080', true),
  ('00000000-0000-0000-0000-0000000000a2', 'teste-inativo', 'Teste Inativo', 'Cinza', '#808080', false);

insert into public.af1_sneaker_images (sneaker_id, url, alt, position)
values
  ('00000000-0000-0000-0000-0000000000a1', '/x-1.svg', 'Imagem do ativo', 1),
  ('00000000-0000-0000-0000-0000000000a2', '/x-2.svg', 'Imagem do inativo', 1);

-- Regras de integridade.
select throws_ok(
  $$insert into public.af1_sneakers (slug, name, color_name, color_hex) values ('Slug Inválido', 'X', 'X', '#000000')$$,
  '23514', null, 'slug fora do padrão é rejeitado');
select throws_ok(
  $$insert into public.af1_sneakers (slug, name, color_name, color_hex) values ('cor-invalida', 'X', 'X', 'azul')$$,
  '23514', null, 'color_hex fora do formato #rrggbb é rejeitado');
select throws_ok(
  $$insert into public.af1_sneakers (slug, name, color_name, color_hex, draw_weight) values ('peso-zero', 'X', 'X', '#000000', 0)$$,
  '23514', null, 'draw_weight precisa ser maior que zero');
select throws_ok(
  $$insert into public.af1_sneakers (slug, name, color_name, color_hex, rarity) values ('raridade-x', 'X', 'X', '#000000', 'lendaria')$$,
  '23514', null, 'rarity só aceita comum, intermediaria ou rara');
select throws_ok(
  $$insert into public.af1_sneaker_images (sneaker_id, url, alt, position) values ('00000000-0000-0000-0000-0000000000a1', '/y.svg', '  ', 2)$$,
  '23514', null, 'texto alternativo vazio é rejeitado');

-- Visitante anônimo.
set local role anon;

select is(
  (select count(*)::int from public.af1_sneakers where slug like 'teste-%'),
  1, 'anon enxerga só o par ativo');
select is(
  (select count(*)::int from public.af1_sneakers where slug = 'teste-inativo'),
  0, 'anon não enxerga o par inativo');
select is(
  (select count(*)::int from public.af1_sneaker_images where url in ('/x-1.svg', '/x-2.svg')),
  1, 'anon enxerga só as imagens de pares ativos');
select throws_ok(
  $$insert into public.af1_sneakers (slug, name, color_name, color_hex) values ('invasor', 'X', 'X', '#000000')$$,
  '42501', null, 'anon não consegue inserir pares');
select throws_ok(
  $$update public.af1_sneakers set meaning = 'alterado' where slug = 'teste-ativo'$$,
  '42501', null, 'anon não consegue atualizar pares');
select throws_ok(
  $$delete from public.af1_sneakers where slug = 'teste-ativo'$$,
  '42501', null, 'anon não consegue apagar pares');
select throws_ok(
  $$insert into public.af1_sneaker_images (sneaker_id, url, alt) values ('00000000-0000-0000-0000-0000000000a1', '/z.svg', 'Z')$$,
  '42501', null, 'anon não consegue inserir imagens');

-- Usuário autenticado: mesmas regras.
reset role;
set local role authenticated;

select is(
  (select count(*)::int from public.af1_sneakers where slug like 'teste-%'),
  1, 'authenticated enxerga só o par ativo');
select throws_ok(
  $$update public.af1_sneakers set active = true where slug = 'teste-inativo'$$,
  '42501', null, 'authenticated não consegue atualizar pares');
select throws_ok(
  $$delete from public.af1_sneaker_images where url = '/x-1.svg'$$,
  '42501', null, 'authenticated não consegue apagar imagens');

reset role;

select is(
  (select public from storage.buckets where id = 'af1-sneakers'),
  true, 'bucket af1-sneakers existe e é público');

select * from finish();
rollback;

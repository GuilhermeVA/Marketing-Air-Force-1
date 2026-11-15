-- Testes do detalhe do tênis (PBI-015/016). Rodar com: npm run db:test
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

insert into auth.users (id, email, is_anonymous, aud, role) values
  ('00000000-0000-0000-0000-0000000000d1', 'd1@example.com', false, 'authenticated', 'authenticated');
insert into public.af1_unlocks (user_id, sneaker_id, is_favorite)
select '00000000-0000-0000-0000-0000000000d1', id, true from public.af1_sneakers where slug = 'dourado';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated","is_anonymous":false}', true);

select throws_ok($$select meaning from public.af1_sneakers$$, '42501', null, 'cliente não lê meaning direto da tabela');
select throws_ok($$select keywords from public.af1_sneakers$$, '42501', null, 'cliente não lê keywords direto da tabela');
select lives_ok($$select id, slug, name, color_name, color_hex, rarity, sort_order from public.af1_sneakers$$, 'colunas públicas continuam legíveis');

create temp table d as
select public.af1_get_sneaker_detail('dourado') as unlocked, public.af1_get_sneaker_detail('roxo') as locked;

select is((select unlocked ->> 'unlocked' from d), 'true', 'par desbloqueado vem marcado');
select ok((select unlocked ->> 'meaning' from d) like 'O dourado%', 'par desbloqueado traz o significado');
select is((select unlocked ->> 'is_favorite' from d), 'true', 'traz o favorito do usuário');
select ok((select locked -> 'meaning' = 'null'::jsonb and locked -> 'keywords' = 'null'::jsonb from d), 'par bloqueado não traz significado nem palavras-chave');
select is((select jsonb_array_length(locked -> 'images') from d), 3, 'par bloqueado traz as imagens');
select is(public.af1_get_sneaker_detail('nao-existe'), null, 'slug inexistente retorna null');
select ok((select unlocked ->> 'model_image_url' from d) like '%/dourado/modelo.webp', 'par desbloqueado traz a foto de modelo');
select ok((select locked -> 'model_image_url' = 'null'::jsonb from d), 'par bloqueado não traz a foto de modelo');
select throws_ok($$select model_image_url from public.af1_sneakers$$, '42501', null, 'cliente não lê a foto de modelo direto da tabela');
select is(public.af1_get_sneaker_detail('vinho'), null, 'cor retirada do catálogo não abre');

select * from finish();
rollback;

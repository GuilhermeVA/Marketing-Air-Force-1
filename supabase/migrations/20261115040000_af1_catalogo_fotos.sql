-- Catálogo com as 7 cores das fotos reais e foto de modelo usando o par.
-- Textos de cor (palavras-chave e significado) continuam provisórios: o grupo
-- edita pelo painel (docs/02-catalogo-de-tenis/como-editar-o-catalogo.md).

-- Foto de modelo usando o par (exibida abaixo do significado, só para quem desbloqueou).
alter table public.af1_sneakers add column model_image_url text;
comment on column public.af1_sneakers.model_image_url is
  'URL pública da foto de modelo usando o par (bucket af1-sneakers). Opcional.';

-- Pares de exemplo que viram cores das fotos (mantém o id: desbloqueios continuam valendo).
update public.af1_sneakers set slug = 'azul' where slug = 'azul-marinho';
update public.af1_sneakers set slug = 'verde' where slug = 'verde-musgo';

-- Cores sem foto saem do catálogo (inativas preservam o histórico de raspadinhas).
update public.af1_sneakers set active = false where slug in ('vinho', 'laranja');

insert into public.af1_sneakers
  (slug, name, color_name, color_hex, keywords, meaning, rarity, draw_weight, sort_order, active)
values
  ('azul', 'Air Force 1 Azul', 'Azul', '#1d3fbf',
   array['Confiança', 'Estabilidade'],
   'O azul é a cor de quem transmite segurança sem levantar a voz. Confiança, porque é o tom de quem fecha negócios; estabilidade, porque acompanha você da primeira reunião ao último e-mail do dia.',
   'comum', 20, 10, true),
  ('verde', 'Air Force 1 Verde', 'Verde', '#1e7b3a',
   array['Equilíbrio', 'Crescimento'],
   'O verde lembra que carreira também é cultivo. Equilíbrio, para quem sabe a hora de acelerar e a de respirar; crescimento, porque todo grande resultado começa pequeno e constante.',
   'comum', 20, 20, true),
  ('vermelho', 'Air Force 1 Vermelho', 'Vermelho', '#c8102e',
   array['Coragem', 'Atitude'],
   'O vermelho é para quem pede a palavra. Coragem, para defender o que acredita diante de qualquer mesa; atitude, porque presença não se pede, se ocupa.',
   'comum', 20, 30, true),
  ('rosa', 'Air Force 1 Rosa', 'Rosa', '#e8799a',
   array['Empatia', 'Autenticidade'],
   'O rosa é a força de quem lidera ouvindo. Empatia, porque times fortes nascem de quem se importa; autenticidade, porque não há código de vestimenta para ser quem você é.',
   'comum', 20, 40, true),
  ('roxo', 'Air Force 1 Roxo', 'Roxo', '#7b2cbf',
   array['Visão', 'Originalidade'],
   'O roxo é a cor de quem enxerga além da pauta. Visão, para antecipar o próximo passo antes da reunião acabar; originalidade, porque ninguém se destaca repetindo o que todo mundo já faz.',
   'comum', 20, 50, true),
  ('multicolor', 'Air Force 1 Multicolor', 'Multicolor', '#f26b1d',
   array['Criatividade', 'Versatilidade'],
   'O multicolor é para quem não cabe em um tom só. Criatividade, para transformar a planilha em ideia; versatilidade, porque a mesma pessoa conduz a apresentação e o happy hour.',
   'comum', 20, 60, true),
  ('dourado', 'Air Force 1 Dourado', 'Dourado', '#c9a227',
   array['Riqueza', 'Prosperidade'],
   'O dourado é a conquista que se vê de longe. Riqueza, pelo valor do caminho percorrido até aqui; prosperidade, porque quem celebra as próprias vitórias atrai as próximas.',
   'comum', 20, 70, true)
on conflict (slug) do update set
  name = excluded.name,
  color_name = excluded.color_name,
  color_hex = excluded.color_hex,
  keywords = excluded.keywords,
  meaning = excluded.meaning,
  rarity = excluded.rarity,
  draw_weight = excluded.draw_weight,
  sort_order = excluded.sort_order,
  active = excluded.active;

-- Imagens no bucket af1-sneakers (pasta v1/<slug>/): 1 lateral, 2 invertida, 3 frente.
update public.af1_sneakers
set model_image_url =
  'https://lotkxzqrloyqeyaooabp.supabase.co/storage/v1/object/public/af1-sneakers/v1/' || slug || '/modelo.webp'
where slug in ('azul', 'verde', 'vermelho', 'rosa', 'roxo', 'multicolor', 'dourado');

delete from public.af1_sneaker_images i
using public.af1_sneakers s
where i.sneaker_id = s.id
  and s.slug in ('azul', 'verde', 'vermelho', 'rosa', 'roxo', 'multicolor', 'dourado');

insert into public.af1_sneaker_images (sneaker_id, url, alt, position)
select
  s.id,
  'https://lotkxzqrloyqeyaooabp.supabase.co/storage/v1/object/public/af1-sneakers/v1/' || s.slug || '/' || v.n || '.webp',
  s.name || ', ' || v.description,
  v.n
from public.af1_sneakers s
cross join (
  values (1, 'vista lateral'), (2, 'vista lateral invertida'), (3, 'detalhe da parte da frente')
) as v (n, description)
where s.slug in ('azul', 'verde', 'vermelho', 'rosa', 'roxo', 'multicolor', 'dourado');

-- Detalhe do par: inclui a foto de modelo, só para pares desbloqueados.
create or replace function public.af1_get_sneaker_detail(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with s as (
    select * from public.af1_sneakers where slug = p_slug and active
  ),
  u as (
    select un.* from public.af1_unlocks un, s
    where un.user_id = auth.uid() and un.sneaker_id = s.id
  )
  select jsonb_build_object(
    'id', s.id,
    'slug', s.slug,
    'name', s.name,
    'color_name', s.color_name,
    'color_hex', s.color_hex,
    'rarity', s.rarity,
    'unlocked', exists (select 1 from u),
    'is_favorite', coalesce((select is_favorite from u), false),
    'keywords', case when exists (select 1 from u) then to_jsonb(s.keywords) end,
    'meaning', case when exists (select 1 from u) then s.meaning end,
    'model_image_url', case when exists (select 1 from u) then s.model_image_url end,
    'images', coalesce((
      select jsonb_agg(jsonb_build_object('id', i.id, 'url', i.url, 'alt', i.alt, 'position', i.position) order by i.position)
      from public.af1_sneaker_images i where i.sneaker_id = s.id
    ), '[]'::jsonb)
  )
  from s
$$;
revoke all on function public.af1_get_sneaker_detail(text) from public, anon;
grant execute on function public.af1_get_sneaker_detail(text) to authenticated;

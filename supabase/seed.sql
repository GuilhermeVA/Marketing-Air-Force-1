-- Conteúdo de EXEMPLO do catálogo (PBI-004). Cores, palavras-chave e textos são
-- provisórios: o grupo substitui pelo painel do Supabase (ver
-- docs/02-catalogo-de-tenis/como-editar-o-catalogo.md).
-- Idempotente: pode rodar mais de uma vez sem duplicar nem sobrescrever edições.

insert into public.af1_sneakers
  (slug, name, color_name, color_hex, keywords, meaning, rarity, draw_weight, sort_order)
values
  ('azul-marinho', 'Air Force 1 Azul-Marinho', 'Azul-marinho', '#1f3a5f',
   array['Confiança', 'Estabilidade'],
   'O azul-marinho é a cor de quem transmite segurança sem levantar a voz. Confiança, porque é o tom dos ternos que fecham negócios; estabilidade, porque acompanha você da primeira reunião ao último e-mail do dia.',
   'comum', 30, 10),
  ('verde-musgo', 'Air Force 1 Verde-Musgo', 'Verde-musgo', '#4a5d3a',
   array['Equilíbrio', 'Crescimento'],
   'O verde-musgo lembra que carreira também é cultivo. Equilíbrio, para quem sabe a hora de acelerar e a de respirar; crescimento, porque todo grande resultado começa pequeno e constante.',
   'comum', 30, 20),
  ('vinho', 'Air Force 1 Vinho', 'Vinho', '#7a1f2b',
   array['Ambição', 'Sofisticação'],
   'O vinho é a cor de quem sabe aonde quer chegar. Ambição, pela intensidade que não precisa de volume; sofisticação, porque melhora com o tempo, como as boas decisões.',
   'comum', 25, 30),
  ('laranja', 'Air Force 1 Laranja', 'Laranja', '#e4572e',
   array['Energia', 'Criatividade'],
   'O laranja é a ideia que muda o rumo da reunião. Energia, para começar a segunda-feira como se fosse sexta; criatividade, porque as melhores soluções raramente vêm em tons de cinza.',
   'intermediaria', 15, 40),
  ('vermelho', 'Air Force 1 Vermelho', 'Vermelho', '#c8102e',
   array['Coragem', 'Atitude'],
   'O vermelho é para quem pede a palavra. Coragem, para defender o que acredita diante de qualquer mesa; atitude, porque presença não se pede, se ocupa.',
   'intermediaria', 15, 50),
  ('dourado', 'Air Force 1 Dourado', 'Dourado', '#c9a227',
   array['Riqueza', 'Prosperidade'],
   'O dourado é a conquista que se vê de longe. Riqueza, pelo valor do caminho percorrido até aqui; prosperidade, porque quem celebra as próprias vitórias atrai as próximas.',
   'rara', 5, 60)
on conflict (slug) do nothing;

-- Três imagens placeholder por par (servidas pelo próprio app em /placeholders).
insert into public.af1_sneaker_images (sneaker_id, url, alt, position)
select
  s.id,
  '/placeholders/' || s.slug || '-' || v.n || '.svg',
  s.name || ', ' || v.description || ' (ilustração de exemplo)',
  v.n
from public.af1_sneakers s
cross join (
  values
    (1, 'vista lateral'),
    (2, 'vista lateral invertida'),
    (3, 'detalhe da parte da frente')
) as v (n, description)
where s.slug in ('azul-marinho', 'verde-musgo', 'vinho', 'laranja', 'vermelho', 'dourado')
  and not exists (
    select 1 from public.af1_sneaker_images i where i.sneaker_id = s.id
  );

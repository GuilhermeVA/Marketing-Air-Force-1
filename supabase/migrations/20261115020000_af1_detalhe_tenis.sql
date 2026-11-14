-- Tela do tênis (PBI-015/016): o significado só chega ao cliente para pares desbloqueados.

-- O cliente deixa de ler keywords, meaning e draw_weight diretamente.
revoke select on table public.af1_sneakers from anon, authenticated;
grant select (id, slug, name, color_name, color_hex, rarity, sort_order, active, created_at)
  on table public.af1_sneakers to anon, authenticated;

-- Detalhe de um par para a tela do tênis. Para pares bloqueados, keywords e
-- meaning vêm nulos. Retorna null se o par não existir ou estiver inativo.
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
    'images', coalesce((
      select jsonb_agg(jsonb_build_object('id', i.id, 'url', i.url, 'alt', i.alt, 'position', i.position) order by i.position)
      from public.af1_sneaker_images i where i.sneaker_id = s.id
    ), '[]'::jsonb)
  )
  from s
$$;
revoke all on function public.af1_get_sneaker_detail(text) from public, anon;
grant execute on function public.af1_get_sneaker_detail(text) to authenticated;

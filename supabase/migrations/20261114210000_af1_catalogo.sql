-- Catálogo de tênis da campanha "Código de Cor" (PBI-004).
-- Conteúdo público e somente leitura para o cliente; a edição é feita pelo
-- painel do Supabase (Table Editor), que não passa pelo RLS.

create table public.af1_sneakers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  color_name text not null check (length(trim(color_name)) > 0),
  color_hex text not null check (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  keywords text[] not null default '{}',
  meaning text not null default '',
  rarity text not null default 'comum' check (rarity in ('comum', 'intermediaria', 'rara')),
  draw_weight integer not null default 10 check (draw_weight > 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.af1_sneakers is
  'Catálogo de pares da campanha. Editável pelo Table Editor; o app só lê.';
comment on column public.af1_sneakers.slug is
  'Identificador na URL (/tenis/<slug>): minúsculas, números e hífens.';
comment on column public.af1_sneakers.color_hex is
  'Cor de destaque da tela, no formato #rrggbb.';
comment on column public.af1_sneakers.keywords is
  'Palavras-chave do que a cor simboliza (lista curta).';
comment on column public.af1_sneakers.draw_weight is
  'Peso no sorteio da raspadinha: quanto maior, mais comum.';
comment on column public.af1_sneakers.active is
  'Pares inativos não aparecem no app nem entram no sorteio.';

create table public.af1_sneaker_images (
  id uuid primary key default gen_random_uuid(),
  sneaker_id uuid not null references public.af1_sneakers (id) on delete cascade,
  url text not null check (length(trim(url)) > 0),
  alt text not null check (length(trim(alt)) > 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (sneaker_id, position)
);

comment on table public.af1_sneaker_images is
  'Imagens do carrossel de cada par, ordenadas por position.';
comment on column public.af1_sneaker_images.url is
  'URL pública da imagem (bucket af1-sneakers) ou caminho do app (/placeholders/...).';
comment on column public.af1_sneaker_images.alt is
  'Texto alternativo (acessibilidade). Obrigatório.';

-- Acesso: o cliente (anon/authenticated) só pode ler, e só pares ativos.
alter table public.af1_sneakers enable row level security;
alter table public.af1_sneaker_images enable row level security;

revoke all on table public.af1_sneakers from anon, authenticated;
revoke all on table public.af1_sneaker_images from anon, authenticated;
grant select on table public.af1_sneakers to anon, authenticated;
grant select on table public.af1_sneaker_images to anon, authenticated;

create policy af1_sneakers_select_active
  on public.af1_sneakers
  for select
  to anon, authenticated
  using (active);

create policy af1_sneaker_images_select_active
  on public.af1_sneaker_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.af1_sneakers s
      where s.id = af1_sneaker_images.sneaker_id
        and s.active
    )
  );

-- Bucket público para as imagens dos pares. Os uploads são feitos pelo painel;
-- sem policies em storage.objects, o cliente não consegue enviar nem apagar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'af1-sneakers',
  'af1-sneakers',
  true,
  2097152, -- 2 MB por imagem
  array['image/webp', 'image/avif', 'image/png', 'image/jpeg', 'image/svg+xml']
)
on conflict (id) do nothing;

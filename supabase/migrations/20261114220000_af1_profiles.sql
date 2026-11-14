-- Perfis dos clientes cadastrados (PBI-006). Só contas permanentes têm perfil:
-- a sessão anônima vira conta no cadastro e o perfil é criado logo em seguida.

create table public.af1_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (length(trim(nickname)) between 1 and 40),
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.af1_profiles is
  'Perfil mínimo (LGPD): apelido e data do consentimento. O e-mail fica em auth.users.';
comment on column public.af1_profiles.consent_at is
  'Momento em que o cliente aceitou o termo de privacidade, no cadastro.';

alter table public.af1_profiles enable row level security;

revoke all on table public.af1_profiles from anon, authenticated;
grant select, insert on table public.af1_profiles to authenticated;
grant update (nickname) on table public.af1_profiles to authenticated;

-- Usuário anônimo ainda não tem conta: não pode criar perfil.
create policy af1_profiles_insert_own
  on public.af1_profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );

create policy af1_profiles_select_own
  on public.af1_profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy af1_profiles_update_own
  on public.af1_profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

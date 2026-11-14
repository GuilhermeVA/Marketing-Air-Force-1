-- Favoritos no closet (PBI-014): o usuário só altera is_favorite dos próprios desbloqueios.

alter table public.af1_unlocks add column is_favorite boolean not null default false;

grant update (is_favorite) on table public.af1_unlocks to authenticated;

create policy af1_unlocks_update_own_favorite
  on public.af1_unlocks
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

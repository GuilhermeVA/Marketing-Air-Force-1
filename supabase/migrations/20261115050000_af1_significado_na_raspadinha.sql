-- O significado do par aparece na própria raspadinha logo após a revelação.
-- Antes de revelar (status 'livre'), keywords e meaning continuam fora da resposta.

create or replace function public.af1_scratch_payload(p_scratch public.af1_scratches)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'status', 'available',
    'scratch', jsonb_build_object(
      'id', p_scratch.id,
      'status', p_scratch.status,
      'created_at', p_scratch.created_at,
      'revealed_at', p_scratch.revealed_at
    ),
    'sneaker', jsonb_build_object(
      'id', s.id, 'slug', s.slug, 'name', s.name,
      'color_name', s.color_name, 'color_hex', s.color_hex,
      'keywords', case when p_scratch.status <> 'livre' then to_jsonb(s.keywords) end,
      'meaning', case when p_scratch.status <> 'livre' then s.meaning end,
      'image', (
        select jsonb_build_object('url', i.url, 'alt', i.alt)
        from public.af1_sneaker_images i
        where i.sneaker_id = s.id
        order by i.position
        limit 1
      )
    )
  )
  from public.af1_sneakers s
  where s.id = p_scratch.sneaker_id
$$;
revoke all on function public.af1_scratch_payload(public.af1_scratches) from public, anon, authenticated;

-- Marcar como revelada passa a devolver a raspadinha completa (com o significado).
create or replace function public.af1_mark_scratch_revealed(p_scratch_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_scratch public.af1_scratches;
begin
  update public.af1_scratches
  set status = 'revelada', revealed_at = now()
  where id = p_scratch_id and user_id = auth.uid() and status = 'livre'
  returning * into v_scratch;

  if not found then
    select * into v_scratch from public.af1_scratches
    where id = p_scratch_id and user_id = auth.uid();
    if not found then
      raise exception 'scratch_not_found' using errcode = 'P0002';
    end if;
  end if;

  return public.af1_scratch_payload(v_scratch);
end;
$$;
revoke all on function public.af1_mark_scratch_revealed(uuid) from public, anon;
grant execute on function public.af1_mark_scratch_revealed(uuid) to authenticated;

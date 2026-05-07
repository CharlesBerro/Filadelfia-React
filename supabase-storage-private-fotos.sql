-- Private Storage policies for fotos_personas.
-- Run this in Supabase SQL Editor, then make the bucket private in
-- Storage > Buckets > fotos_personas > Settings if it is currently public.

begin;

create or replace function app_security.storage_owner_sede_id(object_name text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  with first_folder as (
    select nullif((storage.foldername(object_name))[1], '')::uuid as id
  )
  select coalesce(
    (
      select s.id
      from public.sedes s, first_folder f
      where s.id = f.id
      limit 1
    ),
    (
      select p.sede_id
      from public.profiles p, first_folder f
      where p.id = f.id
      limit 1
    )
  )
$$;

create or replace function app_security.can_access_person_photo(object_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    app_security.is_admin()
    or app_security.current_sede_id() = app_security.storage_owner_sede_id(object_name),
    false
  )
$$;

grant execute on function app_security.storage_owner_sede_id(text) to authenticated;
grant execute on function app_security.can_access_person_photo(text) to authenticated;

drop policy if exists "fotos_personas_select_by_sede" on storage.objects;
create policy "fotos_personas_select_by_sede"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'fotos_personas'
  and app_security.can_access_person_photo(name)
);

drop policy if exists "fotos_personas_insert_own_folder" on storage.objects;
create policy "fotos_personas_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fotos_personas'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or app_security.can_access_sede(nullif((storage.foldername(name))[1], '')::uuid)
  )
);

drop policy if exists "fotos_personas_update_by_sede" on storage.objects;
create policy "fotos_personas_update_by_sede"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'fotos_personas'
  and app_security.can_access_person_photo(name)
)
with check (
  bucket_id = 'fotos_personas'
  and app_security.can_access_person_photo(name)
);

drop policy if exists "fotos_personas_delete_by_sede" on storage.objects;
create policy "fotos_personas_delete_by_sede"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'fotos_personas'
  and app_security.can_access_person_photo(name)
);

commit;

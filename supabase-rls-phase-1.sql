-- Phase 1: base RLS model for Filadelfia.
-- Run this in Supabase SQL Editor.
--
-- Role rules:
-- - admin: all sedes, full CRUD, accounting included.
-- - lider: own sede, CRUD, accounting included.
-- - organizador: own sede, CRUD for people/follow-up, no accounting.
-- - formador: only assigned follow-up groups and their people.

begin;

create schema if not exists app_security;

create or replace function app_security.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select p.role::text
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function app_security.current_sede_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.sede_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function app_security.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(app_security.current_role() = 'admin', false)
$$;

create or replace function app_security.has_any_role(roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(app_security.current_role() = any(roles), false)
$$;

create or replace function app_security.can_access_sede(target_sede_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    app_security.is_admin()
    or (
      target_sede_id is not null
      and app_security.current_sede_id() = target_sede_id
    ),
    false
  )
$$;

create or replace function app_security.can_manage_people(target_sede_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    app_security.has_any_role(array['admin'])
    or (
      app_security.has_any_role(array['lider', 'organizador'])
      and app_security.current_sede_id() = target_sede_id
    ),
    false
  )
$$;

create or replace function app_security.can_manage_accounting(target_sede_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    app_security.has_any_role(array['admin'])
    or (
      app_security.has_any_role(array['lider'])
      and app_security.current_sede_id() = target_sede_id
    ),
    false
  )
$$;

grant usage on schema app_security to authenticated;
grant execute on all functions in schema app_security to authenticated;
revoke all on schema app_security from anon;

-- Enable RLS on exposed tables.
alter table public.profiles enable row level security;
alter table public.sedes enable row level security;
alter table public.persona enable row level security;
alter table public.transacciones enable row level security;
alter table public.categorias enable row level security;
alter table public.actividades enable row level security;
alter table public.ministerios enable row level security;
alter table public.escala_de_crecimiento enable row level security;
alter table public.grupos_escala enable row level security;
alter table public.persona_escala enable row level security;

-- Remove common overly-open policy names if they exist.
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Enable read access for all users" on public.sedes;
drop policy if exists "Enable read access for all users" on public.persona;
drop policy if exists "Enable read access for all users" on public.transacciones;
drop policy if exists "Enable read access for all users" on public.categorias;
drop policy if exists "Enable read access for all users" on public.actividades;
drop policy if exists "Enable read access for all users" on public.ministerios;
drop policy if exists "Enable read access for all users" on public.escala_de_crecimiento;
drop policy if exists "Enable read access for all users" on public.grupos_escala;
drop policy if exists "Enable read access for all users" on public.persona_escala;

-- profiles: own profile for login; admin manages all.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or app_security.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert"
on public.profiles
for insert
to authenticated
with check (app_security.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (app_security.is_admin())
with check (app_security.is_admin());

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete"
on public.profiles
for delete
to authenticated
using (app_security.is_admin() and id <> auth.uid());

-- sedes: admin all; other roles only their own sede.
drop policy if exists "sedes_select_by_role" on public.sedes;
create policy "sedes_select_by_role"
on public.sedes
for select
to authenticated
using (app_security.can_access_sede(id));

drop policy if exists "sedes_admin_crud" on public.sedes;
create policy "sedes_admin_crud"
on public.sedes
for all
to authenticated
using (app_security.is_admin())
with check (app_security.is_admin());

-- people: admin all; lider/organizador by sede; formador can see people in assigned groups.
drop policy if exists "persona_select_by_role" on public.persona;
create policy "persona_select_by_role"
on public.persona
for select
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or exists (
    select 1
    from public.persona_escala pe
    join public.grupos_escala ge on ge.id = pe.grupo_id
    where pe.persona_id = persona.id
      and ge.formador_id = auth.uid()
  )
);

drop policy if exists "persona_insert_by_role" on public.persona;
create policy "persona_insert_by_role"
on public.persona
for insert
to authenticated
with check (
  user_id = auth.uid()
  and app_security.can_manage_people(sede_id)
);

drop policy if exists "persona_update_by_role" on public.persona;
create policy "persona_update_by_role"
on public.persona
for update
to authenticated
using (app_security.can_manage_people(sede_id))
with check (app_security.can_manage_people(sede_id));

drop policy if exists "persona_delete_by_role" on public.persona;
create policy "persona_delete_by_role"
on public.persona
for delete
to authenticated
using (app_security.can_manage_people(sede_id));

-- accounting: only admin and lider.
drop policy if exists "transacciones_select_by_accounting_role" on public.transacciones;
create policy "transacciones_select_by_accounting_role"
on public.transacciones
for select
to authenticated
using (app_security.can_manage_accounting(sede_id));

drop policy if exists "transacciones_insert_by_accounting_role" on public.transacciones;
create policy "transacciones_insert_by_accounting_role"
on public.transacciones
for insert
to authenticated
with check (
  user_id = auth.uid()
  and app_security.can_manage_accounting(sede_id)
);

drop policy if exists "transacciones_update_by_accounting_role" on public.transacciones;
create policy "transacciones_update_by_accounting_role"
on public.transacciones
for update
to authenticated
using (app_security.can_manage_accounting(sede_id))
with check (app_security.can_manage_accounting(sede_id));

drop policy if exists "transacciones_delete_by_accounting_role" on public.transacciones;
create policy "transacciones_delete_by_accounting_role"
on public.transacciones
for delete
to authenticated
using (app_security.can_manage_accounting(sede_id));

-- categories and activities are used by accounting screens.
-- If they are global catalogs, consider allowing SELECT to all authenticated users.
drop policy if exists "categorias_select_authenticated" on public.categorias;
create policy "categorias_select_authenticated"
on public.categorias
for select
to authenticated
using (true);

drop policy if exists "categorias_admin_crud" on public.categorias;
create policy "categorias_admin_crud"
on public.categorias
for all
to authenticated
using (app_security.is_admin())
with check (app_security.is_admin());

drop policy if exists "actividades_select_accounting_roles" on public.actividades;
create policy "actividades_select_accounting_roles"
on public.actividades
for select
to authenticated
using (
  app_security.has_any_role(array['admin', 'lider'])
  or user_id = auth.uid()
);

drop policy if exists "actividades_crud_accounting_roles" on public.actividades;
create policy "actividades_crud_accounting_roles"
on public.actividades
for all
to authenticated
using (
  app_security.is_admin()
  or (
    app_security.has_any_role(array['lider'])
    and user_id = auth.uid()
  )
)
with check (
  app_security.is_admin()
  or (
    app_security.has_any_role(array['lider'])
    and user_id = auth.uid()
  )
);

-- public catalogs for authenticated users only.
drop policy if exists "ministerios_select_authenticated" on public.ministerios;
create policy "ministerios_select_authenticated"
on public.ministerios
for select
to authenticated
using (true);

drop policy if exists "ministerios_admin_crud" on public.ministerios;
create policy "ministerios_admin_crud"
on public.ministerios
for all
to authenticated
using (app_security.is_admin())
with check (app_security.is_admin());

drop policy if exists "escala_select_authenticated" on public.escala_de_crecimiento;
create policy "escala_select_authenticated"
on public.escala_de_crecimiento
for select
to authenticated
using (true);

drop policy if exists "escala_admin_crud" on public.escala_de_crecimiento;
create policy "escala_admin_crud"
on public.escala_de_crecimiento
for all
to authenticated
using (app_security.is_admin())
with check (app_security.is_admin());

-- follow-up groups.
drop policy if exists "grupos_select_by_role" on public.grupos_escala;
create policy "grupos_select_by_role"
on public.grupos_escala
for select
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or formador_id = auth.uid()
);

drop policy if exists "grupos_insert_by_role" on public.grupos_escala;
create policy "grupos_insert_by_role"
on public.grupos_escala
for insert
to authenticated
with check (
  created_by = auth.uid()
  and app_security.can_manage_people(sede_id)
);

drop policy if exists "grupos_update_by_role" on public.grupos_escala;
create policy "grupos_update_by_role"
on public.grupos_escala
for update
to authenticated
using (app_security.can_manage_people(sede_id))
with check (app_security.can_manage_people(sede_id));

drop policy if exists "grupos_delete_by_role" on public.grupos_escala;
create policy "grupos_delete_by_role"
on public.grupos_escala
for delete
to authenticated
using (app_security.can_manage_people(sede_id));

-- follow-up enrollments.
drop policy if exists "persona_escala_select_by_role" on public.persona_escala;
create policy "persona_escala_select_by_role"
on public.persona_escala
for select
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or exists (
    select 1
    from public.grupos_escala ge
    where ge.id = persona_escala.grupo_id
      and ge.formador_id = auth.uid()
  )
);

drop policy if exists "persona_escala_insert_by_role" on public.persona_escala;
create policy "persona_escala_insert_by_role"
on public.persona_escala
for insert
to authenticated
with check (
  created_by = auth.uid()
  and app_security.can_manage_people(sede_id)
);

drop policy if exists "persona_escala_update_by_role" on public.persona_escala;
create policy "persona_escala_update_by_role"
on public.persona_escala
for update
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or exists (
    select 1
    from public.grupos_escala ge
    where ge.id = persona_escala.grupo_id
      and ge.formador_id = auth.uid()
  )
)
with check (
  app_security.can_manage_people(sede_id)
  or exists (
    select 1
    from public.grupos_escala ge
    where ge.id = persona_escala.grupo_id
      and ge.formador_id = auth.uid()
  )
);

drop policy if exists "persona_escala_delete_by_role" on public.persona_escala;
create policy "persona_escala_delete_by_role"
on public.persona_escala
for delete
to authenticated
using (app_security.can_manage_people(sede_id));

commit;

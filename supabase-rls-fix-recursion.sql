-- Fix infinite recursion caused by policies that query tables with their own RLS chains.
-- Run this in Supabase SQL Editor after supabase-rls-phase-1.sql.

begin;

create or replace function app_security.is_formador_for_persona(target_persona_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.persona_escala pe
    join public.grupos_escala ge on ge.id = pe.grupo_id
    where pe.persona_id = target_persona_id
      and ge.formador_id = auth.uid()
  )
$$;

create or replace function app_security.is_formador_for_grupo(target_grupo_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.grupos_escala ge
    where ge.id = target_grupo_id
      and ge.formador_id = auth.uid()
  )
$$;

grant execute on function app_security.is_formador_for_persona(uuid) to authenticated;
grant execute on function app_security.is_formador_for_grupo(uuid) to authenticated;

drop policy if exists "persona_select_by_role" on public.persona;
create policy "persona_select_by_role"
on public.persona
for select
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or app_security.is_formador_for_persona(id)
);

drop policy if exists "persona_escala_select_by_role" on public.persona_escala;
create policy "persona_escala_select_by_role"
on public.persona_escala
for select
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or app_security.is_formador_for_grupo(grupo_id)
);

drop policy if exists "persona_escala_update_by_role" on public.persona_escala;
create policy "persona_escala_update_by_role"
on public.persona_escala
for update
to authenticated
using (
  app_security.can_manage_people(sede_id)
  or app_security.is_formador_for_grupo(grupo_id)
)
with check (
  app_security.can_manage_people(sede_id)
  or app_security.is_formador_for_grupo(grupo_id)
);

commit;

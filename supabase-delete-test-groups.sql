-- Limpia los grupos de seguimiento de prueba.
-- Ejecutar solo si realmente quieres eliminar todos los grupos creados en el módulo de Seguimiento.

begin;

-- Primero borrar inscripciones relacionadas para evitar errores por claves foráneas.
delete from persona_escala
where grupo_id is not null;

-- Luego borrar los grupos de escala.
delete from grupos_escala;

commit;

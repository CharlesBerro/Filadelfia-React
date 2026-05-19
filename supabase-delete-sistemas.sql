-- Elimina la sede SISTEMAS solo si ya no tiene dependencias activas.
-- Si existen personas o usuarios apuntando a esta sede, primero reasignarlos a RABOLARGO.

begin;

-- Verifica cuántas personas siguen en SISTEMAS
select count(*) as personas_en_sistemas
from persona p
join sedes s on s.id = p.sede_id
where s.nombre_sede = 'SISTEMAS';

-- Reasignar personas de SISTEMAS a RABOLARGO
update persona
set sede_id = (
  select id from sedes where nombre_sede = 'RABOLARGO' limit 1
)
where sede_id = (
  select id from sedes where nombre_sede = 'SISTEMAS' limit 1
);

-- Reasignar usuarios/admins de SISTEMAS a RABOLARGO si aplica
update users
set sede_id = (
  select id from sedes where nombre_sede = 'RABOLARGO' limit 1
)
where sede_id = (
  select id from sedes where nombre_sede = 'SISTEMAS' limit 1
);

-- Ahora sí, borrar la sede SISTEMAS
delete from sedes
where nombre_sede = 'SISTEMAS';

commit;

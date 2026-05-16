-- Normaliza valores históricos de estado civil en personas
update persona
set estado_civil = case
  when estado_civil in ('Soltero', 'Soltera', 'Soltero(a)', 'Soltera(a)') then 'Soltero(a)'
  when estado_civil in ('Casado', 'Casada', 'Casado(a)', 'Casada(a)') then 'Casado(a)'
  when estado_civil in ('Divorciado', 'Divorciada', 'Divorciado(a)', 'Divorciada(a)') then 'Divorciado(a)'
  when estado_civil in ('Union Libre', 'Unión Libre', 'Union libre', 'Unión libre') then 'Unión Libre'
  when estado_civil in ('Viudo', 'Viuda') then 'Viudo'
  else estado_civil
end
where estado_civil is not null;

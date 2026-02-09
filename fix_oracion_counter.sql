-- Función segura para incrementar el contador de oraciones
-- Se ejecuta con permisos de definidor (admin) para evitar bloqueos de RLS
create or replace function incrementar_oracion(row_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update public.pedidos_oracion
  set contador_oraciones = coalesce(contador_oraciones, 0) + 1
  where id = row_id;
end;
$$;

-- También arreglamos los datos existentes por si acaso
update public.pedidos_oracion set contador_oraciones = 0 where contador_oraciones is null;

-- Y definimos el default para futuros inserts
alter table public.pedidos_oracion alter column contador_oraciones set default 0;

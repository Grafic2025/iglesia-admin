-- Actualiza los nombres de solicitantes vacíos usando los datos de la tabla miembros
UPDATE public.pedidos_oracion
SET nombre_solicitante = m.nombre || ' ' || COALESCE(m.apellido, '')
FROM public.miembros m
WHERE public.pedidos_oracion.miembro_id = m.id
AND public.pedidos_oracion.nombre_solicitante IS NULL;

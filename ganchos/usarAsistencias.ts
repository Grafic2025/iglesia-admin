import { usarQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../libreria/supabase';
import { Asistencia, AsistenciaDiaria } from '../libreria/tipos';

const ARRAY_VACIO: any[] = [];

export const usarAsistencias = (fechaSeleccionada: string) => {

    const { data: datos, isLoading: estaCargando, isFetching: estaBuscando, refetch: recargar } = usarQuery({
        queryKey: ['asistencias_dia_y_stats', fechaSeleccionada],
        queryFn: async () => {
            // Obtener asistencias del día
            const { data: asistenciasDia, error: error1 } = await supabase
                .from('asistencias')
                .select('*, miembros(nombre, apellido, created_at, token_notificacion, es_servidor)')
                .eq('fecha', fechaSeleccionada)
                .order('hora_entrada', { ascending: false });

            if (error1) throw error1;

            // Calcular los últimos 7 días terminando en el día de hoy (en Argentina)
            const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
            const ultimos7 = [...Array(7)].map((_, i) => {
                const d = new Date(hoy);
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString("en-CA");
            });

            const { data: asistencias7Dias, error: error2 } = await supabase
                .from('asistencias')
                .select('fecha')
                .in('fecha', ultimos7);

            if (error2) throw error2;

            const conteos = ultimos7.map(f => ({
                dia: f.split('-').slice(1).reverse().join('/'), // DD/MM
                total: asistencias7Dias.filter(a => a.fecha === f).length
            }));

            return {
                asistencias: asistenciasDia || ARRAY_VACIO,
                datosGrafico: conteos || ARRAY_VACIO
            };
        },
        staleTime: 1000 * 60 * 2, // 2 minutos de cache
    });

    return {
        asistencias: (datos?.asistencias || ARRAY_VACIO) as Asistencia[],
        asistencias7dias: (datos?.datosGrafico || ARRAY_VACIO) as AsistenciaDiaria[],
        cargando: estaCargando || estaBuscando,
        obtenerAsistencias: useCallback(async () => { await recargar(); }, [recargar]),
        obtenerAsistencias7Dias: useCallback(async () => { await recargar(); }, [recargar])
    };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useAsistencias = (fechaSeleccionada: string) => {

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['asistencias_dia_y_stats', fechaSeleccionada],
        queryFn: async () => {
            // Fetch asistencias del dia
            const { data: asistDay, error: err1 } = await supabase
                .from('asistencias')
                .select('*, miembros(nombre, apellido, created_at, token_notificacion, es_servidor)')
                .eq('fecha', fechaSeleccionada)
                .order('hora_entrada', { ascending: false });

            if (err1) throw err1;

            // Fetch chart 7 dias
            const last7 = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
            });

            const { data: asist7, error: err2 } = await supabase
                .from('asistencias')
                .select('fecha')
                .in('fecha', last7);

            if (err2) throw err2;

            const counts = last7.map(f => ({
                dia: f.split('-').slice(1).reverse().join('/'), // DD/MM
                total: asist7.filter(a => a.fecha === f).length
            }));

            return {
                asistencias: asistDay || [],
                chartData: counts || []
            };
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    return {
        asistencias: data?.asistencias || [],
        asistencias7dias: data?.chartData || [],
        loading: isLoading || isFetching,
        fetchAsistencias: async () => { await refetch(); },
        fetchAsistencias7dias: async () => { await refetch(); }
    };
};

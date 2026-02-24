import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAsistencias = (fechaSeleccionada: string) => {
    const [asistencias, setAsistencias] = useState<any[]>([]);
    const [asistencias7dias, setAsistencias7dias] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAsistencias = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('asistencias')
                .select('*, miembros(nombre, apellido, created_at, token_notificacion, es_servidor)')
                .eq('fecha', fechaSeleccionada)
                .order('hora_entrada', { ascending: false });
            if (error) throw error;
            setAsistencias(data || []);
        } catch (error) {
            console.error('Error fetching asistencias:', error);
        } finally {
            setLoading(false);
        }
    }, [fechaSeleccionada]);

    const fetchAsistencias7dias = useCallback(async () => {
        const last7 = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
        });

        const { data, error } = await supabase
            .from('asistencias')
            .select('fecha')
            .in('fecha', last7);

        if (!error && data) {
            const counts = last7.map(f => ({
                dia: f.split('-').slice(1).reverse().join('/'), // DD/MM
                total: data.filter(a => a.fecha === f).length
            }));
            setAsistencias7dias(counts);
        }
    }, []);

    return { asistencias, asistencias7dias, loading, fetchAsistencias, fetchAsistencias7dias };
};

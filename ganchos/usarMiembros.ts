import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../libreria/supabase';
import { Miembro } from '../libreria/tipos';

const ARRAY_VACIO: Miembro[] = [];

export const usarMiembros = () => {

    const { data: miembros, isLoading: estaCargando, isFetching: estaBuscando, refetch: recargar } = useQuery<Miembro[]>({
        queryKey: ['administrador_miembros'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('miembros')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            return (data as Miembro[]) || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
    });

    const alternarEstadoServidor = useCallback(async (id: string, estadoActual: boolean) => {
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: !estadoActual })
            .eq('id', id);
        if (!error) await recargar();
        return { error };
    }, [recargar]);

    return {
        miembros: miembros || ARRAY_VACIO,
        cargando: estaCargando || estaBuscando,
        obtenerMiembros: useCallback(async () => { await recargar(); }, [recargar]),
        alternarEstadoServidor
    };
};


import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useMiembros = () => {

    const { data: miembros, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin_miembros'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('miembros')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
    });

    const toggleServerStatus = useCallback(async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: !currentStatus })
            .eq('id', id);
        if (!error) await refetch();
        return { error };
    }, [refetch]);

    return {
        miembros: miembros || [],
        loading: isLoading || isFetching,
        fetchMiembros: async () => { await refetch(); },
        toggleServerStatus
    };
};

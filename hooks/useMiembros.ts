import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useMiembros = () => {
    const [miembros, setMiembros] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMiembros = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('miembros')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setMiembros(data || []);
        } catch (error) {
            console.error('Error fetching miembros:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleServerStatus = useCallback(async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: !currentStatus })
            .eq('id', id);
        if (!error) await fetchMiembros();
        return { error };
    }, [fetchMiembros]);

    return { miembros, loading, fetchMiembros, toggleServerStatus };
};

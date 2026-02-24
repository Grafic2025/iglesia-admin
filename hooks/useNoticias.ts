import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useNoticias = () => {
    const [noticias, setNoticias] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNoticias = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setNoticias(data || []);
        } catch (error) {
            console.error('Error fetching noticias:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const syncYouTube = useCallback(async () => {
        try {
            const res = await fetch('/api/youtube-sync');
            const data = await res.json();
            if (data.success) {
                await fetchNoticias();
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Error de conexión' };
        }
    }, [fetchNoticias]);

    const eliminarNoticia = useCallback(async (id: string) => {
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (!error) await fetchNoticias();
        return { error };
    }, [fetchNoticias]);

    return { noticias, loading, fetchNoticias, eliminarNoticia, syncYouTube };
};

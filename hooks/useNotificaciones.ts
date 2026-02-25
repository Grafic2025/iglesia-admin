import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useNotificaciones = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async (limit = 200) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notificacion_logs')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(limit);
            if (error) throw error;
            setLogs(data || []);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const enviarPushGeneral = useCallback(async (title: string, message: string) => {
        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message })
            });
            const data = await res.json();
            if (data.success) {
                await fetchLogs();
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Error de conexión' };
        }
    }, [fetchLogs]);

    return { logs, loading, error, fetchLogs, enviarPushGeneral };
};

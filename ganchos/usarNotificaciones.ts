import { useState, useCallback } from 'react';
import { supabase } from '../libreria/supabase';
import { NotificacionLog } from '../libreria/tipos';

export const usarNotificaciones = () => {
    const [registros, establecerRegistros] = useState<NotificacionLog[]>([]);
    const [cargando, establecerCargando] = useState(false);
    const [error, establecerError] = useState<string | null>(null);

    const obtenerRegistros = useCallback(async (limite = 200) => {
        establecerCargando(true);
        try {
            const { data, error } = await supabase
                .from('notificacion_logs')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(limite);
            if (error) throw error;
            establecerRegistros(data || []);
            establecerError(null);
        } catch (error: any) {
            establecerError(error.message);
        } finally {
            establecerCargando(false);
        }
    }, []);

    const enviarPushGeneral = useCallback(async (titulo: string, mensaje: string, imagenUrl?: string, tipo?: string, datosExtra?: any) => {
        try {
            const respuesta = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: titulo, message: mensaje, imageUrl: imagenUrl, type: tipo, ...datosExtra })
            });
            const datos = await respuesta.json();
            if (datos.success) {
                await obtenerRegistros();
                return { exito: true };
            }
            return { exito: false, error: datos.error };
        } catch (error) {
            return { exito: false, error: 'Error de conexión' };
        }
    }, [obtenerRegistros]);

    return {
        registros,
        cargando,
        error,
        obtenerRegistros,
        enviarPushGeneral
    };
};


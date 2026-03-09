import { useState, useCallback } from 'react';
import { supabase } from '../libreria/supabase';
import { Noticia } from '../libreria/tipos';

export const usarNoticias = () => {
    const [noticias, establecerNoticias] = useState<Noticia[]>([]);
    const [cargando, establecerCargando] = useState(false);

    const obtenerNoticias = useCallback(async () => {
        establecerCargando(true);
        try {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('orden', { ascending: true });
            if (error) throw error;
            establecerNoticias(data || []);
        } catch (error) {
            console.error('Error al obtener noticias:', error);
        } finally {
            establecerCargando(false);
        }
    }, []);

    const sincronizarYouTube = useCallback(async () => {
        try {
            const token = process.env.NEXT_PUBLIC_CRON_SECRET || 'iglesia_administrador_cron_2025';
            if (!token) {
                console.error("Token de sincronización no configurado");
                return { exito: false, error: 'Configuración de seguridad faltante' };
            }
            const respuesta = await fetch(`/api/youtube-sync?token=${token}`);
            const datos = await respuesta.json();
            if (datos.success) {
                await obtenerNoticias();
                return { exito: true };
            }
            return { exito: false, error: datos.error };
        } catch (error) {
            return { exito: false, error: 'Error de conexión' };
        }
    }, [obtenerNoticias]);

    const eliminarNoticia = useCallback(async (id: string) => {
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (!error) await obtenerNoticias();
        return { error };
    }, [obtenerNoticias]);

    return {
        noticias,
        cargando,
        obtenerNoticias,
        eliminarNoticia,
        sincronizarYouTube
    };
};


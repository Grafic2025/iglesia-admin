import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, error: 'Configuración faltante: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    try {
        const channelId = 'UCa9xuv0bgR6dTD_9GTbFXQg';
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

        const response = await fetch(rssUrl);
        const xml = await response.text();

        // Extracción simple de ID de video y título del primer <entry>
        const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = xml.match(/<title>([^<]+)<\/title>/g); // El primero es el canal, el segundo el video

        if (!videoIdMatch) {
            throw new Error('No se pudo encontrar el ID del video en el feed');
        }

        const videoId = videoIdMatch[1];
        const videoTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace(/<\/?title>/g, '') : 'Mensaje de Hoy';

        // Verificamos si es un vivo (opcional, pero el feed suele tener lo último subido/en vivo)
        // Para detectar específicamente el vivo real, el endpoint /live es mejor, 
        // pero el feed RSS nos da el último video subido que es lo que el usuario pidió.

        const { error } = await supabaseAdmin.from('noticias').upsert({
            id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for the latest synced video
            titulo: videoTitle,
            imagen_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            video_url: `https://www.youtube.com/watch?v=${videoId}`,
            es_youtube: true,
            activa: true,
            created_at: new Date().toISOString()
        });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            videoId,
            title: videoTitle
        });

    } catch (error: any) {
        console.error('YouTube Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

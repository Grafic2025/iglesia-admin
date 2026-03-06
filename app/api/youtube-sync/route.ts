import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    // 1. Verificar token de seguridad
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const SECRET_CRON_TOKEN = process.env.CRON_SECRET || 'iglesia_admin_cron_2025';

    if (token !== SECRET_CRON_TOKEN) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, error: 'Configuración faltante: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    try {
        const channelId = 'UC0L4Nf6Wv_M23u4J5sW33cA'; // ID oficial verificado
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

        const response = await fetch(rssUrl);
        const xml = await response.text();

        // Extracción simple de ID de video y título del primer <entry>
        // Nota: El RSS trae lo último subido. Si se subieron shorts, se verán shorts.
        // Para filtrar shorts por RSS es difícil, pero con el ID correcto de canal 
        // y verificando que el título no contenga #shorts podemos mejorar la puntería.
        const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

        let videoId = '';
        let videoTitle = '';

        for (const entry of entryMatches) {
            const vId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
            const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];

            if (vId && title && !title.toLowerCase().includes('#shorts') && !title.toLowerCase().includes('short')) {
                videoId = vId;
                videoTitle = title;
                break;
            }
        }

        if (!videoId) {
            // Si no encontramos nada filtrado, tomamos el primero por defecto para no romper la sync
            const firstId = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            const firstTitle = xml.match(/<title>([^<]+)<\/title>/g);
            if (!firstId) throw new Error('No se pudo encontrar el ID del video en el feed');
            videoId = firstId[1];
            videoTitle = firstTitle && firstTitle[1] ? firstTitle[1].replace(/<\/?title>/g, '') : 'Mensaje de Hoy';
        }

        const { error } = await supabaseAdmin.from('noticias').upsert({
            id: '00000000-0000-0000-0000-000000000001',
            titulo: videoTitle,
            imagen_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            video_url: `https://www.youtube.com/watch?v=${videoId}`,
            es_youtube: true,
            activa: true,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Supabase Upsert Error:', error);
            return NextResponse.json({ success: false, error: `Error de DB: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            videoId,
            title: videoTitle
        });

    } catch (error: any) {
        console.error('YouTube Sync Catch Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Error interno desconocido'
        }, { status: 500 });
    }
}

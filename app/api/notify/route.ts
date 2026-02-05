import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, horario, specificToken, image } = body;

    console.log("=== NUEVA NOTIFICACIÓN ===");
    console.log("Título:", title);
    console.log("URL Imagen:", image || "No se recibió imagen");

    let tokens: string[] = [];

    // --- LÓGICA DE TOKENS ---
    if (specificToken) {
      tokens = [specificToken];
    } else {
      const hoy = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires"
      });
      let query = supabase.from('miembros').select('id, token_notificacion');
      if (horario && horario !== 'Todas') {
        const { data: asistenciasHoy } = await supabase
          .from('asistencias')
          .select('miembro_id')
          .eq('horario_reunion', horario)
          .eq('fecha', hoy);
        const ids = asistenciasHoy?.map(a => a.miembro_id) || [];
        if (ids.length === 0) return NextResponse.json({ error: 'No hay asistentes' }, { status: 400 });
        query = query.in('id', ids);
      }
      const { data: miembros } = await query;
      const tokensMiembros = miembros?.map(m => m.token_notificacion) || [];
      const { data: otrosTokens } = await supabase.from('push_tokens').select('token');
      const tokensGenerales = otrosTokens?.map(t => t.token) || [];
      tokens = [...new Set([...tokensMiembros, ...tokensGenerales])]
        .filter(t => t && t.startsWith('ExponentPushToken')) as string[];
    }

    if (tokens.length === 0) return NextResponse.json({ error: 'Sin tokens' }, { status: 400 });

    // 2. PREPARAR NOTIFICACIONES (Versión de Máxima Compatibilidad)
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,

      // PROPIEDADES DE PRIORIDAD
      channelId: "default",
      priority: 'high',
      mutableContent: true,

      // IMÁGENES (Duplicamos para asegurar que Android e iOS la encuentren)
      image: image || null,          // Campo estándar de Expo para Android
      icon: "https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Logo.png", // Icono "avatar" (Grande en Android)
      attachments: image ? [{
        url: image,
        identifier: 'image-1',
        typeHint: 'image', // Usamos typeHint 'image' que es lo estándar de Expo
        hideThumbnail: false
      }] : [],

      data: {
        url: image || null,
        message: message,
        picture: image || null       // Campo extra para procesado interno
      }
    }));

    // --- ENVÍO A EXPO ---
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(notifications),
    });

    const expoData = await response.json();
    console.log("Respuesta Expo:", JSON.stringify(expoData, null, 2));

    return NextResponse.json({ success: true, total: tokens.length, expoResponse: expoData });

  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

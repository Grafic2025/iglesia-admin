import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, horario, specificToken } = body;

    console.log("=== NUEVA NOTIFICACIÓN ===");
    console.log("Título:", title);


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
      tokens = miembros
        ?.map(m => m.token_notificacion)
        .filter(t => t && t.startsWith('ExponentPushToken')) as string[] || [];

      // Asegurar tokens únicos
      tokens = [...new Set(tokens)];
    }

    if (tokens.length === 0) return NextResponse.json({ error: 'Sin tokens' }, { status: 400 });

    // 2. PREPARAR NOTIFICACIONES (Versión de Máxima Compatibilidad)
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: (!title || title.trim() === "" || title.toLowerCase() === "aviso") ? "Iglesia del Salvador" : title,
      body: message,

      // PROPIEDADES DE PRIORIDAD
      channelId: "default",
      priority: 'high',
      mutableContent: true,

      // IMÁGENES (Duplicamos para asegurar que Android e iOS la encuentren)
      // IMÁGENES
      image: null,
      icon: "https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Logo.png", // Icono "avatar" (Grande en Android)
      attachments: [],

      data: {
        url: null,
        message: message,
        picture: null
      }
    }));

    // --- ENVÍO A EXPO ---
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.EXPO_ACCESS_TOKEN ? { 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {})
      },
      body: JSON.stringify(notifications),
    });

    const expoData = await response.json();
    console.log("Respuesta Expo:", JSON.stringify(expoData, null, 2));

    // --- GUARDAR EN LOGS PARA EL ADMIN ---
    try {
      await supabase.from('notificacion_logs').insert([{
        fecha: new Date().toISOString(),
        titulo: (!title || title.trim() === "" || title.toLowerCase() === "aviso") ? "Iglesia del Salvador" : title,
        mensaje: message,
        destinatarios_count: tokens.length,
        estado: response.ok ? 'Exitoso' : 'Error'
      }]);
    } catch (dbError) {
      console.error("Error guardando log:", dbError);
    }

    return NextResponse.json({ success: true, total: tokens.length, expoResponse: expoData });

  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

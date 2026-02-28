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
        .filter(t => t && (t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken'))) as string[] || [];

      // Asegurar tokens únicos
      tokens = [...new Set(tokens)];
    }

    if (tokens.length === 0) return NextResponse.json({ error: 'Sin tokens válidos' }, { status: 400 });

    // 2. PREPARAR NOTIFICACIONES
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: (!title || title.trim() === "" || title.toLowerCase() === "aviso") ? "Iglesia del Salvador" : title,
      body: message,
      channelId: "default",
      priority: 'high',
      mutableContent: true,
      data: {
        title: title,
        body: message,
        horario: horario || 'General',
        type: 'service_reminder'
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

    // Determinar estado final revisando los tickets de Expo
    let finalStatus = 'Exitoso';
    let errorMessage = '';

    if (!response.ok) {
      finalStatus = 'Error API';
      errorMessage = `HTTP ${response.status}: ${JSON.stringify(expoData)}`;
    } else if (expoData.data) {
      // Expo devuelve un array de tickets, uno por cada notificación
      const errors = expoData.data.filter((d: any) => d.status === 'error');
      if (errors.length > 0) {
        finalStatus = errors.length === tokens.length ? 'Error' : 'Parcial';
        errorMessage = `Fallas: ${errors.map((e: any) => e.message).join(', ')}`;
      }
    }

    // --- GUARDAR EN LOGS ---
    try {
      await supabase.from('notificacion_logs').insert([{
        fecha: new Date().toISOString(),
        titulo: (!title || title.trim() === "" || title.toLowerCase() === "aviso") ? "Iglesia del Salvador" : title,
        mensaje: errorMessage ? `${message} (ERROR: ${errorMessage})` : message,
        destinatarios_count: tokens.length,
        estado: finalStatus
      }]);
    } catch (dbError) {
      console.error("Error guardando log:", dbError);
    }

    return NextResponse.json({
      success: finalStatus === 'Exitoso' || finalStatus === 'Parcial',
      status: finalStatus,
      total: tokens.length,
      error: errorMessage,
      expoResponse: expoData
    });

  } catch (error: any) {
    console.error("Error en /api/notify:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

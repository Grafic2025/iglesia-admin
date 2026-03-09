import { NextResponse } from 'next/server';
import { supabase } from '@/libreria/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, horario, specificToken, type, imageUrl, skipLog } = body;

    console.log("=== NUEVA NOTIFICACIÓN ===");
    console.log("Título:", title);
    if (imageUrl) console.log("Imagen:", imageUrl);

    let tokens: string[] = [];

    // --- LÓGICA DE TOKENS ---
    if (specificToken) {
      tokens = [specificToken];
    } else {
      let query = supabase.from('miembros').select('id, token_notificacion');

      const hoyStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
      const ultimoMes = new Date();
      ultimoMes.setDate(ultimoMes.getDate() - 30);
      const hace30diasStr = ultimoMes.toISOString();

      if (horario) {
        if (horario === 'Lideres') {
          query = query.eq('es_lider', true);
        } else if (horario === 'Servidores') {
          query = query.eq('es_servidor', true);
        } else if (horario === 'Nuevos') {
          query = query.gte('fecha_creacion', hace30diasStr);
        } else if (horario === 'Varones') {
          query = query.eq('genero', 'Hombre');
        } else if (horario === 'Mujeres') {
          query = query.eq('genero', 'Mujer');
        } else if (horario === 'Adolescentes') {
          // Asumiendo que pueden filtrar por edad < 18 si tuvieran fecha_nacimiento. Si no, ignoramos o usar rango
          // query = query.lte('fecha_nacimiento', fecha18YearsAgo)
        } else if (horario === 'EquipoMusica') {
          // Join para obtener solo los que estan en algun equipo de musica
          const { data: musicoIds } = await supabase.from('miembros_equipos').select('miembro_id');
          if (musicoIds && musicoIds.length > 0) {
            query = query.in('id', musicoIds.map(m => m.miembro_id));
          } else {
            query = query.in('id', ['-1']); // Forzar vacio
          }
        } else if (horario !== 'Todas') {
          // Es un horario específico (ej: 09:00)
          const { data: asistenciasHoy } = await supabase
            .from('asistencias')
            .select('miembro_id')
            .eq('horario_reunion', horario)
            .eq('fecha', hoyStr);
          const ids = asistenciasHoy?.map(a => a.miembro_id) || [];
          if (ids.length === 0) return NextResponse.json({ error: 'No hay asistentes registrados para este segmento.' }, { status: 400 });
          query = query.in('id', ids);
        }
      }

      const { data: miembros } = await query;
      tokens = miembros
        ?.map(m => m.token_notificacion)
        .filter(t => t && (t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken'))) as string[] || [];

      // Asegurar tokens únicos
      tokens = [...new Set(tokens)];
    }

    if (tokens.length === 0) return NextResponse.json({ error: 'No se encontraron dispositivos registrados para este segmento.' }, { status: 400 });

    // 2. PREPARAR NOTIFICACIONES
    const notificaciones = tokens.map(token => {
      const notification: any = {
        to: token,
        sound: 'default',
        title: (!title || title.trim() === "" || title.toLowerCase() === "aviso") ? "Iglesia del Salvador" : title,
        body: message,
        channelId: "default",
        priority: 'high',
        mutableContent: true,
        data: {
          ...body, // Pasamos el body completo (contiene title, message, type, imageUrl, IDs, etc)
          image: imageUrl // Alias para Android
        }
      };

      if (imageUrl) {
        notification.attachments = [{ url: imageUrl }]; // Para iOS
      }

      return notification;
    });

    // --- ENVÍO A EXPO ---
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.EXPO_ACCESS_TOKEN ? { 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {})
      },
      body: JSON.stringify(notificaciones),
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
    if (!skipLog) {
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


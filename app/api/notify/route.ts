import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // 1. Extraemos 'specificToken' del cuerpo de la petición
    const { title, message, horario, specificToken } = await req.json();

    let tokens: string[] = [];

    // 2. LÓGICA DE SELECCIÓN DE TOKENS
    if (specificToken) {
      // CASO A: Es una notificación para un usuario específico (ej. Bienvenida QR)
      tokens = [specificToken];
    } else {
      // CASO B: Es una notificación masiva (por horario o a todos)
      const hoy = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires"
      });

      let query = supabase.from('miembros').select('id, token_notificacion');

      if (horario && horario !== 'Todas') {
        const { data: asistenciasHoy, error: errAsis } = await supabase
          .from('asistencias')
          .select('miembro_id')
          .eq('horario_reunion', horario)
          .eq('fecha', hoy);

        if (errAsis) throw new Error("Error buscando asistencias");

        const ids = asistenciasHoy?.map(a => a.miembro_id) || [];
        
        if (ids.length === 0) {
          return NextResponse.json({ 
            error: `Nadie asistió a la reunión de las ${horario} el día ${hoy}` 
          }, { status: 400 });
        }
        query = query.in('id', ids);
      }

      const { data: miembros, error: errMieb } = await query;
      if (errMieb) throw new Error("Error buscando miembros");

      // Filtrar y limpiar tokens duplicados
      tokens = [...new Set(
        miembros?.map(m => m.token_notificacion)
          .filter(t => t && t.startsWith('ExponentPushToken'))
      )] as string[];
    }

    // 3. VALIDACIÓN FINAL DE TOKENS
    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No hay dispositivos con token válido' }, { status: 400 });
    }

    // 4. PREPARAR NOTIFICACIONES PARA EXPO
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,
    }));

    // 5. ENVÍO A EXPO
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` 
      },
      body: JSON.stringify(notifications),
    });

    const expoData = await response.json();

    return NextResponse.json({ 
      success: true, 
      total: tokens.length, 
      expoResponse: expoData 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

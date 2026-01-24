import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { title, message, horario } = await req.json();

    // 1. OBTENER LA FECHA ACTUAL DE ARGENTINA (YYYY-MM-DD)
    // Usamos 'en-CA' (Canadá) porque formatea naturalmente como YYYY-MM-DD
    const hoy = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires"
    });

    let query = supabase.from('miembros').select('token_notificacion');

    // 2. FILTRAR POR ASISTENCIAS DE HOY
    if (horario && horario !== 'Todas') {
      const { data: asistenciasHoy, error: errAsis } = await supabase
        .from('asistencias')
        .select('miembro_id')
        .eq('horario_reunion', horario)
        .eq('fecha', hoy); // Ahora 'hoy' es Argentina real

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

    // 3. LIMPIAR Y ENVIAR TOKENS
    const tokens = [...new Set(
      miembros?.map(m => m.token_notificacion)
        .filter(t => t && t.startsWith('ExponentPushToken'))
    )];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No hay dispositivos con token para este grupo' }, { status: 400 });
    }

    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications),
    });

    return NextResponse.json({ success: true, total: tokens.length, fechaProcesada: hoy });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { title, message, horario } = await req.json();

    // 1. Iniciamos la consulta a Supabase
    let query = supabase.from('miembros').select('token_notificacion');

    // 2. Lógica de filtrado por horario
    if (horario && horario !== 'Todas') {
      const hoy = new Date().toISOString().split('T')[0];
      const { data: asistenciasHoy, error: errAsis } = await supabase
        .from('asistencias')
        .select('miembro_id')
        .eq('horario_reunion', horario)
        .eq('fecha', hoy);

      if (errAsis) throw new Error("Error buscando asistencias");

      const ids = asistenciasHoy?.map(a => a.miembro_id) || [];
      
      if (ids.length === 0) {
        return NextResponse.json({ error: 'Nadie asistió a esta reunión hoy' }, { status: 400 });
      }
      query = query.in('id', ids);
    }

    const { data: miembros, error: errMieb } = await query;
    if (errMieb) throw new Error("Error buscando miembros");

    // Filtramos tokens válidos y únicos
    const tokens = [...new Set(miembros?.map(m => m.token_notificacion).filter(t => t && t.startsWith('ExponentPushToken')))];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No se encontraron tokens de Expo válidos' }, { status: 400 });
    }

    // 3. Formatear para Expo (Máximo 100 por lote, pero aquí enviamos el array completo)
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,
      data: { enviadoEl: new Date().toISOString() },
    }));

    // 4. Petición a los servidores de Expo
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      },
      body: JSON.stringify(notifications),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Expo rechazó el envío', details: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, total: tokens.length, result });

  } catch (error: any) {
    console.error("Error en la API de notificación:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

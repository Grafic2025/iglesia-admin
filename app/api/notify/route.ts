import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { title, message, horario } = await req.json();

    // 1. Iniciamos la consulta a Supabase
    let query = supabase.from('miembros').select('token_notificacion');

    // 2. Si hay un horario filtrado (que no sea "Todas"), 
    // filtramos para enviar solo a los que asistieron a esa reunión hoy
    if (horario !== 'Todas') {
      const hoy = new Date().toISOString().split('T')[0];
      const { data: asistenciasHoy } = await supabase
        .from('asistencias')
        .select('miembro_id')
        .eq('horario_reunion', horario)
        .eq('fecha', hoy);

      const ids = asistenciasHoy?.map(a => a.miembro_id) || [];
      query = query.in('id', ids);
    }

    const { data: miembros } = await query;
    const tokens = miembros?.map(m => m.token_notificacion).filter(t => t) || [];

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No hay dispositivos para este filtro' }, { status: 400 });
    }

    // 3. Formatear mensajes para el servicio de Expo
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: message,
      data: { withSome: 'data' },
    }));

    // 4. Petición a los servidores de Expo
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications),
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

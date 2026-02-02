import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { title, message, horario, specificToken } = await req.json();

    let tokens: string[] = [];

    // 1. LÓGICA DE SELECCIÓN DE TOKENS
    if (specificToken) {
      tokens = [specificToken];
    } else {
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

      // Obtenemos tokens de la tabla miembros
      const tokensMiembros = miembros?.map(m => m.token_notificacion) || [];
      
      // Obtenemos también tokens de la tabla push_tokens para asegurar alcance total
      const { data: otrosTokens } = await supabase.from('push_tokens').select('token');
      const tokensGenerales = otrosTokens?.map(t => t.token) || [];

      // Unificamos y filtramos duplicados/inválidos
      tokens = [...new Set([...tokensMiembros, ...tokensGenerales])]
        .filter(t => t && t.startsWith('ExponentPushToken')) as string[];
    }

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No hay dispositivos con token válido' }, { status: 400 });
    }

    // 2. PREPARAR NOTIFICACIONES
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,
    }));

    // 3. ENVÍO A EXPO
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` 
      },
      body: JSON.stringify(notifications),
    });

    const expoData = await response.json();

    // --- 4. LÓGICA DE LIMPIEZA DOBLE (Miembros y Push_Tokens) ---
    if (expoData.data) {
      const tokensABorrar: string[] = [];
      
      expoData.data.forEach((ticket: any, index: number) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          tokensABorrar.push(tokens[index]);
        }
      });

      if (tokensABorrar.length > 0) {
        // Limpiamos en la tabla 'miembros'
        await supabase
          .from('miembros')
          .update({ token_notificacion: null })
          .in('token_notificacion', tokensABorrar);
        
        // Limpiamos en la tabla 'push_tokens'
        await supabase
          .from('push_tokens')
          .delete()
          .in('token', tokensABorrar);
        
        console.log(`🧹 Limpieza: se eliminaron ${tokensABorrar.length} tokens obsoletos.`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      total: tokens.length, 
      expoResponse: expoData 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

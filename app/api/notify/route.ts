import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // 1. Agregamos 'image' a la desestructuración del JSON
    const { title, message, horario, specificToken, image } = await req.json();

    let tokens: string[] = [];

    // --- LÓGICA DE SELECCIÓN DE TOKENS (Se mantiene igual) ---
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

      const tokensMiembros = miembros?.map(m => m.token_notificacion) || [];
      const { data: otrosTokens } = await supabase.from('push_tokens').select('token');
      const tokensGenerales = otrosTokens?.map(t => t.token) || [];

      tokens = [...new Set([...tokensMiembros, ...tokensGenerales])]
        .filter(t => t && t.startsWith('ExponentPushToken')) as string[];
    }

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No hay dispositivos con token válido' }, { status: 400 });
    }

    // 2. PREPARAR NOTIFICACIONES (Mantenemos tu lógica, agregamos soporte multimedia real)
    const notifications = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title || "Iglesia del Salvador",
      body: message,
      
      // AJUSTES TÉCNICOS PARA IMÁGENES
      mutableContent: true, // Permite que el celular procese el archivo adjunto
      attachments: image ? [{ url: image }] : [], // Formato para iOS
      image: image || null, // Formato para Android
      
      data: { 
        url: image || null,
        message: message 
      },
      priority: 'high' 
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

    // --- 4. LÓGICA DE LIMPIEZA DOBLE (Se mantiene igual) ---
    if (expoData.data) {
      const tokensABorrar: string[] = [];
      expoData.data.forEach((ticket: any, index: number) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          tokensABorrar.push(tokens[index]);
        }
      });

      if (tokensABorrar.length > 0) {
        await supabase.from('miembros').update({ token_notificacion: null }).in('token_notificacion', tokensABorrar);
        await supabase.from('push_tokens').delete().in('token', tokensABorrar);
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
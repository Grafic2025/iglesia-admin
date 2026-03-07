import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  // 1. Verificar token de seguridad
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const SECRET_CRON_TOKEN = process.env.CRON_SECRET;

  if (!SECRET_CRON_TOKEN || token !== SECRET_CRON_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
  }

  const results: any = { cleanup: null, chatOpening: null, reminders: null };
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  try {
    // --- TAREA 1: LIMPIEZA DE MENSAJES VIEJOS ---
    const { data: oldPlans } = await supabaseAdmin.from('cronogramas').select('id').lt('fecha', today);
    if (oldPlans && oldPlans.length > 0) {
      const ids = oldPlans.map((p: any) => p.id);
      await supabaseAdmin.from('mensajes_plan').delete().in('cronograma_id', ids);
      results.cleanup = { success: true, count: ids.length };
    }

    // --- TAREA 2: APERTURA DE CHATS (LUNES) ---
    const dayOfWeek = new Date().getDay(); // 1 = Lunes
    if (dayOfWeek === 1) {
      const startOfWeek = today;
      const endOfWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: upcoming } = await supabaseAdmin
        .from('cronogramas')
        .select('id, fecha, equipo_ids')
        .gte('fecha', startOfWeek)
        .lte('fecha', endOfWeek);

      if (upcoming && upcoming.length > 0) {
        let sentCount = 0;
        for (const p of upcoming) {
          const mIds = (p.equipo_ids || []).map((m: any) => m.miembro_id).filter(Boolean);
          if (mIds.length > 0) {
            const { data: members } = await supabaseAdmin.from('miembros').select('token_notificacion').in('id', mIds).not('token_notificacion', 'is', null);
            if (members && members.length > 0) {
              const tokens = members.map((m: any) => m.token_notificacion).filter(Boolean);
              if (tokens.length > 0) {
                const msg = `💬 ¡Chat Abierto! Ya podés coordinar el servicio del ${new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}.`;
                await sendToExpo(tokens, '🙌 Equipo de Servicio', msg, { type: 'plan_chat', planId: p.id });
                sentCount += tokens.length;
              }
            }
          }
        }
        results.chatOpening = { success: true, sent: sentCount };
      }
    }

    // --- TAREA 3: RECORDATORIOS 24HS ANTES ---
    const { data: tomorrowPlans } = await supabaseAdmin
      .from('cronogramas')
      .select('id, fecha, horario, equipo_ids, notas_generales')
      .eq('fecha', tomorrow);

    if (tomorrowPlans && tomorrowPlans.length > 0) {
      let reminderCount = 0;
      for (const p of tomorrowPlans) {
        // Solo enviamos a los que están "confirmado"
        const confirmedMembers = (p.equipo_ids || []).filter((m: any) => m.estado === 'confirmado');
        if (confirmedMembers.length > 0) {
          for (const cm of confirmedMembers) {
            // Verificar si ya se envió el recordatorio para este miembro y esta fecha de plan hoy
            const identifier = `REMINDER-${p.id}-${cm.miembro_id}-${p.fecha}`;
            const { data: existingLog } = await supabaseAdmin
              .from('notificacion_logs')
              .select('id')
              .eq('titulo', '⏰ Recordatorio de Servicio')
              .ilike('mensaje', `%[ID:${identifier}]%`)
              .maybeSingle();

            if (existingLog) {
              console.log(`Recordatorio ya enviado para ${identifier}`);
              continue;
            }

            const { data: member } = await supabaseAdmin.from('miembros').select('token_notificacion, nombre').eq('id', cm.miembro_id).single();
            if (member?.token_notificacion) {
              const hr = p.horario ? ` a las ${p.horario.split(',')[0]} HS` : '';
              const msg = `👋 ¡Hola ${member.nombre}! Te recordamos que mañana servís como ${cm.rol}${hr}. ¡Te esperamos!`;
              const finalMsg = `${msg} [ID:${identifier}]`; // Marcador oculto/visible para evitar reenvíos

              const success = await sendToExpo([member.token_notificacion], '⏰ Recordatorio de Servicio', finalMsg, { type: 'servidores', planId: p.id });

              if (success) {
                // Registrar en logs para evitar duplicados en la próxima ejecución
                await supabaseAdmin.from('notificacion_logs').insert([{
                  fecha: new Date().toISOString(),
                  titulo: '⏰ Recordatorio de Servicio',
                  mensaje: finalMsg,
                  destinatarios_count: 1,
                  estado: 'Exitoso'
                }]);
                reminderCount++;
              }
            }
          }
        }
      }
      results.reminders = { success: true, sent: reminderCount };
    }

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    console.error("Error en automot:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function sendToExpo(tokens: string[], title: string, body: string, data: any) {
  try {
    const notifications = tokens.map((t: string) => ({ to: t, title, body, data, sound: 'default' }));
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications),
    });
    return response.ok;
  } catch (e) {
    console.error("Error sending to Expo:", e);
    return false;
  }
}
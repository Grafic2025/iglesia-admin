import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  // 1. Verificar un token de seguridad simple para evitar llamadas externas no deseadas
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  // Deberías configurar este token en tus variables de entorno (.env)
  const SECRET_CRON_TOKEN = process.env.CRON_SECRET || 'iglesia_admin_cron_2025';

  if (token !== SECRET_CRON_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Servicio administrativo no disponible' }, { status: 500 });
  }

  const results: any = { cleanup: null, notifications: null };

  try {
    // --- TAREA 1: LIMPIEZA DE MENSAJES ANTIGUOS ---
    // Buscamos cronogramas cuya fecha ya pasó (ayer o antes)
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

    const { data: oldPlans } = await supabaseAdmin
      .from('cronogramas')
      .select('id')
      .lt('fecha', today);

    if (oldPlans && oldPlans.length > 0) {
      const idsToDelete = oldPlans.map((p: any) => p.id);
      const { error: deleteError } = await supabaseAdmin
        .from('mensajes_plan')
        .delete()
        .in('cronograma_id', idsToDelete);

      results.cleanup = deleteError ? { error: deleteError.message } : { success: true, count: idsToDelete.length };
    } else {
      results.cleanup = { success: true, count: 0 };
    }

    // --- TAREA 2: NOTIFICAR APERTURA (SOLO LOS LUNES) ---
    const dayOfWeek = new Date().getDay(); // 0: Domingo, 1: Lunes...

    if (dayOfWeek === 1) { // 1 es Lunes
      const { data: upcomingPlans } = await supabaseAdmin
        .from('cronogramas')
        .select('id, fecha, horario, equipo_ids')
        .gte('fecha', today)
        .lte('fecha', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (upcomingPlans && upcomingPlans.length > 0) {
        let totalNotifications = 0;

        for (const plan of upcomingPlans) {
          const memberIds = (plan.equipo_ids || []).map((m: any) => m.miembro_id).filter(Boolean);

          if (memberIds.length > 0) {
            const { data: members } = await supabaseAdmin
              .from('miembros')
              .select('token_notificacion, nombre')
              .in('id', memberIds)
              .is.not('token_notificacion', null);

            if (members && members.length > 0) {
              const tokens = members
                .map((m: any) => m.token_notificacion)
                .filter((t: string) => t && (t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken')));

              if (tokens.length > 0) {
                // Enviar a Expo
                const msg = `💬 ¡Chat Abierto! Ya podés coordinar el servicio del ${new Date(plan.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}.`;

                const notifications = tokens.map((t: string) => ({
                  to: t,
                  title: '🙌 Equipo de Servicio',
                  body: msg,
                  data: { type: 'plan_chat', planId: plan.id }
                }));

                await fetch('https://exp.host/--/api/v2/push/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notifications),
                });
                totalNotifications += tokens.length;
              }
            }
          }
        }
        results.notifications = { success: true, sent: totalNotifications };
      }
    } else {
      results.notifications = { info: 'Hoy no es lunes, no se enviaron notificaciones de apertura.' };
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
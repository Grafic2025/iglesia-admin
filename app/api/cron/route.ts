import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const ahora = new Date();
    
    // 1. Generamos la hora en formato HH:mm (ej: "18:05")
    // Usamos 'en-GB' para asegurar formato 24hs sin AM/PM
    const horaActualCorta = ahora.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'America/Argentina/Buenos_Aires' 
    });
    
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = dias[ahora.getDay()];

    console.log(`Buscando programaciones para: ${diaHoy} ${horaActualCorta}`);

    // 2. BUSQUEDA FLEXIBLE: Usamos 'ilike' con '%' para ignorar los segundos
    // Esto encontrará "18:05:00" aunque el cron llegue a las "18:05:35"
    const { data: tareas, error } = await supabase
      .from('programaciones')
      .select('*')
      .eq('activo', true)
      .or(`dia_semana.eq.Todos los días,dia_semana.eq.${diaHoy}`)
      .filter('hora', 'ilike', `${horaActualCorta}%`); 

    if (error) throw error;

    if (tareas && tareas.length > 0) {
      for (const tarea of tareas) {
        let mensajeAEnviar = tarea.mensaje;

        // Lógica de Versículo Automático
        if (tarea.mensaje.toUpperCase() === 'VERSICULO') {
          try {
            const res = await fetch('https://bible-api.com/?random=verse&translation=bbe');
            const data = await res.json();
            mensajeAEnviar = `📖 ${data.text} (${data.reference})`;
          } catch (e) {
            mensajeAEnviar = "¡Que tengas un bendecido día en el Señor!";
          }
        }

        // 3. ENVIAR NOTIFICACIÓN
        // Asegúrate que NEXT_PUBLIC_BASE_URL en Vercel sea: https://iglesia-admin.vercel.app
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: tarea.mensaje.toUpperCase() === 'VERSICULO' ? 'Versículo del Día' : 'Aviso Iglesia',
            message: mensajeAEnviar,
            horario: 'Todas'
          }),
        });
      }
    }

    return NextResponse.json({ 
      ok: true, 
      horaServidor: horaActualCorta, 
      tareasEncontradas: tareas?.length || 0 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

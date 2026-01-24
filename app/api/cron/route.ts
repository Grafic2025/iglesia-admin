import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString('es-AR', { 
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' 
  });
  
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaHoy = dias[ahora.getDay()];

  // Buscar si hay algo para enviar ahora
  const { data: tareas } = await supabase
    .from('programaciones')
    .select('*')
    .eq('activo', true)
    .eq('hora', horaActual)
    .or(`dia_semana.eq.Todos los días,dia_semana.eq.${diaHoy}`);

  if (tareas && tareas.length > 0) {
    for (const tarea of tareas) {
      let mensajeAEnviar = tarea.mensaje;

      // Lógica de Versículo Automático
      if (tarea.mensaje.toUpperCase() === 'VERSICULO') {
        const res = await fetch('https://bible-api.com/?random=verse&translation=bbe');
        const data = await res.json();
        mensajeAEnviar = `📖 ${data.text} (${data.reference})`;
      }

      // Enviar la notificación real llamando a tu API de notify
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

  return NextResponse.json({ ok: true });
}

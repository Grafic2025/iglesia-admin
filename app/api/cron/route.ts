import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const ahora = new Date();
    
    // 1. Obtenemos hora y minuto (ej: 18, 05)
    const opciones: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', minute: '2-digit', 
      hour12: false, timeZone: 'America/Argentina/Buenos_Aires' 
    };
    const horaActual = ahora.toLocaleTimeString('en-GB', opciones);
    
    // 2. Definimos el rango de ese minuto (desde :00 hasta :59 segundos)
    const horaInicio = `${horaActual}:00`;
    const horaFin = `${horaActual}:59`;

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = dias[ahora.getDay()];

    console.log(`Cron ejecutando: ${diaHoy} entre ${horaInicio} y ${horaFin}`);

    // 3. BUSQUEDA POR RANGO (Esto es lo más seguro para columnas tipo TIME)
    const { data: tareas, error } = await supabase
      .from('programaciones')
      .select('*')
      .eq('activo', true)
      .or(`dia_semana.eq.Todos los días,dia_semana.eq.${diaHoy}`)
      .gte('hora', horaInicio) // Mayor o igual a 17:59:00
      .lte('hora', horaFin);   // Menor o igual a 17:59:59

    if (error) throw error;

    if (tareas && tareas.length > 0) {
      for (const tarea of tareas) {
        let mensajeAEnviar = tarea.mensaje;

        if (tarea.mensaje.toUpperCase() === 'VERSICULO') {
          try {
            const res = await fetch('https://bible-api.com/?random=verse&translation=bbe');
            const data = await res.json();
            mensajeAEnviar = `📖 ${data.text} (${data.reference})`;
          } catch (e) {
            mensajeAEnviar = "¡Bendecido día!";
          }
        }

        // 4. ENVÍO REAL
        // IMPORTANTE: Verifica que NEXT_PUBLIC_BASE_URL sea https://tu-sitio.vercel.app
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
      rangoBuscado: `${horaInicio} a ${horaFin}`, 
      encontrados: tareas?.length || 0 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

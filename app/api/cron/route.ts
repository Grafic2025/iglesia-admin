import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const ahora = new Date();
    
    // 1. Obtenemos la hora actual exactamente como la guardas: "HH:mm" (ej: "18:19")
    const horaActual = ahora.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'America/Argentina/Buenos_Aires' 
    });
    
    // 2. Preparamos el nombre del día para que coincida con "Domingo"
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaHoy = dias[ahora.getDay()];

    console.log(`Buscando: ${diaHoy} a las ${horaActual}`);

    // 3. BUSQUEDA EXACTA: Buscamos el texto tal cual aparece en tu captura
    const { data: tareas, error } = await supabase
      .from('programaciones')
      .select('*')
      .eq('hora', horaActual) // Buscará "18:19"
      .or(`dia_semana.eq.Todos los días,dia_semana.eq.${diaHoy}`);

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
            mensajeAEnviar = "¡Que tengas un bendecido día!";
          }
        }

        // 4. ENVÍO REAL (Asegúrate que la variable de entorno esté bien en Vercel)
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
      diaEncontrado: diaHoy,
      horaBuscada: horaActual, 
      encontrados: tareas?.length || 0 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

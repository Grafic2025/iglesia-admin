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
            
            // 1. Traducir el texto del inglés al español
            const resT = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(data.text)}&langpair=en|es`);
            const dataT = await resT.json();
            const textoEspanol = dataT.responseData.translatedText;

            // 2. Diccionario de libros para traducir la referencia
            let referencia = data.reference;
            const libros: { [key: string]: string } = {
              'Genesis': 'Génesis', 'Exodus': 'Éxodo', 'Leviticus': 'Levítico', 'Numbers': 'Números', 'Deuteronomy': 'Deuteronomio',
              'Joshua': 'Josué', 'Judges': 'Jueces', 'Ruth': 'Rut', '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
              '1 Kings': '1 Reyes', '2 Kings': '2 Reyes', '1 Chronicles': '1 Crónicas', '2 Chronicles': '2 Crónicas',
              'Ezra': 'Esdras', 'Nehemiah': 'Nehemías', 'Esther': 'Ester', 'Job': 'Job', 'Psalms': 'Salmos', 'Psalm': 'Salmo',
              'Proverbs': 'Proverbios', 'Ecclesiastes': 'Eclesiastés', 'Song of Solomon': 'Cantares', 'Isaiah': 'Isaías',
              'Jeremiah': 'Jeremías', 'Lamentations': 'Lamentaciones', 'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel', 'Hosea': 'Oseas',
              'Joel': 'Joel', 'Amos': 'Amós', 'Obadiah': 'Abdías', 'Jonah': 'Jonás', 'Micah': 'Miqueas', 'Nahum': 'Nahúm',
              'Habakkuk': 'Habacuc', 'Zephaniah': 'Sofonías', 'Haggai': 'Hageo', 'Zechariah': 'Zacarías', 'Malachi': 'Malaquías',
              'Matthew': 'Mateo', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'Juan', 'Acts': 'Hechos', 'Romans': 'Romanos',
              '1 Corinthians': '1 Corintios', '2 Corinthians': '2 Corintios', 'Galatians': 'Gálatas', 'Ephesians': 'Efesios',
              'Philippians': 'Filipenses', 'Colossians': 'Colosenses', '1 Thessalonians': '1 Tesalonicenses', '2 Thessalonians': '2 Tesalonicenses',
              '1 Timothy': '1 Timoteo', '2 Timothy': '2 Timoteo', 'Titus': 'Tito', 'Philemon': 'Filemón', 'Hebrews': 'Hebreos',
              'James': 'Santiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro', '1 John': '1 Juan', '2 John': '2 Juan',
              '3 John': '3 Juan', 'Jude': 'Judas', 'Revelation': 'Apocalipsis'
            };
            
            Object.keys(libros).forEach(eng => { 
              referencia = referencia.replace(eng, libros[eng]); 
            });

            mensajeAEnviar = `📖 ${textoEspanol} (${referencia})`;
          } catch (e) {
            mensajeAEnviar = "¡Que tengas un bendecido día!";
          }
        } // <--- ESTA ES LA LLAVE QUE FALTABA

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
    
    // --- ESTO ES LO NUEVO: Guardar el resultado en Supabase ---
        await supabase
          .from('programaciones')
          .update({ 
            ultimo_estado: respuesta.ok ? 'Exitoso' : 'Error', 
            ultima_ejecucion: new Date().toISOString() 
          })
          .eq('id', tarea.id);
        // ---------------------------------------------------------

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

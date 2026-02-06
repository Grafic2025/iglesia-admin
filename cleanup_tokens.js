const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acvxjhecpgmauqqzmjik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdnhqaGVjcGdtYXVxcXptamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc4MDQsImV4cCI6MjA4NDU5MzgwNH0.62D2jMUb_f-QBFKoXJeYb36NylRnTY-iF4YiXogTf9';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('--- Iniciando limpieza de tokens ---');

    // 1. Obtener todos los tokens registrados en miembros
    const { data: miembros, error: errorM } = await supabase
        .from('miembros')
        .select('token_notificacion')
        .not('token_notificacion', 'is', null);

    if (errorM) {
        console.error('Error al obtener miembros:', errorM.message);
        return;
    }

    const tokensValidos = new Set(miembros.map(m => m.token_notificacion));
    console.log(`Tokens vinculados a miembros: ${tokensValidos.size}`);

    // 2. Obtener todos los tokens de la tabla push_tokens
    const { data: todosLosTokens, error: errorP } = await supabase
        .from('push_tokens')
        .select('token');

    if (errorP) {
        console.error('Error al obtener push_tokens:', errorP.message);
        return;
    }

    console.log(`Tokens totales en push_tokens: ${todosLosTokens.length}`);

    // 3. Identificar tokens huérfanos
    const tokensAEliminar = todosLosTokens
        .map(t => t.token)
        .filter(t => !tokensValidos.has(t));

    console.log(`Tokens huérfanos a eliminar: ${tokensAEliminar.length}`);

    if (tokensAEliminar.length > 0) {
        const { error: errorD } = await supabase
            .from('push_tokens')
            .delete()
            .in('token', tokensAEliminar);

        if (errorD) {
            console.error('Error al eliminar tokens:', errorD.message);
        } else {
            console.log('✅ Limpieza completada con éxito.');
        }
    } else {
        console.log('No hay tokens huérfanos para eliminar.');
    }
}

cleanup();

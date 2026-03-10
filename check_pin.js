
const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = 'https://acvxjhecpgmauqqzmjik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdnhqaGVjcGdtYXVxcXptamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc4MDQsImV4cCI6MjA4NDU5MzgwNH0.62D2jMUb_f-QBFKoXJeYb36NylRnTY-iF4YiXogTf9I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPinColumn() {
    console.log("Intentando agregar columna 'pin' a la tabla 'miembros'...");
    // Intentamos un select para ver si ya existe
    const { error: selectError } = await supabase.from('miembros').select('pin').limit(1);

    if (selectError && selectError.message.includes('column "pin" does not exist')) {
        console.log("La columna 'pin' no existe. Por favor, ejecuta esto en el SQL Editor de Supabase:");
        console.log("ALTER TABLE miembros ADD COLUMN pin text;");
    } else if (selectError) {
        console.error("Error al verificar columna:", selectError.message);
    } else {
        console.log("La columna 'pin' ya existe.");
    }
}

addPinColumn();

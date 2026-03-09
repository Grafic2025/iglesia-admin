'use client';
import VistaCancionero from '../../componentes/vistas/VistaCancionero';
import { supabase } from '../../libreria/supabase';

export default function CancioneroPage() {
    return <VistaCancionero supabase={supabase} />;
}


'use client';
import VistaBot from '../../componentes/vistas/VistaBot';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function BotPage() {
    const administrador = useContextoAdmin();
    return <VistaBot supabase={supabase} registrarAuditoria={administrador.registrarAuditoria} />;
}


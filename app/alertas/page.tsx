'use client';
import VistaAlertas from '../../componentes/vistas/VistaAlertas';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function AlertasPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaAlertas
            supabase={supabase}
            registrarAuditoria={administrador.registrarAuditoria}
        />
    );
}


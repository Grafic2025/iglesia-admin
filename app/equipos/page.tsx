'use client';
import EquiposView from '../../componentes/vistas/EquiposView';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function EquiposPage() {
    const administrador = useContextoAdmin();
    return (
        <EquiposView
            supabase={supabase}
            registrarAuditoria={administrador.registrarAuditoria}
            enviarNotificacionIndividual={administrador.enviarNotificacionIndividual}
        />
    );
}


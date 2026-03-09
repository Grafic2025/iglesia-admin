'use client';
import VistaEquipos from '../../componentes/vistas/VistaEquipos';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function EquiposPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaEquipos
            supabase={supabase}
            registrarAuditoria={administrador.registrarAuditoria}
            enviarNotificacionIndividual={administrador.enviarNotificacionIndividual}
        />
    );
}


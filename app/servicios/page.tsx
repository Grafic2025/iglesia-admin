'use client';
import VistaServicios from '../../componentes/vistas/VistaServicios';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function ServiciosPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaServicios
            supabase={supabase}
            enviarNotificacionIndividual={administrador.enviarNotificacionIndividual}
            registrarAuditoria={administrador.registrarAuditoria}
        />
    );
}


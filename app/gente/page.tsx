'use client';
import VistaGente from '../../componentes/vistas/VistaGente';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';

export default function GentePage() {
    const administrador = useContextoAdmin();

    return (
        <VistaGente
            miembros={administrador.miembros}
            hoyArg={administrador.hoyArg}
            fetchMiembros={administrador.obtenerMiembros}
            enviarNotificacionIndividual={administrador.enviarNotificacionIndividual}
            registrarAuditoria={administrador.registrarAuditoria}
            loading={administrador.miembrosCargando}
        />
    );
}


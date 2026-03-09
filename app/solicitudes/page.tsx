'use client';
import VistaSolicitudes from '../../componentes/vistas/VistaSolicitudes';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';

export default function SolicitudesPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaSolicitudes
            bautismos={administrador.bautismos}
            ayuda={administrador.ayuda}
            miembros={administrador.miembros}
        />
    );
}


'use client';
import VistaAuditoria from '../../componentes/vistas/VistaAuditoria';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';

export default function AuditoriaPage() {
    const administrador = useContextoAdmin();
    return <VistaAuditoria logs={administrador.logsAuditoria} />;
}


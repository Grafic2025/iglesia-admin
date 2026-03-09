'use client';
import VistaPanel from '../componentes/vistas/VistaPanel';
import { useContextoAdmin } from '../contextos/ContextoAdmin';

export default function DashboardPage() {
  const administrador = useContextoAdmin();

  return (
    <VistaPanel
      asistencias={administrador.asistencias}
      asistencias7dias={administrador.asistencias7dias}
      oracionesActivas={administrador.oracionesActivas}
      nuevosMes={administrador.nuevosMes}
      tasaRetencion={administrador.tasaRetencion}
      crecimientoAnual={administrador.crecimientoAnual}
      horariosReunion={administrador.horariosDisponibles}
      miembros={administrador.miembros}
      bautismos={administrador.bautismos}
      ayuda={administrador.ayuda}
      ausentes={administrador.ausentes || []}
      servidoresQuemados={administrador.servidoresQuemados || []}
      logsAuditoria={administrador.logsAuditoria}
    />
  );
}


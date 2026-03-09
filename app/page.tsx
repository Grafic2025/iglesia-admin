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
      crecimientoAnual={administrador.crecimientoAnual}
      horariosReunion={administrador.horariosDisponibles}
      miembros={administrador.miembros}
      bautismos={administrador.bautismos}
      ayuda={administrador.ayuda}
    />
  );
}


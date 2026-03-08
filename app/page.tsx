'use client';
import React from 'react';
import DashboardView from '../components/views/DashboardView';
import { useAdminContext } from '../context/AdminContext';

export default function DashboardPage() {
  const admin = useAdminContext();

  return (
    <DashboardView
      asistencias={admin.asistencias}
      asistencias7dias={admin.asistencias7dias}
      oracionesActivas={admin.oracionesActivas}
      nuevosMes={admin.nuevosMes}
      crecimientoAnual={admin.crecimientoAnual}
      horariosReunion={admin.horariosDisponibles}
      miembros={admin.miembros}
      bautismos={admin.bautismos}
      ayuda={admin.ayuda}
    />
  );
}

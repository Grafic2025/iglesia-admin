'use client';
import React from 'react';
import MiembrosView from '../../components/views/MiembrosView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function AsistenciasPage() {
    const admin = useAdminContext();

    return (
        <MiembrosView
            busqueda={admin.busqueda}
            setBusqueda={admin.setBusqueda}
            filtroHorario={admin.filtroHorario}
            setFiltroHorario={admin.setFiltroHorario}
            datosFiltrados={admin.datosFiltrados}
            premiosPendientes={admin.premiosPendientes}
            premiosEntregados={admin.premiosEntregados}
            marcarComoEntregado={admin.marcarComoEntregado}
            enviarNotificacionIndividual={admin.enviarNotificacionIndividual}
            hoyArg={admin.hoyArg}
            supabase={supabase}
            fetchAsistencias={admin.fetchAsistencias}
            fetchMiembros={admin.fetchMiembros}
            horariosDisponibles={admin.horariosDisponibles}
            registrarAuditoria={admin.registrarAuditoria}
            loading={admin.asistenciasLoading}
        />
    );
}

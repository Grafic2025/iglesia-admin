'use client';
import React from 'react';
import GenteView from '../../components/views/GenteView';
import { useAdminContext } from '../../context/AdminContext';

export default function GentePage() {
    const admin = useAdminContext();

    return (
        <GenteView
            miembros={admin.miembros}
            hoyArg={admin.hoyArg}
            fetchMiembros={admin.fetchMiembros}
            enviarNotificacionIndividual={admin.enviarNotificacionIndividual}
            registrarAuditoria={admin.registrarAuditoria}
            loading={admin.miembrosLoading}
        />
    );
}

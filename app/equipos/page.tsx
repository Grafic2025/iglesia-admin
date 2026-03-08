'use client';
import React from 'react';
import EquiposView from '../../components/views/EquiposView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function EquiposPage() {
    const admin = useAdminContext();
    return (
        <EquiposView
            supabase={supabase}
            registrarAuditoria={admin.registrarAuditoria}
            enviarNotificacionIndividual={admin.enviarNotificacionIndividual}
        />
    );
}

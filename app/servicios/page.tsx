'use client';
import React from 'react';
import ServiciosView from '../../components/views/ServiciosView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function ServiciosPage() {
    const admin = useAdminContext();
    return (
        <ServiciosView
            supabase={supabase}
            enviarNotificacionIndividual={admin.enviarNotificacionIndividual}
            registrarAuditoria={admin.registrarAuditoria}
        />
    );
}

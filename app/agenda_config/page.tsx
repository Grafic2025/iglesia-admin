'use client';
import React from 'react';
import AgendaConfigView from '../../components/views/AgendaConfigView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function AgendaConfigPage() {
    const admin = useAdminContext();
    return (
        <AgendaConfigView
            supabase={supabase}
            horariosDisponibles={admin.horariosDisponibles}
            fetchHorarios={admin.fetchHorarios}
            registrarAuditoria={admin.registrarAuditoria}
        />
    );
}

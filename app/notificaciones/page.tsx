'use client';
import React from 'react';
import NotificacionesView from '../../components/views/NotificacionesView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function NotificacionesPage() {
    const admin = useAdminContext();
    return (
        <NotificacionesView
            tituloPush={admin.tituloPush}
            setTituloPush={admin.setTituloPush}
            mensajePush={admin.mensajePush}
            setMensajePush={admin.setMensajePush}
            imageUrlPush={admin.imageUrlPush}
            setImageUrlPush={admin.setImageUrlPush}
            filtroHorario={admin.filtroHorario}
            setFiltroHorario={admin.setFiltroHorario}
            enviarNotificacion={admin.enviarNotificacion}
            enviando={admin.enviando}
            notificacionStatus={admin.notificacionStatus}
            cronogramas={admin.cronogramas}
            eliminarProgramacion={admin.eliminarProgramacion}
            fetchProgramaciones={admin.fetchCronogramas}
            supabase={supabase}
            logs={admin.logs}
            logsError={admin.logsError}
            horariosDisponibles={admin.horariosDisponibles}
            registrarAuditoria={admin.registrarAuditoria}
            typePush={admin.typePush}
            setTypePush={admin.setTypePush}
            loading={admin.logsLoading}
        />
    );
}

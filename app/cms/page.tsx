'use client';
import React from 'react';
import CMSView from '../../components/views/CMSView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function CMSPage() {
    const admin = useAdminContext();
    return (
        <CMSView
            noticias={admin.noticias}
            syncYouTube={admin.syncYouTube}
            eliminarNoticia={admin.eliminarNoticia}
            supabase={supabase}
            fetchNoticias={admin.fetchNoticias}
            registrarAuditoria={admin.registrarAuditoria}
            enviarPushGeneral={admin.enviarPushGeneral}
        />
    );
}

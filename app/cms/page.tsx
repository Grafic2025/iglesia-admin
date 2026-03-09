'use client';
import VistaCMS from '../../componentes/vistas/VistaCMS';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function CMSPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaCMS
            noticias={administrador.noticias}
            syncYouTube={administrador.sincronizarYouTube}
            eliminarNoticia={administrador.eliminarNoticia}
            supabase={supabase}
            fetchNoticias={administrador.obtenerNoticias}
            registrarAuditoria={administrador.registrarAuditoria}
            enviarPushGeneral={administrador.enviarPushGeneral}
        />
    );
}


'use client';
import VistaNotificaciones from '../../componentes/vistas/VistaNotificaciones';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function NotificacionesPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaNotificaciones
            tituloPush={administrador.tituloPush}
            setTituloPush={administrador.establecerTituloPush}
            mensajePush={administrador.mensajePush}
            setMensajePush={administrador.establecerMensajePush}
            imageUrlPush={administrador.urlImagenPush}
            setImageUrlPush={administrador.establecerUrlImagenPush}
            filtroHorario={administrador.filtroHorario}
            setFiltroHorario={administrador.establecerFiltroHorario}
            enviarNotificacion={administrador.enviarNotificacion}
            enviando={administrador.estaEnviando}
            notificacionStatus={administrador.estadoNotificacion}
            cronogramas={administrador.cronogramas}
            eliminarProgramacion={administrador.eliminarProgramacion}
            fetchProgramaciones={administrador.obtenerCronogramas}
            supabase={supabase}
            logs={administrador.logs}
            logsError={administrador.errorLogs}
            horariosDisponibles={administrador.horariosDisponibles}
            registrarAuditoria={administrador.registrarAuditoria}
            typePush={administrador.tipoPush}
            setTypePush={administrador.establecerTipoPush}
            loading={administrador.logsCargando}
        />
    );
}


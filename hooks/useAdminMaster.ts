import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useMiembros } from './useMiembros';
import { useAsistencias } from './useAsistencias';
import { useNoticias } from './useNoticias';
import { useNotificaciones } from './useNotificaciones';
import { useExportCSV } from './useExportCSV';
import { useAdminDashboard } from './useAdminDashboard';

export const useAdminMaster = () => {
    const [fechaInternal, setFechaInternal] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }));

    const { miembros, fetchMiembros } = useMiembros();
    const { asistencias, asistencias7dias, fetchAsistencias, fetchAsistencias7dias } = useAsistencias(fechaInternal);
    const { noticias, fetchNoticias, syncYouTube, eliminarNoticia } = useNoticias();
    const { logs, fetchLogs, enviarPushGeneral, error: logsError } = useNotificaciones();
    const {
        exportStart, setExportStart,
        exportEnd, setExportEnd,
        showExportModal, setShowExportModal,
        exportarCSVGlobal, exportarCSVRango
    } = useExportCSV();

    const dashboard = useAdminDashboard({ fetchAsistencias, fetchLogs });

    // Shell / Orchestration logic moved from page.tsx
    const enviarNotificacion = async () => {
        if (!dashboard.mensajePush) return;
        dashboard.setEnviando(true);
        const finalType = dashboard.typePush === 'General' ? 'service_reminder' : dashboard.typePush.toLowerCase();
        const result = await enviarPushGeneral(dashboard.tituloPush, dashboard.mensajePush, dashboard.imageUrlPush, finalType);

        if (result.success) {
            dashboard.setNotificacionStatus({ show: true, message: '✅ Notificación enviada', error: false });
            dashboard.setMensajePush('');
            dashboard.setImageUrlPush('');
            await dashboard.registrarAuditoria('NOTIFICACION GENERAL', `Dirigida a: ${dashboard.filtroHorario}. Mensaje: ${dashboard.mensajePush.substring(0, 50)}...`);
        } else {
            dashboard.setNotificacionStatus({ show: true, message: '❌ Error: ' + result.error, error: true });
        }
        dashboard.setEnviando(false);
        setTimeout(() => dashboard.setNotificacionStatus({ show: false, message: '', error: false }), 4000);
    };

    const exportarCSV = () => exportarCSVGlobal(dashboard.fechaSeleccionada, asistencias);

    const datosFiltrados = useMemo(() => (asistencias || []).filter((a: any) => {
        const nombre = `${a.miembros?.nombre || ''} ${a.miembros?.apellido || ''}`.toLowerCase();
        const cumpleHorario = dashboard.filtroHorario === 'Todas' || a.horario_reunion === dashboard.filtroHorario;
        return nombre.includes((dashboard.busqueda || '').toLowerCase()) && cumpleHorario;
    }), [asistencias, dashboard.filtroHorario, dashboard.busqueda]);

    // 1. Initial Data Fetch (Orchestration)
    useEffect(() => {
        if (dashboard.authorized) {
            fetchMiembros();
            dashboard.fetchCronogramas();
            dashboard.calcularOracionesActivas();
            dashboard.calcularNuevosMes();
            dashboard.cargarPremiosEntregados();
            dashboard.fetchBautismos();
            dashboard.fetchAyuda();
            fetchNoticias();
            fetchLogs();
            dashboard.fetchCrecimientoAnual();
            dashboard.fetchHorarios();
            dashboard.fetchAuditLogs();
        }
    }, [
        dashboard.authorized,
        fetchMiembros,
        dashboard.fetchCronogramas,
        dashboard.calcularOracionesActivas,
        dashboard.calcularNuevosMes,
        dashboard.cargarPremiosEntregados,
        dashboard.fetchBautismos,
        dashboard.fetchAyuda,
        fetchNoticias,
        fetchLogs,
        dashboard.fetchCrecimientoAnual,
        dashboard.fetchHorarios,
        dashboard.fetchAuditLogs
    ]);

    // 2. Date-specific Fetch sync
    useEffect(() => {
        if (dashboard.authorized) {
            setFechaInternal(dashboard.fechaSeleccionada);
        }
    }, [dashboard.authorized, dashboard.fechaSeleccionada]);

    // 4. Rewards calculation
    useEffect(() => {
        dashboard.calcularPremios(miembros, asistencias);
    }, [miembros, asistencias, dashboard.calcularPremios]);

    // 3. Realtime subscriptions
    useEffect(() => {
        if (dashboard.authorized) {
            const channels = [
                supabase.channel('cambios-asistencias').on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias()).subscribe(),
                supabase.channel('cambios-programas').on('postgres_changes', { event: '*', schema: 'public', table: 'cronogramas' }, () => dashboard.fetchCronogramas()).subscribe(),
                supabase.channel('cambios-logs').on('postgres_changes', { event: '*', schema: 'public', table: 'notificacion_logs' }, () => fetchLogs()).subscribe()
            ];

            return () => {
                channels.forEach((ch: any) => supabase.removeChannel(ch));
            };
        }
    }, [dashboard.authorized, fetchAsistencias, dashboard.fetchCronogramas, fetchLogs]);

    return {
        // Source hooks
        miembros, fetchMiembros,
        asistencias, asistencias7dias, fetchAsistencias, fetchAsistencias7dias,
        noticias, fetchNoticias, syncYouTube, eliminarNoticia,
        logs, fetchLogs, enviarPushGeneral, logsError,
        exportStart, setExportStart, exportEnd, setExportEnd, showExportModal, setShowExportModal, exportarCSVGlobal, exportarCSVRango,

        // Orchestrated logic
        enviarNotificacion,
        exportarCSV,
        datosFiltrados,

        // Dashboard/UI state & methods
        ...dashboard
    };
};

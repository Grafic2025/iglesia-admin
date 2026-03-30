import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../libreria/supabase';
import { usarMiembros } from './usarMiembros';
import { usarAsistencias } from './usarAsistencias';
import { usarNoticias } from './usarNoticias';
import { usarNotificaciones } from './usarNotificaciones';
import { usarExportCSV } from './usarExportarCSV';
import { usarAdminDashboard } from './usarPanelAdmin';
import { usarAdminAuth } from './usarAutenticacionAdmin';
import { usarAccionesMiembro } from './usarAccionesMiembros';

export const usarAdminMaster = () => {
    const [fechaInterna, establecerFechaInterna] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }));
    const [estaMenuLateralAbierto, establecerEstaMenuLateralAbierto] = useState(false);
    const alternarMenuLateral = useCallback(() => establecerEstaMenuLateralAbierto(prev => !prev), []);

    const autenticacion = usarAdminAuth();
    const { miembros, obtenerMiembros, cargando: miembrosCargando } = usarMiembros();
    const { asistencias, asistencias7dias, obtenerAsistencias, obtenerAsistencias7Dias, cargando: asistenciasCargando } = usarAsistencias(fechaInterna);
    const { noticias, obtenerNoticias, sincronizarYouTube, eliminarNoticia } = usarNoticias();
    const { registros: logs, obtenerRegistros: obtenerLogs, enviarPushGeneral, error: errorLogs, cargando: logsCargando } = usarNotificaciones();
    const {
        inicioExportacion, establecerInicioExportacion,
        finExportacion, establecerFinExportacion,
        mostrarModalExportacion, establecerMostrarModalExportacion,
        exportarCSVGlobal, exportarCSVRango
    } = usarExportCSV();

    const panel = usarAdminDashboard({ obtenerAsistencias, obtenerLogs });

    const accionesMiembro = usarAccionesMiembro({
        obtenerMiembros,
        obtenerAsistencias,
        enviarNotificacionIndividual: panel.enviarNotificacionIndividual,
        registrarAuditoria: panel.registrarAuditoria
    });

    // Lógica de Shell / Orquestación
    const enviarNotificacion = async () => {
        if (!panel.mensajePush) return;
        panel.establecerEstaEnviando(true);
        const tipoFinal = panel.tipoPush === 'General' ? 'service_reminder' : panel.tipoPush.toLowerCase();
        const resultado = await enviarPushGeneral(panel.tituloPush, panel.mensajePush, panel.urlImagenPush, tipoFinal);

        if (resultado.exito) {
            panel.establecerEstadoNotificacion({ mostrar: true, mensaje: '✅ Notificación enviada', error: false });
            panel.establecerMensajePush('');
            panel.establecerUrlImagenPush('');
            await panel.registrarAuditoria('NOTIFICACION GENERAL', `Dirigida a: ${panel.filtroHorario}. Mensaje: ${panel.mensajePush.substring(0, 50)}...`);
        } else {
            panel.establecerEstadoNotificacion({ mostrar: true, mensaje: '❌ Error: ' + resultado.error, error: true });
        }
        panel.establecerEstaEnviando(false);
        setTimeout(() => panel.establecerEstadoNotificacion({ mostrar: false, mensaje: '', error: false }), 4000);
    };

    const exportarCSV = () => exportarCSVGlobal(panel.fechaSeleccionada, asistencias);

    const eliminarProgramacion = async (id: string) => {
        if (!confirm('¿Eliminar esta programación?')) return;
        const { error } = await supabase.from('cronogramas').delete().eq('id', id);
        if (!error) panel.obtenerCronogramas();
        else alert('Error: ' + error.message);
    };

    const datosFiltrados = useMemo(() => (asistencias || []).filter((a: any) => {
        const nombre = `${a.miembros?.nombre || ''} ${a.miembros?.apellido || ''}`.toLowerCase();
        const cumpleHorario = panel.filtroHorario === 'Todas' || a.horario_reunion === panel.filtroHorario;
        return nombre.includes((panel.busqueda || '').toLowerCase()) && cumpleHorario;
    }), [asistencias, panel.filtroHorario, panel.busqueda]);

    // 1. Carga inicial de datos (Orquestación)
    useEffect(() => {
        if (autenticacion.autorizado) {
            obtenerMiembros();
            panel.obtenerCronogramas();
            panel.calcularOracionesActivas();
            panel.calcularNuevosMes();
            panel.cargarPremiosEntregados();
            panel.obtenerBautismos();
            panel.obtenerAyuda();
            obtenerNoticias();
            obtenerLogs();
            panel.obtenerCrecimientoAnual();
            panel.obtenerHorarios();
            panel.obtenerLogsAuditoria();
        }
    }, [
        autenticacion.autorizado,
        obtenerMiembros,
        panel.obtenerCronogramas,
        panel.calcularOracionesActivas,
        panel.calcularNuevosMes,
        panel.cargarPremiosEntregados,
        panel.obtenerBautismos,
        panel.obtenerAyuda,
        obtenerNoticias,
        obtenerLogs,
        panel.obtenerCrecimientoAnual,
        panel.obtenerHorarios,
        panel.obtenerLogsAuditoria
    ]);

    // 2. Sincronización de fecha seleccionada
    useEffect(() => {
        if (autenticacion.autorizado) {
            establecerFechaInterna(panel.fechaSeleccionada);
        }
    }, [autenticacion.autorizado, panel.fechaSeleccionada]);

    // 3. Cálculo de premios y retención
    useEffect(() => {
        panel.calcularPremios(miembros, asistencias);
        if (miembros.length > 0) {
            panel.calcularTasaRetencion(miembros.length);
        }
    }, [miembros, asistencias, panel.calcularPremios, panel.calcularTasaRetencion]);

    // 4. Suscripciones en tiempo real mejoradas
    useEffect(() => {
        if (autenticacion.autorizado) {
            const canales = [
                supabase.channel('asistencias-live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'asistencias' }, (p) => {
                    obtenerAsistencias();
                    panel.establecerEstadoNotificacion({ mostrar: true, mensaje: '📍 Nueva asistencia marcada', error: false });
                    setTimeout(() => panel.establecerEstadoNotificacion({ mostrar: false, mensaje: '', error: false }), 4000);
                }).subscribe(),
                supabase.channel('miembros-live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'miembros' }, (p) => {
                    obtenerMiembros();
                    panel.establecerEstadoNotificacion({ mostrar: true, mensaje: `👤 ¡Nuevo miembro: ${p.new.nombre}!`, error: false });
                    setTimeout(() => panel.establecerEstadoNotificacion({ mostrar: false, mensaje: '', error: false }), 4000);
                }).subscribe(),
                supabase.channel('cambios-programas').on('postgres_changes', { event: '*', schema: 'public', table: 'cronogramas' }, () => panel.obtenerCronogramas()).subscribe(),
                supabase.channel('cambios-logs').on('postgres_changes', { event: '*', schema: 'public', table: 'notificacion_logs' }, () => obtenerLogs()).subscribe()
            ];

            return () => {
                canales.forEach((ch: any) => supabase.removeChannel(ch));
            };
        }
    }, [autenticacion.autorizado, obtenerAsistencias, obtenerMiembros, panel.obtenerCronogramas, obtenerLogs]);

    return {
        // Hooks de origen
        miembros, obtenerMiembros, miembrosCargando,
        asistencias, asistencias7dias, obtenerAsistencias, obtenerAsistencias7Dias, asistenciasCargando,
        noticias, obtenerNoticias, sincronizarYouTube, eliminarNoticia,
        logs, obtenerLogs, enviarPushGeneral, errorLogs, logsCargando,
        inicioExportacion, establecerInicioExportacion, finExportacion, establecerFinExportacion, mostrarModalExportacion, establecerMostrarModalExportacion, exportarCSVGlobal, exportarCSVRango,

        // Lógica orquestada
        enviarNotificacion,
        exportarCSV,
        eliminarProgramacion,
        datosFiltrados,

        // Estado de UI combinado y métodos
        ...panel,
        ...autenticacion,
        ...accionesMiembro,
        estaMenuLateralAbierto,
        establecerEstaMenuLateralAbierto,
        alternarMenuLateral
    };
};


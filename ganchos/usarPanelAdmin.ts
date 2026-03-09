'use client';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../libreria/supabase';

interface PropiedadesUsoAdminDashboard {
    obtenerAsistencias?: () => void;
    obtenerLogs?: () => void;
}

export function usarAdminDashboard({ obtenerAsistencias, obtenerLogs }: PropiedadesUsoAdminDashboard) {
    const [pestanaActiva, establecerPestanaActiva] = useState('panel');

    // Estados de UI
    const [filtroHorario, establecerFiltroHorario] = useState('Todas');
    const [busqueda, establecerBusqueda] = useState('');
    const [fechaSeleccionada, establecerFechaSeleccionada] = useState('');
    const [tituloPush, establecerTituloPush] = useState('Iglesia del Salvador');
    const [mensajePush, establecerMensajePush] = useState('');
    const [urlImagenPush, establecerUrlImagenPush] = useState('');
    const [tipoPush, establecerTipoPush] = useState('General');
    const [estaEnviando, establecerEstaEnviando] = useState(false);
    const [estadoNotificacion, establecerEstadoNotificacion] = useState({ mostrar: false, mensaje: '', error: false });

    // Estados de Datos
    const [cronogramas, establecerCronogramas] = useState<any[]>([]);
    const [premiosPendientes, establecerPremiosPendientes] = useState<any>({ nivel5: [], nivel10: [], nivel20: [], nivel30: [] });
    const [oracionesActivas, establecerOracionesActivas] = useState(0);
    const [nuevosMes, establecerNuevosMes] = useState(0);
    const [tasaRetencion, establecerTasaRetencion] = useState(0);
    const [premiosEntregados, establecerPremiosEntregados] = useState<any[]>([]);
    const [bautismos, establecerBautismos] = useState<any[]>([]);
    const [ayuda, establecerAyuda] = useState<any[]>([]);
    const [horariosDisponibles, establecerHorariosDisponibles] = useState<any[]>([]);
    const [logsAuditoria, establecerLogsAuditoria] = useState<any[]>([]);
    const [crecimientoAnual, establecerCrecimientoAnual] = useState<any[]>([]);
    const [ausentes, establecerAusentes] = useState<any[]>([]);
    const [servidoresQuemados, establecerServidoresQuemados] = useState<any[]>([]);
    const [hoyArg, establecerHoyArg] = useState('');

    // Inicialización segura para hidratación
    useEffect(() => {
        const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
        establecerFechaSeleccionada(hoy);
        establecerHoyArg(hoy);
    }, []);

    // Lógica de obtención de datos
    const obtenerCronogramas = useCallback(async () => {
        const { data } = await supabase.from('cronogramas').select('*').order('fecha', { ascending: true }).limit(20);
        if (data) establecerCronogramas(data);
    }, []);

    const calcularOracionesActivas = useCallback(async () => {
        const { count } = await supabase.from('pedidos_oracion').select('*', { count: 'exact', head: true });
        establecerOracionesActivas(count || 0);
    }, []);

    const calcularNuevosMes = useCallback(async () => {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const { count } = await supabase.from('miembros').select('*', { count: 'exact', head: true }).gte('created_at', inicioMes.toISOString());
        establecerNuevosMes(count || 0);
    }, []);

    const calcularTasaRetencion = useCallback(async (totalMiembros: number) => {
        if (totalMiembros === 0) return;
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        const { data } = await supabase.from('asistencias').select('miembro_id, miembros(id, nombre, apellido, foto_perfil)').gte('fecha', hace30Dias.toISOString().split('T')[0]);
        if (data) {
            const activos = new Set(data.map(a => a.miembro_id)).size;
            establecerTasaRetencion(Math.round((activos / totalMiembros) * 100));
            // Simulate smart analytics for lack of attendance based on missing people in this query (Normally a complex SQL Join)
        }
    }, []);

    const cargarPremiosEntregados = useCallback(async () => {
        const { data } = await supabase.from('premios_entregados').select('*').order('created_at', { ascending: false });
        if (data) establecerPremiosEntregados(data);
    }, []);

    const obtenerBautismos = useCallback(async () => {
        const { data } = await supabase.from('solicitudes_bautismo').select('*').order('created_at', { ascending: false });
        if (data) establecerBautismos(data);
    }, []);

    const obtenerAyuda = useCallback(async () => {
        const { data } = await supabase.from('consultas_ayuda').select('*').order('created_at', { ascending: false });
        if (data) establecerAyuda(data);
    }, []);

    const obtenerLogsAuditoria = useCallback(async () => {
        const { data } = await supabase.from('auditoria').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) establecerLogsAuditoria(data);
    }, []);

    const obtenerHorarios = useCallback(async () => {
        const { data } = await supabase.from('configuracion').select('*').eq('clave', 'horarios_reunion').maybeSingle();
        if (data) establecerHorariosDisponibles(data.valor || []);
        else establecerHorariosDisponibles(['09:00', '11:00', '20:00']);
    }, []);

    const obtenerCrecimientoAnual = useCallback(async () => {
        const datosPrueba = [
            { mes: 'Ene', cantidad: 150 }, { mes: 'Feb', cantidad: 165 }, { mes: 'Mar', cantidad: 180 },
            { mes: 'Abr', cantidad: 195 }, { mes: 'May', cantidad: 210 }, { mes: 'Jun', cantidad: 240 },
            { mes: 'Jul', cantidad: 265 }, { mes: 'Ago', cantidad: 290 }, { mes: 'Sep', cantidad: 310 },
            { mes: 'Oct', cantidad: 340 }, { mes: 'Nov', cantidad: 365 }, { mes: 'Dic', cantidad: 400 }
        ];
        establecerCrecimientoAnual(datosPrueba);
    }, []);

    // Controladores globales
    const registrarAuditoria = async (accion: string, detalle: string) => {
        await supabase.from('auditoria').insert([{ accion, detalle, administrador_id: 'administrador_general' }]);
        obtenerLogsAuditoria();
    };

    const marcarComoEntregado = async (miembroId: string, nivel: number, nombreCompleto: string) => {
        if (!confirm(`¿Marcar como entregado el premio de nivel ${nivel} para ${nombreCompleto}?`)) return;
        const { error } = await supabase.from('premios_entregados').insert({ miembro_id: miembroId, nivel, entregado_por: 'Admin', notas: '' });
        if (error) alert('Error: ' + error.message);
        else {
            alert('✅ Premio entregado');
            cargarPremiosEntregados();
            if (obtenerAsistencias) obtenerAsistencias();
            await registrarAuditoria('ENTREGA PREMIO', `Nivel ${nivel} entregado a ${nombreCompleto}`);
        }
    };

    const enviarNotificacionIndividual = async (token: string, nombre: string, mensajePersonalizado?: string, tipo: string = 'service_reminder', datosExtra: any = {}) => {
        const mensaje = mensajePersonalizado || prompt(`Enviar notificación a ${nombre}:\nEscribe el mensaje:`);
        if (!mensaje) return false;

        try {
            const respuesta = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Iglesia del Salvador',
                    message: mensaje,
                    specificToken: token,
                    type: tipo,
                    ...datosExtra
                }),
            });

            const datos = await respuesta.json();
            if (respuesta.ok && datos.success) {
                if (!mensajePersonalizado) alert(`✅ Enviado a ${nombre}`);
                if (obtenerLogs) obtenerLogs();
                return true;
            } else {
                if (!mensajePersonalizado) alert(`❌ Error al enviar a ${nombre}: ${datos.error || 'Desconocido'}`);
                return false;
            }
        } catch (error: any) {
            if (!mensajePersonalizado) alert(`❌ Error de red al enviar a ${nombre}`);
            return false;
        }
    };

    const calcularPremios = useCallback((miembros: any[], asistencias: any[]) => {
        const pendientes: any = { nivel5: [], nivel10: [], nivel20: [], nivel30: [] };
        miembros.forEach(m => {
            const asists = asistencias.filter(a => a.miembro_id === m.id);
            const racha = asists.length;
            if (racha >= 30) pendientes.nivel30.push({ ...m, racha });
            else if (racha >= 20) pendientes.nivel20.push({ ...m, racha });
            else if (racha >= 10) pendientes.nivel10.push({ ...m, racha });
            else if (racha >= 5) pendientes.nivel5.push({ ...m, racha });
        });
        establecerPremiosPendientes(pendientes);
    }, []);

    return {
        pestanaActiva, establecerPestanaActiva,
        filtroHorario, establecerFiltroHorario,
        busqueda, establecerBusqueda,
        fechaSeleccionada, establecerFechaSeleccionada,
        tituloPush, establecerTituloPush,
        mensajePush, establecerMensajePush,
        urlImagenPush, establecerUrlImagenPush,
        tipoPush, establecerTipoPush,
        estaEnviando, establecerEstaEnviando,
        estadoNotificacion, establecerEstadoNotificacion,
        cronogramas, establecerCronogramas,
        premiosPendientes,
        oracionesActivas,
        nuevosMes,
        tasaRetencion,
        premiosEntregados,
        bautismos,
        ayuda,
        horariosDisponibles,
        logsAuditoria,
        crecimientoAnual,
        hoyArg,
        obtenerCronogramas,
        calcularOracionesActivas,
        calcularNuevosMes,
        calcularTasaRetencion,
        cargarPremiosEntregados,
        obtenerBautismos,
        obtenerAyuda,
        obtenerLogsAuditoria,
        obtenerHorarios,
        obtenerCrecimientoAnual,
        registrarAuditoria,
        marcarComoEntregado,
        enviarNotificacionIndividual,
        calcularPremios,
        ausentes,
        servidoresQuemados
    };
}


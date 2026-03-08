'use client';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseAdminDashboardProps {
    fetchAsistencias?: () => void;
    fetchLogs?: () => void;
}

export function useAdminDashboard({ fetchAsistencias, fetchLogs }: UseAdminDashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // UI States
    const [filtroHorario, setFiltroHorario] = useState('Todas');
    const [busqueda, setBusqueda] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [tituloPush, setTituloPush] = useState('Iglesia del Salvador');
    const [mensajePush, setMensajePush] = useState('');
    const [imageUrlPush, setImageUrlPush] = useState('');
    const [typePush, setTypePush] = useState('General');
    const [enviando, setEnviando] = useState(false);
    const [notificacionStatus, setNotificacionStatus] = useState({ show: false, message: '', error: false });

    // Data States
    const [cronogramas, setCronogramas] = useState<any[]>([]);
    const [premiosPendientes, setPremiosPendientes] = useState<any>({ nivel5: [], nivel10: [], nivel20: [], nivel30: [] });
    const [oracionesActivas, setOracionesActivas] = useState(0);
    const [nuevosMes, setNuevosMes] = useState(0);
    const [premiosEntregados, setPremiosEntregados] = useState<any[]>([]);
    const [bautismos, setBautismos] = useState<any[]>([]);
    const [ayuda, setAyuda] = useState<any[]>([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [crecimientoAnual, setCrecimientoAnual] = useState<any[]>([]);
    const [hoyArg, setHoyArg] = useState('');

    // Hydration safe init
    useEffect(() => {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
        setFechaSeleccionada(today);
        setHoyArg(today);
    }, []);

    // 2. Data Fetching Logic
    const fetchCronogramas = useCallback(async () => {
        const { data } = await supabase.from('cronogramas').select('*').order('fecha', { ascending: true }).limit(20);
        if (data) setCronogramas(data);
    }, []);

    const calcularOracionesActivas = useCallback(async () => {
        const { count } = await supabase.from('pedidos_oracion').select('*', { count: 'exact', head: true });
        setOracionesActivas(count || 0);
    }, []);

    const calcularNuevosMes = useCallback(async () => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const { count } = await supabase.from('miembros').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString());
        setNuevosMes(count || 0);
    }, []);

    const cargarPremiosEntregados = useCallback(async () => {
        const { data } = await supabase.from('premios_entregados').select('*').order('created_at', { ascending: false });
        if (data) setPremiosEntregados(data);
    }, []);

    const fetchBautismos = useCallback(async () => {
        const { data } = await supabase.from('solicitudes_bautismo').select('*').order('created_at', { ascending: false });
        if (data) setBautismos(data);
    }, []);

    const fetchAyuda = useCallback(async () => {
        const { data } = await supabase.from('consultas_ayuda').select('*').order('created_at', { ascending: false });
        if (data) setAyuda(data);
    }, []);

    const fetchAuditLogs = useCallback(async () => {
        const { data } = await supabase.from('auditoria').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) setAuditLogs(data);
    }, []);

    const fetchHorarios = useCallback(async () => {
        const { data } = await supabase.from('configuracion').select('*').eq('clave', 'horarios_reunion').maybeSingle();
        if (data) setHorariosDisponibles(data.valor || []);
        else setHorariosDisponibles(['09:00', '11:00', '20:00']);
    }, []);

    const fetchCrecimientoAnual = useCallback(async () => {
        const dummy = [
            { mes: 'Ene', c: 150 }, { mes: 'Feb', c: 165 }, { mes: 'Mar', c: 180 },
            { mes: 'Abr', c: 195 }, { mes: 'May', c: 210 }, { mes: 'Jun', c: 240 },
            { mes: 'Jul', c: 265 }, { mes: 'Ago', c: 290 }, { mes: 'Sep', c: 310 },
            { mes: 'Oct', c: 340 }, { mes: 'Nov', c: 365 }, { mes: 'Dic', c: 400 }
        ];
        setCrecimientoAnual(dummy);
    }, []);

    // 3. Global Handlers
    const registrarAuditoria = async (accion: string, detalle: string) => {
        await supabase.from('auditoria').insert([{ accion, detalle, admin_id: 'admin_general' }]);
        fetchAuditLogs();
    };

    const marcarComoEntregado = async (miembroId: string, nivel: number, nombreCompleto: string) => {
        if (!confirm(`¿Marcar como entregado el premio de nivel ${nivel} para ${nombreCompleto}?`)) return;
        const { error } = await supabase.from('premios_entregados').insert({ miembro_id: miembroId, nivel, entregado_por: 'Admin', notas: '' });
        if (error) alert('Error: ' + error.message);
        else {
            alert('✅ Premio entregado');
            cargarPremiosEntregados();
            if (fetchAsistencias) fetchAsistencias();
            await registrarAuditoria('ENTREGA PREMIO', `Nivel ${nivel} entregado a ${nombreCompleto}`);
        }
    };

    const enviarNotificacionIndividual = async (token: string, nombre: string, mensajeCustom?: string, type: string = 'service_reminder', extraData: any = {}) => {
        const mensaje = mensajeCustom || prompt(`Enviar notificación a ${nombre}:\nEscribe el mensaje:`);
        if (!mensaje) return false;

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Iglesia del Salvador',
                    message: mensaje,
                    specificToken: token,
                    type: type,
                    ...extraData
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (!mensajeCustom) alert(`✅ Enviado a ${nombre}`);
                if (fetchLogs) fetchLogs();
                return true;
            } else {
                if (!mensajeCustom) alert(`❌ Error al enviar a ${nombre}: ${data.error || 'Desconocido'}`);
                return false;
            }
        } catch (e: any) {
            if (!mensajeCustom) alert(`❌ Error de red al enviar a ${nombre}`);
            return false;
        }
    };

    const calcularPremios = useCallback((miembros: any[], asistencias: any[]) => {
        const pend: any = { nivel5: [], nivel10: [], nivel20: [], nivel30: [] };
        miembros.forEach(m => {
            const asist = asistencias.filter(a => a.miembro_id === m.id);
            const racha = asist.length;
            if (racha >= 30) pend.nivel30.push({ ...m, racha });
            else if (racha >= 20) pend.nivel20.push({ ...m, racha });
            else if (racha >= 10) pend.nivel10.push({ ...m, racha });
            else if (racha >= 5) pend.nivel5.push({ ...m, racha });
        });
        setPremiosPendientes(pend);
    }, []);

    return {
        activeTab, setActiveTab,
        filtroHorario, setFiltroHorario,
        busqueda, setBusqueda,
        fechaSeleccionada, setFechaSeleccionada,
        tituloPush, setTituloPush,
        mensajePush, setMensajePush,
        imageUrlPush, setImageUrlPush,
        typePush, setTypePush,
        enviando, setEnviando,
        notificacionStatus, setNotificacionStatus,
        cronogramas, setCronogramas,
        premiosPendientes,
        oracionesActivas,
        nuevosMes,
        premiosEntregados,
        bautismos,
        ayuda,
        horariosDisponibles,
        auditLogs,
        crecimientoAnual,
        hoyArg,
        fetchCronogramas,
        calcularOracionesActivas,
        calcularNuevosMes,
        cargarPremiosEntregados,
        fetchBautismos,
        fetchAyuda,
        fetchAuditLogs,
        fetchHorarios,
        fetchCrecimientoAnual,
        registrarAuditoria,
        marcarComoEntregado,
        enviarNotificacionIndividual,
        calcularPremios
    };
}

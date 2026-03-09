import { useState, useMemo } from 'react';

interface UseNotificacionesAdminProps {
    supabase: any;
    logs: any[];
    fetchProgramaciones: () => void;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function usarNotificacionesAdmin({ supabase, logs, fetchProgramaciones, registrarAuditoria }: UseNotificacionesAdminProps) {
    const [logSearch, setLogSearch] = useState('');
    const [logPage, setLogPage] = useState(1);
    const [logStatusFilter, setLogStatusFilter] = useState('Todos');

    // New schedule states
    const [nMensaje, setNMensaje] = useState('');
    const [nDia, setNDia] = useState('Todos los días');
    const [nHora, setNHora] = useState('');

    const filteredLogs = useMemo(() => {
        return (logs || []).filter(l => {
            const matchSearch = !logSearch ||
                l.titulo?.toLowerCase().includes(logSearch.toLowerCase()) ||
                l.mensaje?.toLowerCase().includes(logSearch.toLowerCase()) ||
                (l.fecha ? new Date(l.fecha).toLocaleDateString().includes(logSearch) : false);
            const matchStatus = logStatusFilter === 'Todos' || l.estado === logStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [logs, logSearch, logStatusFilter]);

    const LOGS_PER_PAGE = 20;
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
    const paginatedLogs = filteredLogs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);

    const handleScheduleNotification = async () => {
        if (!nMensaje || !nHora) return alert('Completa mensaje y hora');
        const { error } = await supabase.from('cronogramas').insert([{
            mensaje: nMensaje,
            dia_semana: nDia,
            hora: nHora,
            activo: true,
            ultimo_estado: 'Pendiente'
        }]);

        if (error) alert('Error: ' + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('PROGRAMAR MENSAJE', nMensaje);
            setNMensaje('');
            setNHora('');
            fetchProgramaciones();
        }
    };

    return {
        logSearch, setLogSearch,
        logPage, setLogPage,
        logStatusFilter, setLogStatusFilter,
        nMensaje, setNMensaje,
        nDia, setNDia,
        nHora, setNHora,
        filteredLogs,
        totalPages,
        paginatedLogs,
        handleScheduleNotification
    };
}


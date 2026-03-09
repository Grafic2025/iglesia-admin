import { useState, useMemo } from 'react';

const LOGS_PER_PAGE = 25;

interface UseAuditoriaProps {
    logs: any[];
}

export function usarAuditoria({ logs }: UseAuditoriaProps) {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('Todas');
    const [page, setPage] = useState(1);

    const actionTypes = useMemo(() => {
        const tipos = new Set((logs || []).map(l => l.accion));
        return ['Todas', ...Array.from(tipos)];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return (logs || []).filter(l => {
            const matchSearch = !search ||
                l.accion?.toLowerCase().includes(search.toLowerCase()) ||
                l.detalle?.toLowerCase().includes(search.toLowerCase()) ||
                l.administrador_id?.toLowerCase().includes(search.toLowerCase()) ||
                (l.created_at ? new Date(l.created_at).toLocaleString('es-AR').includes(search) : false);
            const matchAction = actionFilter === 'Todas' || l.accion === actionFilter;
            return matchSearch && matchAction;
        });
    }, [logs, search, actionFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
    const paginatedLogs = filteredLogs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
    };

    const handleActionFilter = (v: string) => {
        setActionFilter(v);
        setPage(1);
    };

    return {
        search,
        setSearch: handleSearch,
        actionFilter,
        setActionFilter: handleActionFilter,
        page,
        setPage,
        actionTypes,
        filteredLogs,
        totalPages,
        paginatedLogs
    };
}


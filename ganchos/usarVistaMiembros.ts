import { useState } from 'react';

const PAGE_SIZE = 25;

interface UseVistaMiembrosProps {
    supabase: any;
    setBusqueda: (v: string) => void;
    setFiltroHorario: (v: string) => void;
    fetchAsistencias: () => Promise<void>;
    fetchMiembros: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    datosFiltrados: any[];
}

export function usarVistaMiembros({
    supabase,
    setBusqueda,
    setFiltroHorario,
    fetchAsistencias,
    fetchMiembros,
    registrarAuditoria,
    datosFiltrados
}: UseVistaMiembrosProps) {
    const [page, setPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const totalPages = Math.max(1, Math.ceil(datosFiltrados.length / PAGE_SIZE));
    const paginatedData = datosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleBusqueda = (v: string) => {
        setBusqueda(v);
        setPage(1);
    };

    const handleFiltro = (v: string) => {
        setFiltroHorario(v);
        setPage(1);
    };

    const toggleServerStatus = async (miembroId: string, nombreCompleto: string, currentStatus: boolean) => {
        const newVal = !currentStatus;
        const { error } = await supabase.from('miembros').update({ es_servidor: newVal }).eq('id', miembroId);

        if (!error) {
            await fetchAsistencias();
            await fetchMiembros();
            if (registrarAuditoria) {
                await registrarAuditoria(
                    newVal ? 'DAR ACCESO SERVIDOR' : 'QUITAR ACCESO SERVIDOR',
                    nombreCompleto
                );
            }
        } else {
            alert("Error: " + error.message);
        }
    };

    const resetearPin = async (miembroId: string, nombreCompleto: string) => {
        if (!confirm(`¿Seguro quieres resetear el PIN de ${nombreCompleto}? Podrá crear uno nuevo la próxima vez que intente ingresar.`)) return;
        const { error } = await supabase.from('miembros').update({ pin: null }).eq('id', miembroId);

        if (!error) {
            alert('PIN reseteado correctamente');
            await fetchAsistencias();
            await fetchMiembros();
            if (registrarAuditoria) {
                await registrarAuditoria('RESETEAR PIN', nombreCompleto);
            }
        } else {
            alert("Error: " + error.message);
        }
    };

    return {
        page,
        setPage,
        selectedMember,
        setSelectedMember,
        handleBusqueda,
        handleFiltro,
        toggleServerStatus,
        resetearPin,
        totalPages,
        paginatedData
    };
}


import { useState, useMemo } from 'react';
import { supabase } from '../libreria/supabase';

interface UseGenteProps {
    miembros: any[];
    fetchMiembros: () => Promise<void>;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function usarGente({ miembros, fetchMiembros, enviarNotificacionIndividual, registrarAuditoria }: UseGenteProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [timeFilter, setTimeFilter] = useState('Todos');
    const [showArchived, setShowArchived] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMember, setNewMember] = useState({ nombre: '', apellido: '', celular: '' });
    const [saving, setSaving] = useState(false);

    const toggleServerStatus = async (miembro: any) => {
        const nuevoEstado = !miembro.es_servidor;
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: nuevoEstado })
            .eq('id', miembro.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            if (nuevoEstado && miembro.token_notificacion) {
                await enviarNotificacionIndividual(
                    miembro.token_notificacion,
                    miembro.nombre,
                    `¡Hola ${miembro.nombre}! 🎉 Has sido habilitado como SERVIDOR en Iglesia del Salvador. ¡Gracias por sumarte al equipo! 🙌`
                );
            }
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO SERVIDOR' : 'QUITAR ACCESO SERVIDOR', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const toggleAdminStatus = async (miembro: any) => {
        const nuevoEstado = !miembro.es_administrador;
        const { error } = await supabase
            .from('miembros')
            .update({ es_administrador: nuevoEstado })
            .eq('id', miembro.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            if (nuevoEstado && miembro.token_notificacion) {
                await enviarNotificacionIndividual(
                    miembro.token_notificacion,
                    miembro.nombre,
                    `¡Hola ${miembro.nombre}! 🛡️ Has sido designado como ADMINISTRADOR en Iglesia del Salvador. Ahora podés ver todos los planes de culto desde tu app.`
                );
            }
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO ADMIN' : 'QUITAR ACCESO ADMIN', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const handleArchive = async (miembro: any) => {
        if (!confirm(`¿Archivar a ${miembro.nombre} ${miembro.apellido}? Ya no aparecerá en la lista principal.`)) return;
        const { error } = await supabase.from('miembros').update({ activo: false }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('ARCHIVAR MIEMBRO', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const handleRestore = async (miembro: any) => {
        const { error } = await supabase.from('miembros').update({ activo: true }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('RESTAURAR MIEMBRO', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const handleCreateMember = async () => {
        if (!newMember.nombre || !newMember.apellido) return alert("Nombre y apellido son obligatorios");
        setSaving(true);
        const { error } = await supabase.from('miembros').insert([{
            nombre: newMember.nombre,
            apellido: newMember.apellido,
            celular: newMember.celular,
            activo: true,
            es_servidor: false,
            es_administrador: false,
            created_at: new Date().toISOString()
        }]);

        if (error) {
            alert("Error al crear miembro: " + error.message);
        } else {
            if (registrarAuditoria) await registrarAuditoria('CREAR MIEMBRO', `${newMember.nombre} ${newMember.apellido}`);
            setShowCreateModal(false);
            setNewMember({ nombre: '', apellido: '', celular: '' });
            await fetchMiembros();
        }
        setSaving(false);
    };

    const filteredMiembros = useMemo(() => {
        let list = miembros;

        if (showArchived) {
            list = list.filter(m => m.activo === false);
        } else {
            list = list.filter(m => m.activo !== false);
        }

        if (timeFilter !== 'Todos') {
            const now = new Date();
            const cutoff = new Date();
            if (timeFilter === 'Hoy') cutoff.setHours(0, 0, 0, 0);
            else if (timeFilter === 'Semana') cutoff.setDate(now.getDate() - 7);
            else if (timeFilter === 'Mes') cutoff.setMonth(now.getMonth() - 1);
            list = list.filter(m => new Date(m.created_at) >= cutoff);
        }

        if (search) {
            list = list.filter(m =>
                `${m.nombre} ${m.apellido}`.toLowerCase().includes(search.toLowerCase())
            );
        }

        return list;
    }, [miembros, search, timeFilter, showArchived]);

    const stats = useMemo(() => {
        const totalActivos = (miembros || []).filter(m => m.activo !== false).length;
        const totalServidores = (miembros || []).filter(m => m.es_servidor).length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nuevosHoy = (miembros || []).filter(m => m.created_at && new Date(m.created_at) >= today).length;
        const hace7d = new Date();
        hace7d.setDate(hace7d.getDate() - 7);
        const nuevosSemana = (miembros || []).filter(m => m.created_at && new Date(m.created_at) >= hace7d).length;

        return { totalActivos, totalServidores, nuevosHoy, nuevosSemana };
    }, [miembros]);

    return {
        search,
        setSearch,
        page,
        setPage,
        timeFilter,
        setTimeFilter,
        showArchived,
        setShowArchived,
        showCreateModal,
        setShowCreateModal,
        newMember,
        setNewMember,
        saving,
        toggleServerStatus,
        toggleAdminStatus,
        handleArchive,
        handleRestore,
        handleCreateMember,
        filteredMiembros,
        stats
    };
}


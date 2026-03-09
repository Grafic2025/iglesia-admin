import { useState, useEffect } from 'react';

interface UseEquiposProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>;
}

export function usarEquipos({ supabase, registrarAuditoria, enviarNotificacionIndividual }: UseEquiposProps) {
    const [loading, setLoading] = useState(true);
    const [equipos, setTeams] = useState<any[]>([]);
    const [miembros, setMembers] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showModalNuevoEquipo, setShowModalNuevoEquipo] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [showModalComposicionEquipo, setShowModalComposicionEquipo] = useState(false);

    // Form states
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamIcon, setNewTeamIcon] = useState('🎸');
    const [searchQuery, setSearchQuery] = useState('');
    const [assignRole, setAssignRole] = useState('');

    const [blockouts, setBlockouts] = useState<any[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateSchedule, setSelectedDateSchedule] = useState<any>(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { data: equiposData, error: equiposError } = await supabase.from('equipos').select('*');
            if (equiposError) throw equiposError;

            const equiposWithCounts = await Promise.all((equiposData || []).map(async (t: any) => {
                const { count } = await supabase.from('miembros_equipos').select('*', { count: 'exact', head: true }).eq('equipo_id', t.id);
                return { ...t, miembros: count || 0 };
            }));

            setTeams(equiposWithCounts);

            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

            const { data: scheds } = await supabase
                .from('cronogramas')
                .select('*')
                .gte('fecha', firstDay)
                .lte('fecha', lastDay)
                .order('fecha', { ascending: true });

            setUpcomingSchedules(scheds || []);

            const todayStr = new Date().toISOString().split('T')[0];
            const nextOne = (scheds || []).find((s: any) => s.fecha >= todayStr) || (scheds || [])[0];
            if (!selectedDateSchedule) setSelectedDateSchedule(nextOne);

            const { data: miembrosData } = await supabase.from('miembros').select('*').eq('es_servidor', true);
            setMembers(miembrosData || []);

            const today = new Date().toISOString().split('T')[0];
            const { data: blocksData } = await supabase
                .from('bloqueos_servidores')
                .select('*, miembros(nombre, apellido)')
                .gte('fecha_fin', today)
                .order('fecha_inicio', { ascending: true });

            setBlockouts(blocksData?.map((b: any) => ({
                id: b.id,
                name: b.miembros ? `${b.miembros.nombre || ''} ${b.miembros.apellido || ''}` : 'Sin nombre',
                date: `${new Date(b.fecha_inicio + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })} - ${new Date(b.fecha_fin + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })}`,
                reason: b.motivo
            })) || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [supabase, currentMonth]);

    const handleSelectTeam = async (team: any) => {
        setSelectedTeam(team);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('miembros_equipos')
                .select(`id, rol, miembro_id, miembros (nombre, apellido, foto_url)`)
                .eq('equipo_id', team.id);

            if (error) {
                console.error("Error al cargar miembros del equipo:", error);
                setTeamMembers([]);
            } else {
                setTeamMembers(data || []);
            }
            setShowTeamModal(true);
        } catch (err: any) {
            console.error("Excepción al seleccionar equipo:", err);
            setShowTeamModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName) return;
        const { error } = await supabase.from('equipos').insert([{ nombre: newTeamName, icono: newTeamIcon }]);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('CREAR EQUIPO', newTeamName);
            setShowModalNuevoEquipo(false);
            setNewTeamName('');
            fetchInitialData();
        }
    };

    const handleAssignMember = async (memberId: string) => {
        if (!selectedTeam) return;
        const { error } = await supabase.from('miembros_equipos').insert([{
            equipo_id: selectedTeam.id,
            miembro_id: memberId,
            rol: assignRole || 'General'
        }]);

        if (error) {
            if (error.code === '23505') alert("Este miembro ya está en el equipo.");
            else alert("Error: " + error.message);
        } else {
            if (enviarNotificacionIndividual) {
                const miembro = miembros.find(m => m.id === memberId);
                if (miembro?.token_notificacion) {
                    await enviarNotificacionIndividual(
                        miembro.token_notificacion,
                        miembro.nombre,
                        `🙌 ¡Hola ${miembro.nombre}! Has sido asignado al equipo '${selectedTeam.nombre}' como ${assignRole || 'General'}. ¡Gracias por tu servicio! ❤️`
                    );
                }
            }
            setShowAssignModal(false);
            setAssignRole('');
            handleSelectTeam(selectedTeam);
            fetchInitialData();
        }
    };

    const handleRemoveMember = async (id: string) => {
        if (!confirm("¿Quitar a este miembro del equipo?")) return;
        const { error } = await supabase.from('miembros_equipos').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else {
            handleSelectTeam(selectedTeam);
            fetchInitialData();
        }
    };

    const toggleTeamBlock = async (team: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const { error } = await supabase.from('equipos').update({ bloqueado: !team.bloqueado }).eq('id', team.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria(team.bloqueado ? 'DESBLOQUEAR EQUIPO' : 'BLOQUEAR EQUIPO', team.nombre);
            fetchInitialData();
        }
    };

    const handleDeleteTeam = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar este equipo y todas sus asignaciones?")) return;
        const { error } = await supabase.from('equipos').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('ELIMINAR EQUIPO', `ID: ${id}`);
            fetchInitialData();
        }
    };

    return {
        loading,
        equipos,
        miembros,
        selectedTeam,
        showTeamModal,
        setShowTeamModal,
        showAssignModal,
        setShowAssignModal,
        showModalNuevoEquipo,
        setShowModalNuevoEquipo,
        teamMembers,
        showModalComposicionEquipo,
        setShowModalComposicionEquipo,
        newTeamName,
        setNewTeamName,
        newTeamIcon,
        setNewTeamIcon,
        searchQuery,
        setSearchQuery,
        assignRole,
        setAssignRole,
        blockouts,
        upcomingSchedules,
        currentMonth,
        setCurrentMonth,
        selectedDateSchedule,
        setSelectedDateSchedule,
        handleSelectTeam,
        handleCreateTeam,
        handleAssignMember,
        handleRemoveMember,
        toggleTeamBlock,
        handleDeleteTeam
    };
}


'use client'
import React, { useState, useEffect } from 'react';
import { Users2, Plus } from 'lucide-react';

// Modular Components
import TeamCard from '../admin/teams/TeamCard';
import TeamCalendar from '../admin/teams/TeamCalendar';
import TeamScheduleList from '../admin/teams/TeamScheduleList';
import BlockoutsSection from '../admin/teams/BlockoutsSection';
import TeamDetailsModal from '../admin/teams/TeamDetailsModal';
import AssignMemberModal from '../admin/teams/AssignMemberModal';
import NewTeamModal from '../admin/teams/NewTeamModal';
import TeamCompositionModal from '../admin/teams/TeamCompositionModal';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano", "Teclados", "Guitarra"] },
    { name: "Medios", roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"] },
    { name: "Voces", roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"] },
    { name: "General", roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"] }
];

const EquiposView = ({ supabase, setActiveTab, enviarNotificacionIndividual }: {
    supabase: any,
    setActiveTab?: (t: string) => void,
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>
}) => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [showTeamCompositionModal, setShowTeamCompositionModal] = useState(false);

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
            const { data: teamsData, error: teamsError } = await supabase.from('equipos').select('*');
            if (teamsError) throw teamsError;

            const teamsWithCounts = await Promise.all((teamsData || []).map(async (t: any) => {
                const { count } = await supabase.from('miembros_equipos').select('*', { count: 'exact', head: true }).eq('equipo_id', t.id);
                return { ...t, members: count || 0 };
            }));

            setTeams(teamsWithCounts);

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

            const { data: membersData } = await supabase.from('miembros').select('*').eq('es_servidor', true);
            setMembers(membersData || []);

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
            setShowNewTeamModal(false);
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
                const miembro = members.find(m => m.id === memberId);
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
        else fetchInitialData();
    };

    const handleDeleteTeam = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar este equipo y todas sus asignaciones?")) return;
        const { error } = await supabase.from('equipos').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchInitialData();
    };

    const filteredMembers = members.filter(m =>
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users2 className="text-[#A8D500]" /> EQUIPOS Y VOLUNTARIOS
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestión de servidores y cronogramas de servicio</p>
                </div>
                <button
                    onClick={() => setShowNewTeamModal(true)}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> NUEVO EQUIPO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map(team => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        onSelect={handleSelectTeam}
                        onToggleBlock={toggleTeamBlock}
                        onDelete={handleDeleteTeam}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TeamCalendar
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    upcomingSchedules={upcomingSchedules}
                    selectedDateSchedule={selectedDateSchedule}
                    onSelectDate={setSelectedDateSchedule}
                />

                <TeamScheduleList
                    selectedDateSchedule={selectedDateSchedule}
                    upcomingSchedules={upcomingSchedules}
                    setSelectedDateSchedule={setSelectedDateSchedule}
                    setShowTeamCompositionModal={setShowTeamCompositionModal}
                    setActiveTab={setActiveTab}
                    members={members}
                />
            </div>

            <BlockoutsSection blockouts={blockouts} />

            {/* Modals */}
            {showTeamModal && (
                <TeamDetailsModal
                    selectedTeam={selectedTeam}
                    teamMembers={teamMembers}
                    onClose={() => setShowTeamModal(false)}
                    onAddMember={() => setShowAssignModal(true)}
                    onRemoveMember={handleRemoveMember}
                />
            )}

            {showAssignModal && (
                <AssignMemberModal
                    selectedTeam={selectedTeam}
                    assignRole={assignRole}
                    setAssignRole={setAssignRole}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredMembers={filteredMembers}
                    roleCategories={ROLE_CATEGORIES}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssignMember}
                />
            )}

            {showNewTeamModal && (
                <NewTeamModal
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    newTeamIcon={newTeamIcon}
                    setNewTeamIcon={setNewTeamIcon}
                    onClose={() => setShowNewTeamModal(false)}
                    onCreate={handleCreateTeam}
                />
            )}

            {showTeamCompositionModal && (
                <TeamCompositionModal
                    selectedDateSchedule={selectedDateSchedule}
                    roleCategories={ROLE_CATEGORIES}
                    members={members}
                    onClose={() => setShowTeamCompositionModal(false)}
                />
            )}
        </div>
    );
};

export default EquiposView;

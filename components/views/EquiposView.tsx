'use client'
import React, { useState, useEffect } from 'react';
import { Users2, Calendar, Plus, UserPlus, CheckCircle2, Clock, ShieldAlert, X, User, Search, Trash2 } from 'lucide-react';

const EquiposView = ({ supabase, setActiveTab, enviarNotificacionIndividual }: { supabase: any, setActiveTab?: (t: string) => void, enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<void> }) => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

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
            // Fetch teams
            const { data: teamsData, error: teamsError } = await supabase.from('equipos').select('*');
            if (teamsError) throw teamsError;

            // Get member count for each team
            const teamsWithCounts = await Promise.all((teamsData || []).map(async (t: any) => {
                const { count } = await supabase.from('miembros_equipos').select('*', { count: 'exact', head: true }).eq('equipo_id', t.id);
                return { ...t, members: count || 0 };
            }));

            setTeams(teamsWithCounts);

            // Fetch schedules for the visible month in calendar
            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];

            const { data: scheds } = await supabase
                .from('cronogramas')
                .select('*')
                .gte('fecha', firstDay)
                .lte('fecha', lastDay)
                .order('fecha', { ascending: true });

            setUpcomingSchedules(scheds || []);

            // Auto-select next today or closest service if not already selected
            const todayStr = new Date().toISOString().split('T')[0];
            const nextOne = (scheds || []).find((s: any) => s.fecha >= todayStr) || (scheds || [])[0];
            setSelectedDateSchedule(nextOne);

            // Fetch all "servidores" for assignment
            const { data: membersData } = await supabase.from('miembros').select('*').eq('es_servidor', true);
            setMembers(membersData || []);

            // Fetch blockouts (upcoming)
            const today = new Date().toISOString().split('T')[0];
            const { data: blocksData } = await supabase
                .from('bloqueos_servidores')
                .select('*, miembros(nombre, apellido)')
                .gte('fecha_fin', today)
                .order('fecha_inicio', { ascending: true });

            setBlockouts(blocksData?.map((b: any) => ({
                id: b.id,
                name: `${b.miembros.nombre} ${b.miembros.apellido}`,
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
        console.log("Seleccionando equipo:", team);
        setSelectedTeam(team);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('miembros_equipos')
                .select(`
                    id,
                    rol,
                    miembro_id,
                    miembros (
                        nombre,
                        apellido,
                        foto_url
                    )
                `)
                .eq('equipo_id', team.id);

            if (error) {
                console.error("Error al cargar miembros del equipo:", error);
                alert("Error al cargar miembros: " + error.message);
                // Mesmo com erro, tentamos mostrar o modal vazio
                setTeamMembers([]);
            } else {
                setTeamMembers(data || []);
            }
            setShowTeamModal(true);
        } catch (err: any) {
            console.error("Exceção ao selecionar equipo:", err);
            setShowTeamModal(true); // Tentar abrir de qualquer jeito
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
            // Notificar al miembro
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

    const filteredMembers = members.filter(m =>
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div
                        key={team.id}
                        onClick={() => handleSelectTeam(team)}
                        className={`bg-[#1E1E1E] p-6 rounded-2xl border ${team.bloqueado ? 'border-red-500/50 grayscale' : 'border-[#333]'} hover:border-[#A8D50050] transition-all cursor-pointer group relative`}
                    >
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button
                                onClick={(e) => toggleTeamBlock(team, e)}
                                className={`p-2 rounded-lg transition-all ${team.bloqueado ? 'bg-red-500 text-white' : 'text-[#555] hover:bg-[#333]'}`}
                                title={team.bloqueado ? "Desbloquear equipo" : "Bloquear equipo (Mantenimiento/Baja)"}
                            >
                                <ShieldAlert size={14} />
                            </button>
                            <button
                                onClick={(e) => handleDeleteTeam(team.id, e)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Eliminar equipo"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="text-4xl mb-4">{team.icono || '👥'}</div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            {team.nombre}
                            {team.bloqueado && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">BLOQUEADO</span>}
                        </h4>
                        <p className="text-[#888] text-sm mb-4">{team.members} Voluntarios</p>
                        <div className="text-[#A8D500] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {team.bloqueado ? 'EQUIPO EN MANTENIMIENTO' : 'VER VOLUNTARIOS'} <Plus size={12} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendario y Próximas Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario (Columna Izquierda) */}
                <div className="lg:col-span-1 bg-[#1E1E1E] rounded-3xl border border-[#333] overflow-hidden">
                    <div className="p-4 bg-[#222] border-b border-[#333] flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={16} className="text-[#A8D500]" /> Calendario
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
                                setCurrentMonth(new Date(newDate));
                            }} className="text-[#888] hover:text-white p-1">←</button>
                            <span className="text-white text-xs font-bold uppercase">
                                {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => {
                                const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1));
                                setCurrentMonth(new Date(newDate));
                            }} className="text-[#888] hover:text-white p-1">→</button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d} className="text-[#555] text-[10px] font-black">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => <div key={i}></div>)}
                            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const daySchedule = upcomingSchedules.find(s => s.fecha === dateStr);
                                const isSelected = selectedDateSchedule?.fecha === dateStr;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => daySchedule && setSelectedDateSchedule(daySchedule)}
                                        className={`aspect-square flex items-center justify-center text-[10px] rounded-lg border transition-all ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E1E1E] z-10' : ''
                                            } ${daySchedule ? 'bg-[#A8D500] text-black font-bold border-transparent hover:scale-110' : 'text-[#888] border-[#333] hover:border-[#555]'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Lista de Fechas (Columna Derecha) */}
                <div className="lg:col-span-2 bg-[#1E1E1E] rounded-3xl border border-[#333] overflow-hidden flex flex-col">
                    <div className="p-4 bg-[#222] border-b border-[#333] flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
                            {selectedDateSchedule ? `Servicio: ${new Date(selectedDateSchedule.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Próximos Servicios'}
                        </h3>
                        {selectedDateSchedule && (
                            <button
                                onClick={() => setSelectedDateSchedule(null)}
                                className="text-[#A8D500] text-[10px] font-black uppercase hover:underline"
                            >
                                Ver todos
                            </button>
                        )}
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto max-h-[400px] space-y-4">
                        {(selectedDateSchedule ? [selectedDateSchedule] : upcomingSchedules).length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-[#555] italic text-sm">No hay servicios para mostrar.</p>
                                <button onClick={() => setActiveTab?.('servicios')} className="text-[#A8D500] text-xs font-bold mt-2">IR A PLANIFICAR →</button>
                            </div>
                        ) : (
                            (selectedDateSchedule ? [selectedDateSchedule] : upcomingSchedules).map(s => (
                                <div key={s.id} className="bg-[#252525] p-5 rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#111] p-3 rounded-xl border border-[#333] text-center min-w-[70px]">
                                                <p className="text-[#A8D500] text-[10px] font-black uppercase">
                                                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                                                </p>
                                                <p className="text-white text-xl font-black">
                                                    {new Date(s.fecha + 'T12:00:00').getDate()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-sm uppercase">
                                                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long' })}
                                                </p>
                                                <p className="text-[#888] text-[10px] font-bold">{s.horario}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 px-4">
                                            <div className="flex -space-x-2 overflow-hidden mb-1">
                                                {(s.equipo_ids || []).slice(0, 10).map((staff: any, idx: number) => (
                                                    <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#252525] bg-[#333] flex items-center justify-center text-xs text-white border border-[#A8D50030]" title={`${staff.nombre} (${staff.rol})`}>
                                                        {staff.nombre?.[0] || '?'}
                                                    </div>
                                                ))}
                                                {(s.equipo_ids || []).length > 10 && (
                                                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#252525] bg-[#444] flex items-center justify-center text-[10px] text-[#A8D500] font-bold">
                                                        +{(s.equipo_ids || []).length - 10}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[#AAAAAA] text-[10px] font-bold uppercase mt-1">
                                                {(s.equipo_ids || []).length > 0 ? (s.equipo_ids || []).map((st: any) => st.nombre).join(', ') : 'Sin personas asignadas'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab ? setActiveTab('servicios') : alert("Ve a Plan de Culto")}
                                            className="bg-[#A8D500] text-black text-[10px] font-black px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(168,213,0,0.4)] active:scale-95"
                                        >
                                            EDITAR DÍA
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Blockouts Section */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-[#FFB400]" /> BLOQUEOS (Indisponibilidad)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {blockouts.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-xl border border-red-500/20">
                            <div>
                                <p className="text-white font-bold text-sm">{b.name}</p>
                                <p className="text-red-400 text-[10px] font-bold uppercase">{b.reason}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#888] text-xs">{b.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL: Team Details */}
            {showTeamModal && selectedTeam && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-2xl rounded-3xl border border-[#333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#333] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{selectedTeam.icono}</div>
                                <div>
                                    <h3 className="text-white font-bold text-xl">{selectedTeam.nombre}</h3>
                                    <p className="text-[#888] text-xs">{teamMembers.length} voluntarios en este equipo</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTeamModal(false)} className="text-[#888] hover:text-white p-2"><X /></button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-bold text-sm uppercase tracking-widest text-[#A8D500]">Lista de Miembros</h4>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="bg-[#A8D500] text-black text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
                                >
                                    <UserPlus size={14} /> ASIGNAR MIEMBRO
                                </button>
                            </div>

                            <div className="space-y-3">
                                {teamMembers.length === 0 ? (
                                    <p className="text-[#555] text-center py-10 italic text-sm">No hay voluntarios asignados aún.</p>
                                ) : (
                                    teamMembers.map((tm: any) => (
                                        <div key={tm.id} className="flex items-center justify-between p-4 bg-[#222] rounded-2xl border border-[#333] group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#333] rounded-full overflow-hidden flex items-center justify-center">
                                                    {tm.miembros.foto_url ? (
                                                        <img src={tm.miembros.foto_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-[#555]" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{tm.miembros.nombre} {tm.miembros.apellido}</p>
                                                    <p className="text-[#A8D500] text-[10px] font-bold uppercase tracking-wider">{tm.rol}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(tm.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Assign Member */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-[#333] flex items-center justify-between">
                            <h3 className="text-white font-bold">Asignar a {selectedTeam?.nombre}</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-[#888] hover:text-white"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Rol / Función</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Guitarra, Sonido, Proyección..."
                                    value={assignRole}
                                    onChange={(e) => setAssignRole(e.target.value)}
                                    className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                                />
                            </div>

                            <div>
                                <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Buscar Servidor</label>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Nombre del miembro..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#222] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-[#A8D500]"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {filteredMembers.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleAssignMember(m.id)}
                                            className="w-full flex items-center gap-3 p-3 bg-[#252525] hover:bg-[#A8D500] hover:text-black rounded-xl transition-all group group"
                                        >
                                            <div className="w-8 h-8 bg-[#333] rounded-full overflow-hidden flex items-center justify-center">
                                                {m.foto_url ? <img src={m.foto_url} className="w-full h-full object-cover" /> : <User size={14} />}
                                            </div>
                                            <span className="font-bold text-sm">{m.nombre} {m.apellido}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: New Team */}
            {showNewTeamModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-sm rounded-3xl border border-[#333] p-6">
                        <h3 className="text-white font-bold text-xl mb-6">Crear Nuevo Equipo</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[#888] text-xs font-bold mb-2 block">NOMBRE DEL EQUIPO</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="Ej: Staff, Bienvenida..."
                                    className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                                />
                            </div>
                            <div>
                                <label className="text-[#888] text-xs font-bold mb-2 block">ICONO (EMOJI)</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['🎸', '🎥', '☕', '🎨', '🛡️', '🚌', '🍕', '🙏', '🔌', '💻'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewTeamIcon(emoji)}
                                            className={`p-3 text-2xl rounded-xl border ${newTeamIcon === emoji ? 'bg-[#A8D500] border-[#A8D500]' : 'bg-[#222] border-[#333]'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowNewTeamModal(false)}
                                    className="flex-1 bg-[#222] text-white font-bold py-3 rounded-xl border border-[#333]"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleCreateTeam}
                                    className="flex-1 bg-[#A8D500] text-black font-bold py-3 rounded-xl"
                                >
                                    CREAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquiposView;

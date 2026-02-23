'use client'
import React, { useState, useEffect } from 'react';
import { Users2, Calendar, Plus, UserPlus, CheckCircle2, Clock, ShieldAlert, X, User, Search, Trash2 } from 'lucide-react';

const EquiposView = ({ supabase }: { supabase: any }) => {
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

    const blockouts = [
        { id: 1, name: 'Juan Perez', date: '27/10', reason: 'Vacaciones' },
        { id: 2, name: 'Maria Garcia', date: '03/11', reason: 'Viaje de trabajo' },
    ];

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

            // Fetch all "servidores" for assignment
            const { data: membersData } = await supabase.from('miembros').select('*').eq('es_servidor', true);
            setMembers(membersData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [supabase]);

    const handleSelectTeam = async (team: any) => {
        setSelectedTeam(team);
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

        if (!error) {
            setTeamMembers(data || []);
            setShowTeamModal(true);
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
                        className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all cursor-pointer group relative"
                    >
                        <button
                            onClick={(e) => handleDeleteTeam(team.id, e)}
                            className="absolute top-4 right-4 p-2 text-[#444] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="text-4xl mb-4">{team.icono || '👥'}</div>
                        <h4 className="text-white font-bold text-lg">{team.nombre}</h4>
                        <p className="text-[#888] text-sm mb-4">{team.members} Voluntarios</p>
                        <div className="text-[#A8D500] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            VER VOLUNTARIOS <Plus size={12} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#222]">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <Calendar size={16} className="text-[#A8D500]" /> Próximo Cronograma: Domingo 27/10
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#252525] rounded-xl border border-[#333]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#A8D50020] rounded-full flex items-center justify-center text-[#A8D500]">🎸</div>
                                <div>
                                    <p className="text-white font-bold text-sm">Banda / Alabanza</p>
                                    <p className="text-[#888] text-xs">4 posiciones asignadas</p>
                                </div>
                            </div>
                            <button
                                onClick={() => alert("Redirigiendo a Plan de Culto para ver detalles...")}
                                className="text-[#A8D500] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#A8D50030] hover:bg-[#A8D50010]"
                            >
                                VER DETALLE
                            </button>
                        </div>
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

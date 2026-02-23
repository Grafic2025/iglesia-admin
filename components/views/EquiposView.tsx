import { Users2, Calendar, Plus, UserPlus, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

const EquiposView = ({ supabase }: { supabase: any }) => {
    const blockouts = [
        { id: 1, name: 'Juan Perez', date: '27/10', reason: 'Vacaciones' },
        { id: 2, name: 'Maria Garcia', date: '03/11', reason: 'Viaje de trabajo' },
    ];
    const teams = [
        { id: 1, name: 'Alabanza', members: 8, icon: '🎸' },
        { id: 2, name: 'Multimedia', members: 4, icon: '🎥' },
        { id: 3, name: 'Hospitalidad', members: 12, icon: '☕' },
        { id: 4, name: 'Niños (IDS Kids)', members: 6, icon: '🎨' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users2 className="text-[#A8D500]" /> EQUIPOS Y VOLUNTARIOS
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestión de servidores y cronogramas de servicio</p>
                </div>
                <button className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95">
                    <Plus size={18} /> NUEVO EQUIPO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map(team => (
                    <div key={team.id} className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all cursor-pointer group">
                        <div className="text-4xl mb-4">{team.icon}</div>
                        <h4 className="text-white font-bold text-lg">{team.name}</h4>
                        <p className="text-[#888] text-sm mb-4">{team.members} Voluntarios</p>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-[#333] border-2 border-[#1E1E1E] flex items-center justify-center text-[10px] text-white">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-[#252525] border-2 border-[#1E1E1E] flex items-center justify-center text-[10px] text-[#888]">
                                +{team.members - 3}
                            </div>
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
                                <div className="w-10 h-10 bg-[#A8D50020] rounded-full flex items-center justify-center text-[#A8D500]">
                                    🎸
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Banda / Alabanza</p>
                                    <p className="text-[#888] text-xs">4 posiciones asignadas</p>
                                </div>
                            </div>
                            <button className="text-[#A8D500] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#A8D50030] hover:bg-[#A8D50010]">VER DETALLE</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#252525] rounded-xl border border-[#333]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#FFB40020] rounded-full flex items-center justify-center text-[#FFB400]">
                                    📸
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Multimedia / Sonido</p>
                                    <p className="text-[#888] text-xs">2 posiciones pendientes</p>
                                </div>
                            </div>
                            <button className="bg-[#FFB400] text-black text-xs font-bold px-3 py-1.5 rounded-lg">ASIGNAR</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blockouts (PC Feature) */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-[#FFB400]" /> BLOQUEOS (Indisponibilidad)
                </h3>
                <p className="text-[#888] text-xs mb-4 italic">Personas que notificaron que NO pueden servir en estas fechas.</p>
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
        </div>
    );
};

export default EquiposView;

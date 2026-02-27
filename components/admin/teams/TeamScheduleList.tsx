import React from 'react';

interface TeamScheduleListProps {
    selectedDateSchedule: any;
    upcomingSchedules: any[];
    setSelectedDateSchedule: (s: any) => void;
    setShowTeamCompositionModal: (b: boolean) => void;
    setActiveTab?: (t: string) => void;
    members: any[];
}

const TeamScheduleList: React.FC<TeamScheduleListProps> = ({
    selectedDateSchedule,
    upcomingSchedules,
    setSelectedDateSchedule,
    setShowTeamCompositionModal,
    setActiveTab,
    members
}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filteredList = (selectedDateSchedule ? [selectedDateSchedule] : upcomingSchedules.filter(s => s.fecha >= todayStr));

    return (
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
                {filteredList.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[#555] italic text-sm">No hay servicios próximos para mostrar.</p>
                        <button onClick={() => setActiveTab?.('servicios')} className="text-[#A8D500] text-xs font-bold mt-2">IR A PLANIFICAR →</button>
                    </div>
                ) : (
                    filteredList.map(s => (
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
                                        {(s.equipo_ids || []).slice(0, 10).map((staff: any, idx: number) => {
                                            const memberWithPhoto = members.find(m => m.id === staff.miembro_id);
                                            const foto = memberWithPhoto?.foto_url || staff.foto_url;

                                            return (
                                                <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#252525] bg-[#333] overflow-hidden flex items-center justify-center text-[10px] text-white border border-[#A8D50030]" title={`${staff.nombre} (${staff.rol})`}>
                                                    {foto ? (
                                                        <img src={foto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        staff.nombre?.[0] || '?'
                                                    )}
                                                </div>
                                            );
                                        })}
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

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDateSchedule(s);
                                            setShowTeamCompositionModal(true);
                                        }}
                                        className="bg-[#252525] text-[#A8D500] border border-[#A8D50030] text-[10px] font-black px-5 py-2.5 rounded-xl transition-all hover:bg-[#A8D500] hover:text-black active:scale-95"
                                    >
                                        VER EQUIPO
                                    </button>
                                    <button
                                        onClick={() => setActiveTab ? setActiveTab('servicios') : alert("Ve a Plan de Culto")}
                                        className="bg-[#A8D500] text-black text-[10px] font-black px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(168,213,0,0.4)] active:scale-95"
                                    >
                                        EDITAR DÍA
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamScheduleList;

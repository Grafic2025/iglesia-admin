import React from 'react';
import { X, Users2, ShieldAlert } from 'lucide-react';

interface TeamCompositionModalProps {
    selectedDateSchedule: any;
    roleCategories: any[];
    members: any[];
    onClose: () => void;
}

const TeamCompositionModal: React.FC<TeamCompositionModalProps> = ({
    selectedDateSchedule,
    roleCategories,
    members,
    onClose
}) => {
    if (!selectedDateSchedule) return null;

    const getRoleCategory = (rol: string) => {
        for (const cat of roleCategories) {
            if (cat.roles.some((r: string) => rol.includes(r))) return cat.name.toUpperCase();
        }
        return "GENERAL";
    };

    const categories = ["VOCES", "BANDA", "AUDIO", "MEDIOS", "GENERAL"];
    const staff = selectedDateSchedule.equipo_ids || [];

    if (staff.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                <div className="bg-[#151515] w-full max-w-2xl rounded-3xl border border-[#333] shadow-2xl overflow-hidden">
                    <div className="p-6 flex justify-end">
                        <button onClick={onClose} className="text-[#888] hover:text-white p-2"><X size={24} /></button>
                    </div>
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
                            <ShieldAlert className="text-[#555]" size={32} />
                        </div>
                        <p className="text-[#555] font-bold italic">No hay personas asignadas para este día.</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = {
        confirmados: staff.filter((s: any) => s.estado === 'confirmado').length,
        pendientes: staff.filter((s: any) => s.estado === 'pendiente' || !s.estado).length,
        rechazados: staff.filter((s: any) => s.estado === 'rechazado').length
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-[#151515] w-full max-w-2xl rounded-3xl border border-[#333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#1A1A1A]">
                    <div>
                        <h3 className="text-white font-black text-[14px] uppercase tracking-widest flex items-center gap-3">
                            <Users2 className="text-[#A8D500]" size={18} /> Composición del Equipo
                        </h3>
                        <p className="text-[#888] text-[10px] font-bold uppercase mt-1">
                            {new Date(selectedDateSchedule.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} — {selectedDateSchedule.horario}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-[#888] hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Barra de Resumen Rápido */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-center">
                            <p className="text-green-500 text-[10px] font-black uppercase mb-1">Confirmados</p>
                            <p className="text-white text-2xl font-black">{stats.confirmados}</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl text-center">
                            <p className="text-yellow-500 text-[10px] font-black uppercase mb-1">Pendientes</p>
                            <p className="text-white text-2xl font-black">{stats.pendientes}</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                            <p className="text-red-500 text-[10px] font-black uppercase mb-1">Rechazados</p>
                            <p className="text-white text-2xl font-black">{stats.rechazados}</p>
                        </div>
                    </div>

                    {categories.map(catName => {
                        const membersInCat = staff.reduce((acc: any[], s: any) => {
                            const roles = (s.rol || 'Servidor').split(', ').filter(Boolean);
                            roles.forEach((r: string) => {
                                if (getRoleCategory(r) === catName) {
                                    acc.push({ ...s, specificRol: r });
                                }
                            });
                            return acc;
                        }, []);

                        if (membersInCat.length === 0) return null;

                        return (
                            <div key={catName} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase tracking-[0.3em]">{catName}</h4>
                                    <div className="h-px bg-gradient-to-r from-[#A8D50030] to-transparent flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {membersInCat.map((s: any, idx: number) => (
                                        <div key={`${s.miembro_id}-${s.specificRol}-${idx}`} className={`flex flex-col p-4 rounded-2xl border transition-all ${s.estado === 'rechazado' ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1E1E1E] border-[#333]'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#111] border border-[#333] overflow-hidden flex items-center justify-center relative">
                                                    {(() => {
                                                        const m = members.find(mem => mem.id === s.miembro_id);
                                                        const foto = m?.foto_url || s.foto_url;
                                                        return foto ? (
                                                            <img src={foto} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <span className="text-xs text-[#555] font-black">{s.nombre?.[0]}</span>
                                                        );
                                                    })()}
                                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1E1E1E] ${s.estado === 'confirmado' ? 'bg-[#A8D500]' : s.estado === 'rechazado' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-white font-black text-sm uppercase">{s.nombre}</p>
                                                        {s.estado === 'rechazado' && (
                                                            <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">REEMPLAZO NECESARIO</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[#A8D500] text-[10px] font-black uppercase tracking-wider">{s.specificRol}</p>
                                                </div>
                                            </div>

                                            {s.estado === 'rechazado' && s.motivo && (
                                                <div className="mt-3 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                                                    <p className="text-red-400 text-[9px] font-black uppercase mb-1">Motivo del rechazo:</p>
                                                    <p className="text-white text-xs italic font-medium">"{s.motivo}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-[#333] bg-[#1A1A1A] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-[#A8D500] text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all uppercase tracking-widest text-xs"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamCompositionModal;

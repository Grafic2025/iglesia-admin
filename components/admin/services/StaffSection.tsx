import React from 'react';
import { Users2, X, CheckCircle2, Clock, Plus } from 'lucide-react';

interface StaffSectionProps {
    assignedStaff: any[];
    setAssignedStaff: (staff: any[]) => void;
    roleCategories: any[];
    allMembers: any[];
    onAddStaff: () => void;
}

const StaffSection: React.FC<StaffSectionProps> = ({
    assignedStaff,
    setAssignedStaff,
    roleCategories,
    allMembers,
    onAddStaff
}) => {
    const getRoleCategory = (rol: string) => {
        for (const cat of roleCategories) {
            if (cat.roles.some((r: string) => rol.includes(r))) return cat.name.toUpperCase();
        }
        return "GENERAL";
    };

    const categories = ["VOCES", "BANDA", "AUDIO", "MEDIOS", "GENERAL"];

    return (
        <div>
            <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                <Users2 size={14} /> Equipo / Staff
            </h4>
            <div className="space-y-6">
                {categories.map(catName => {
                    const membersInCat = assignedStaff.reduce((acc: any[], s: any) => {
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
                        <div key={catName} className="space-y-3">
                            <h5 className="text-[10px] text-[#A8D500] font-black uppercase tracking-widest flex items-center gap-2">
                                {catName}
                                <div className="h-px bg-[#A8D50020] flex-1"></div>
                            </h5>
                            <div className="space-y-2">
                                {membersInCat.map((s, idx) => (
                                    <div key={`${s.miembro_id}-${s.specificRol}`} className="flex flex-col p-3 bg-[#1A1A1A] rounded-xl border border-[#333] gap-2 group/item text-left">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] overflow-hidden flex items-center justify-center">
                                                    {(() => {
                                                        const m = allMembers.find(mem => mem.id === s.miembro_id);
                                                        const foto = m?.foto_url || s.foto_url;
                                                        return foto ? (
                                                            <img src={foto} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <span className="text-[10px] text-[#555] font-black">{s.nombre?.[0]}</span>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-white font-bold text-sm line-clamp-1">{s.nombre}</p>
                                                    <p className="text-[#A8D500] text-[10px] font-black uppercase">{s.specificRol}</p>
                                                </div>
                                                <div className={`p-1 rounded-full ${s.estado === 'confirmado' ? 'bg-green-500/20 text-green-500' :
                                                    s.estado === 'rechazado' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {s.estado === 'confirmado' ? <CheckCircle2 size={12} /> :
                                                        s.estado === 'rechazado' ? <X size={12} /> :
                                                            <Clock size={12} />}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAssignedStaff(assignedStaff.filter(item => item.miembro_id !== s.miembro_id))}
                                                className="text-[#555] hover:text-red-500 p-1"
                                                title="Eliminar de todo el plan"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        {s.estado === 'rechazado' && s.motivo && (
                                            <div className="bg-red-500/5 border-l-2 border-red-500 p-2 mt-1">
                                                <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Motivo del rechazo:</p>
                                                <p className="text-white text-xs italic">"{s.motivo}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                <button
                    onClick={onAddStaff}
                    className="w-full p-4 border-2 border-dashed border-[#333] rounded-xl text-[#555] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all flex items-center justify-center gap-2 font-bold text-xs"
                >
                    <Plus size={16} /> ASIGNAR PERSONA
                </button>
            </div>
        </div>
    );
};

export default StaffSection;

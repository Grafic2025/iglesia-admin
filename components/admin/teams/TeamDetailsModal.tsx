import React from 'react';
import { X, UserPlus, User, Trash2 } from 'lucide-react';

interface TeamDetailsModalProps {
    selectedTeam: any;
    teamMembers: any[];
    onClose: () => void;
    onAddMember: () => void;
    onRemoveMember: (id: string) => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
    selectedTeam,
    teamMembers,
    onClose,
    onAddMember,
    onRemoveMember
}) => {
    if (!selectedTeam) return null;

    return (
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
                    <button onClick={onClose} className="text-[#888] hover:text-white p-2"><X /></button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest text-[#A8D500]">Lista de Miembros</h4>
                        <button
                            onClick={onAddMember}
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
                                        onClick={() => onRemoveMember(tm.id)}
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
    );
};

export default TeamDetailsModal;

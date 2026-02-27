import React from 'react';
import { X, Search, User } from 'lucide-react';

interface AssignMemberModalProps {
    selectedTeam: any;
    assignRole: string;
    setAssignRole: (s: string) => void;
    searchQuery: string;
    setSearchQuery: (s: string) => void;
    filteredMembers: any[];
    roleCategories: any[];
    onClose: () => void;
    onAssign: (memberId: string) => void;
}

const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
    selectedTeam,
    assignRole,
    setAssignRole,
    searchQuery,
    setSearchQuery,
    filteredMembers,
    roleCategories,
    onClose,
    onAssign
}) => {
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[#333] flex items-center justify-between">
                    <h3 className="text-white font-bold">Asignar a {selectedTeam?.nombre}</h3>
                    <button onClick={onClose} className="text-[#888] hover:text-white"><X /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Rol / Función</label>
                        <input
                            type="text"
                            placeholder="Ej: Guitarra, Sonido, Proyección..."
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500] mb-3"
                        />
                        <div className="space-y-4 mb-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-b border-[#333] pb-4">
                            {roleCategories.map(cat => (
                                <div key={cat.name}>
                                    <p className="text-[9px] text-[#A8D500] font-black uppercase mb-2 tracking-wider opacity-70">{cat.name}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {cat.roles.map((r: string) => (
                                            <button
                                                key={r}
                                                onClick={() => setAssignRole(r)}
                                                className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-bold transition-all ${assignRole === r ? 'bg-[#A8D500] text-black border-transparent' : 'bg-[#222] text-[#888] border-[#333] hover:border-[#A8D50050]'
                                                    }`}
                                            >{r}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    onClick={() => onAssign(m.id)}
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
    );
};

export default AssignMemberModal;

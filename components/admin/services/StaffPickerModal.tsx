import React from 'react';
import { X, Search, User } from 'lucide-react';

interface StaffPickerModalProps {
    allMembers: any[];
    assignedStaff: any[];
    staffSearch: string;
    setStaffSearch: (s: string) => void;
    assignStaff: (m: any) => void;
    onClose: () => void;
}

const StaffPickerModal: React.FC<StaffPickerModalProps> = ({
    allMembers,
    assignedStaff,
    staffSearch,
    setStaffSearch,
    assignStaff,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-6 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold uppercase tracking-widest text-left">Asignar Servidor</h3>
                    <button onClick={onClose} className="text-[#888]"><X /></button>
                </div>
                <div className="relative mb-4 text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={staffSearch}
                        onChange={e => setStaffSearch(e.target.value)}
                        className="w-full bg-[#222] border border-[#333] rounded-2xl py-3 pl-11 pr-4 text-white text-xs outline-none focus:border-[#A8D500] transition-all"
                    />
                </div>
                <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                    {allMembers.filter(m =>
                        `${m.nombre} ${m.apellido}`.toLowerCase().includes(staffSearch.toLowerCase())
                    ).map(m => (
                        <button
                            key={m.id}
                            onClick={() => assignStaff(m)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${assignedStaff.some(s => s.miembro_id === m.id) ? 'bg-[#3B82F6] border-transparent text-white' : 'bg-[#222] border-[#333] text-white hover:border-[#3B82F6]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#333] rounded-full overflow-hidden flex items-center justify-center">
                                    {m.foto_url ? <img src={m.foto_url} className="w-full h-full object-cover" /> : <User size={20} className="text-[#555]" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{m.nombre} {m.apellido}</p>
                                    <p className={`text-[10px] ${assignedStaff.some(s => s.miembro_id === m.id) ? 'text-white/60' : 'text-[#555]'}`}>Servidor</p>
                                </div>
                            </div>
                            {assignedStaff.some(s => s.miembro_id === m.id) && <X size={14} />}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-[#3B82F6] text-white font-black rounded-xl mt-6 uppercase tracking-widest text-xs"
                >
                    Listo
                </button>
            </div>
        </div>
    );
};

export default StaffPickerModal;

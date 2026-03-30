import React from 'react';
import { UserPlus, X } from 'lucide-react';

interface ModalCrearMiembroProps {
    visible: boolean;
    onClose: () => void;
    member: any;
    setMember: (m: any) => void;
    onSave: () => void;
    saving: boolean;
}

export const ModalCrearMiembro = ({
    visible,
    onClose,
    member,
    setMember,
    onSave,
    saving
}: ModalCrearMiembroProps) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-xl uppercase tracking-widest flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" size={24} />
                        Nuevo Miembro
                    </h3>
                    <button onClick={onClose} className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-[10px] text-[rgba(255,255,255,0.5)] font-black uppercase mb-1 block tracking-widest pl-1">Nombre</label>
                        <input
                            type="text"
                            value={member.nombre}
                            onChange={e => setMember({ ...member, nombre: e.target.value })}
                            className="w-full bg-[#222] border border-[#333] rounded-2xl px-5 py-3 text-white outline-none focus:border-[#00D9FF] transition-all"
                            placeholder="Ej: Juan"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[rgba(255,255,255,0.5)] font-black uppercase mb-1 block tracking-widest pl-1">Apellido</label>
                        <input
                            type="text"
                            value={member.apellido}
                            onChange={e => setMember({ ...member, apellido: e.target.value })}
                            className="w-full bg-[#222] border border-[#333] rounded-2xl px-5 py-3 text-white outline-none focus:border-[#00D9FF] transition-all"
                            placeholder="Ej: Pérez"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[rgba(255,255,255,0.5)] font-black uppercase mb-1 block tracking-widest pl-1">Celular / WhatsApp</label>
                        <input
                            type="text"
                            value={member.celular}
                            onChange={e => setMember({ ...member, celular: e.target.value })}
                            className="w-full bg-[#222] border border-[#333] rounded-2xl px-5 py-3 text-white outline-none focus:border-[#00D9FF] transition-all"
                            placeholder="Ej: 5493751000000"
                        />
                        <p className="text-[9px] text-[#444] mt-1 pr-1 italic text-right">Inclinterfazr código de área sin el +</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-[#222] text-[rgba(255,255,255,0.7)] font-bold rounded-2xl border border-[#333] hover:text-white transition-all text-xs"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1 py-4 bg-[#00D9FF] text-black font-black rounded-2xl hover:bg-[#00c4e6] disabled:opacity-50 transition-all text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(0,217,255,0.2)]"
                    >
                        {saving ? 'GUARDANDO...' : 'CREAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};


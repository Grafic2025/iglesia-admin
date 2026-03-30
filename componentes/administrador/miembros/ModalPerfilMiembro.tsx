import React from 'react';
import { X, User } from 'lucide-react';

interface ModalPerfilMiembroProps {
    member: any;
    onClose: () => void;
    resetearPin?: (id: string, nombre: string) => void;
}

const ModalPerfilMiembro: React.FC<ModalPerfilMiembroProps> = ({ member, onClose, resetearPin }) => {
    if (!member) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] shadow-2xl overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[#333] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#252525] rounded-full flex items-center justify-center border-2 border-[#A8D500] overflow-hidden">
                            {member.miembros?.foto_url ? (
                                <img src={member.miembros.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-[#A8D500]" size={24} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl leading-tight">{member.miembros?.nombre} {member.miembros?.apellido}</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">ID: {member.miembro_id?.slice(0, 8)}...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2"><X /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                            <p className="text-3xl font-black text-[#A8D500]">{member.racha >= 4 ? '🔥' : ''}{member.racha}</p>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-tighter mt-1">Racha</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                            <p className="text-2xl font-black text-white">{member.hora_entrada || '-'}</p>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-tighter mt-1">Hora hoy</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                            <p className="text-xs font-black text-white uppercase">{member.horario_reunion}</p>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-tighter mt-1">Reunión</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className={`flex-1 p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border transition-all ${member.miembros?.es_servidor ? 'bg-[#A8D500]/10 text-[#A8D500] border-[#A8D500]/30 shadow-[0_0_20px_rgba(168,213,0,0.1)]' : 'bg-white/5 text-white/30 border-white/5'}`}>
                            {member.miembros?.es_servidor ? '✅ Servidor Activo' : '⛔ No es Servidor'}
                        </div>
                        {resetearPin && (
                            <button
                                onClick={() => resetearPin(member.miembro_id, `${member.miembros?.nombre} ${member.miembros?.apellido}`)}
                                className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 shadow-[0_10px_30px_rgba(239,68,68,0.1)]"
                            >
                                Resetear PIN
                            </button>
                        )}
                    </div>
                    {member.miembros?.created_at && (
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px] text-center border-t border-white/5 pt-6">
                            Miembro desde {new Date(member.miembros.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalPerfilMiembro;


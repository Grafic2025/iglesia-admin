import React from 'react';
import { X, User } from 'lucide-react';

interface MemberProfileModalProps {
    member: any;
    onClose: () => void;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
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
                            <h3 className="text-white font-bold text-lg">{member.miembros?.nombre} {member.miembros?.apellido}</h3>
                            <p className="text-[#888] text-xs">ID: {member.miembro_id?.slice(0, 8)}...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#888] hover:text-white p-2"><X /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#222] p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-[#A8D500]">{member.racha >= 4 ? '🔥' : ''} {member.racha}</p>
                            <p className="text-[#555] text-[10px] font-black uppercase mt-1">Racha</p>
                        </div>
                        <div className="bg-[#222] p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-white">{member.hora_entrada || '-'}</p>
                            <p className="text-[#555] text-[10px] font-black uppercase mt-1">Hora hoy</p>
                        </div>
                        <div className="bg-[#222] p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-white text-xs">{member.horario_reunion}</p>
                            <p className="text-[#555] text-[10px] font-black uppercase mt-1">Reunión</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className={`flex-1 p-3 rounded-xl text-center text-sm font-bold ${member.miembros?.es_servidor ? 'bg-[#A8D50020] text-[#A8D500] border border-[#A8D50030]' : 'bg-[#222] text-[#555]'}`}>
                            {member.miembros?.es_servidor ? '✅ Servidor Activo' : '⛔ No es Servidor'}
                        </div>
                    </div>
                    {member.miembros?.created_at && (
                        <p className="text-[#555] text-xs text-center border-t border-[#333] pt-4">
                            Miembro desde {new Date(member.miembros.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberProfileModal;

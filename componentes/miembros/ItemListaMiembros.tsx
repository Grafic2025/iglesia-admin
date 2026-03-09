import React from 'react';
import { Phone, ShieldCheck, UserCircle, UserPlus, Archive } from 'lucide-react';

interface ItemListaMiembrosProps {
    member: any;
    showArchived: boolean;
    toggleServerStatus: (m: any) => void;
    toggleAdminStatus: (m: any) => void;
    handleArchive: (m: any) => void;
    handleRestore: (m: any) => void;
}

export const ItemListaMiembros = ({
    member,
    showArchived,
    toggleServerStatus,
    toggleAdminStatus,
    handleArchive,
    handleRestore
}: ItemListaMiembrosProps) => {
    const sieteDiasAgo = new Date();
    sieteDiasAgo.setDate(sieteDiasAgo.getDate() - 7);
    const esNuevo = new Date(member.created_at) > sieteDiasAgo;

    return (
        <div className={`bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex flex-col md:flex-row md:items-center justify-between hover:border-[#00D9FF50] transition-all group gap-4 ${showArchived ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`shrink-0 w-12 h-12 ${member.es_servidor ? 'bg-[#A8D50020] text-[#A8D500]' : 'bg-[#00D9FF15] text-[#00D9FF]'} rounded-full flex items-center justify-center font-bold text-xl overflow-hidden`}>
                    {member.foto_url ? (
                        <img src={member.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        member.nombre[0]
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-white font-bold text-lg">{member.nombre} {member.apellido}</div>
                        {member.es_servidor && (
                            <span title="Servidor Activo">
                                <ShieldCheck size={16} className="text-[#A8D500]" />
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#888] mt-1">
                        <span className="flex items-center gap-1">📍 Se unió el {new Date(member.created_at).toLocaleDateString()}</span>
                        {esNuevo && <span className="bg-[#00D9FF20] px-2 py-0.5 rounded text-[#00D9FF] font-bold">NUEVO</span>}
                        {member.es_servidor && <span className="bg-[#A8D50020] px-2 py-0.5 rounded text-[#A8D500] font-bold">SERVIDOR</span>}
                        {member.es_administrador && <span className="bg-[#FFB40020] px-2 py-0.5 rounded text-[#FFB400] font-bold">ADMIN</span>}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {member.celular && (
                    <button
                        onClick={() => window.open(`https://wa.me/${member.celular.replace(/\D/g, '')}`, '_blank')}
                        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        <Phone size={16} /> WHATSAPP
                    </button>
                )}
                <button
                    onClick={() => toggleServerStatus(member)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${member.es_servidor
                        ? 'bg-[#A8D500] text-black shadow-[0_0_15px_rgba(168,213,0,0.3)]'
                        : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-white'
                        }`}
                >
                    <UserCircle size={16} />
                    {member.es_servidor ? 'ES SERVIDOR' : 'HACER SERVIDOR'}
                </button>
                <button
                    onClick={() => toggleAdminStatus(member)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${member.es_administrador
                        ? 'bg-[#FFB400] text-black shadow-[0_0_15px_rgba(255,180,0,0.3)]'
                        : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-white'
                        }`}
                >
                    <ShieldCheck size={16} />
                    {member.es_administrador ? 'ES ADMIN' : 'HACER ADMIN'}
                </button>
                {showArchived ? (
                    <button
                        onClick={() => handleRestore(member)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00D9FF] text-black font-bold text-sm transition-all hover:scale-105"
                        title="Restaurar miembro"
                    >
                        <UserPlus size={14} /> RESTAURAR
                    </button>
                ) : (
                    <button
                        onClick={() => handleArchive(member)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#222] text-[#555] hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-all opacity-0 md:opacity-0 group-hover:opacity-100"
                        title="Archivar miembro"
                    >
                        <Archive size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};


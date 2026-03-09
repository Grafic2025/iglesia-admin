import React from 'react';
import { UserPlus } from 'lucide-react';

interface UltimosMiembrosProps {
    miembros: any[];
}

const UltimosMiembros = ({ miembros }: UltimosMiembrosProps) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                <UserPlus size={18} className="text-[#00D9FF]" /> Recién Llegados
            </h3>
            <div className="space-y-4">
                {miembros.map((m, index) => (
                    <div key={m.id || index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center border border-[#444] text-white font-bold text-xs shrink-0 overflow-hidden">
                            {m.foto_perfil ? (
                                <img src={m.foto_perfil} alt={m.nombre} className="w-full h-full object-cover" />
                            ) : (
                                (m.nombre?.[0] || '') + (m.apellido?.[0] || '')
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-[#eee] text-sm font-bold truncate leading-tight">
                                {m.nombre} {m.apellido}
                            </h4>
                            <p className="text-[#888] text-[10px] truncate leading-tight mt-0.5">
                                Se unió el {new Date(m.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    </div>
                ))}
                {miembros.length === 0 && (
                    <p className="text-[#888] text-xs text-center py-4">No hay nuevos miembros recientes</p>
                )}
            </div>
        </div>
    );
};

export default UltimosMiembros;

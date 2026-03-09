import React from 'react';
import { Flame, Activity } from 'lucide-react';

interface TermometroServidoresProps {
    servidoresQuemados: Array<{
        id: string;
        nombre: string;
        apellido: string;
        rol: string;
        semanasSeguidas: number;
    }>;
}

const TermometroServidores = ({ servidoresQuemados }: TermometroServidoresProps) => {
    return (
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#ff6b6b]/10 rounded-xl relative">
                        <Flame size={20} className="text-[#ff6b6b]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-widest text-sm uppercase">Termómetro de Servidores</h3>
                        <p className="text-[#888] text-[10px] uppercase font-bold">Riesgo de Burnout</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {servidoresQuemados.length === 0 ? (
                    <div className="h-full flex items-center justify-center flex-col text-center opacity-50 p-4">
                        <Activity size={32} className="text-[#555] mb-2" />
                        <p className="text-[#888] text-xs font-bold uppercase">Equipo descansado</p>
                    </div>
                ) : (
                    servidoresQuemados.map((s) => (
                        <div key={s.id} className="group relative flex items-center justify-between bg-[#151515] p-3 rounded-xl border border-white/5">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-white font-bold text-sm truncate">{s.nombre} {s.apellido}</p>
                                <p className="text-[10px] text-[#888] uppercase font-bold tracking-wider truncate">
                                    Rol: <span className="text-white">{s.rol}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center justify-center bg-[#ff6b6b]/20 px-2 py-1 rounded-md border border-[#ff6b6b]/30">
                                    <Flame size={12} className="text-[#ff6b6b] mr-1" />
                                    <span className="text-[#ff6b6b] font-black text-xs">{s.semanasSeguidas} sem.</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-[#333]">
                <p className="text-[10px] text-[#888] leading-tight italic">
                    <strong className="text-white">Tip:</strong> Otorga fines de semana libres a las personas que superen las 3 semanas consecutivas de servicio para cuidar su salud espiritual.
                </p>
            </div>
        </div>
    );
};

export default TermometroServidores;

import React from 'react';
import { UserMinus, AlertTriangle } from 'lucide-react';

interface RadarAusenciasProps {
    ausentes: Array<{
        id: string;
        nombre: string;
        apellido: string;
        foto_perfil?: string;
        ausenciasSeguidas: number;
    }>;
}

const RadarAusencias = ({ ausentes }: RadarAusenciasProps) => {
    return (
        <div className="bg-[#1e1e1e] border border-orange-500/20 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-xl relative">
                    {ausentes.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>}
                    <AlertTriangle size={20} className="text-orange-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-widest text-sm uppercase">Radar de Ausencias</h3>
                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] uppercase font-bold">Riesgo de desconexión</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {ausentes.length === 0 ? (
                    <div className="h-full flex items-center justify-center flex-col text-center opacity-50 p-4">
                        <UserMinus size={32} className="text-[rgba(255,255,255,0.5)] mb-2" />
                        <p className="text-[rgba(255,255,255,0.7)] text-xs font-bold uppercase">Nadie en riesgo alto</p>
                    </div>
                ) : (
                    ausentes.map((m) => (
                        <div key={m.id} className="group flex items-center gap-4 bg-[#151515] p-3 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all">
                            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#333] flex items-center justify-center overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                {m.foto_perfil ? (
                                    <img src={m.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <UserMinus size={16} className="text-[rgba(255,255,255,0.5)]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{m.nombre} {m.apellido}</p>
                                <p className="text-[10px] text-orange-400 uppercase font-black tracking-wider line-clamp-1">
                                    Ausente hace {m.ausenciasSeguidas} domingos
                                </p>
                            </div>
                            <button
                                onClick={() => alert('Abrir módulo de comunicación (Próximamente)')}
                                className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-black transition-all"
                                title="Contactar"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
            {ausentes.length > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-[rgba(255,255,255,0.5)] italic">Basado en el registro de los últimos 30 días.</p>
                </div>
            )}
        </div>
    );
};

export default RadarAusencias;

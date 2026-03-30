import React from 'react';
import { Target, Activity } from 'lucide-react';

interface RetencionMensualProps {
    tasa: number;
    activos: number;
    total: number;
}

const RetencionMensual = ({ tasa, activos, total }: RetencionMensualProps) => {
    return (
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Target size={20} className="text-purple-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-widest text-sm uppercase">Asistencia Constante</h3>
                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] uppercase font-bold">Últimos 30 días</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="transparent" stroke="#333" strokeWidth="12" />
                        <circle cx="64" cy="64" r="56" fill="transparent" stroke="#9333EA" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * (tasa || 0) / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="text-center z-10">
                        <span className="text-4xl text-white font-black">{tasa || 0}<span className="text-lg text-[rgba(255,255,255,0.7)]">%</span></span>
                    </div>
                </div>
                <p className="text-accent text-[10px] font-black uppercase mt-1 flex items-center gap-1 justify-center relative"><Activity size={10} /> +5% este mes</p>
            </div>

            <div className="bg-[#151515] p-3 border border-white/5 rounded-xl">
                <p className="text-[11px] text-[rgba(255,255,255,0.7)] text-center italic">
                    De <strong>{total}</strong> miembros inscritos, el <strong>{tasa}%</strong> asistió regularmente el último mes.
                </p>
            </div>
        </div>
    );
};

export default RetencionMensual;

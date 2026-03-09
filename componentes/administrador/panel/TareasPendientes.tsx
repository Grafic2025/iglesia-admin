import React from 'react';
import { Calendar as CalendarIcon, Droplet, Users, HeartHandshake, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface TareasPendientesProps {
    bautismos: any[];
    ayuda: any[];
}

const TareasPendientes = ({ bautismos, ayuda }: TareasPendientesProps) => {

    // Simulating specific alerts if they need attention
    const hasBautismos = bautismos.length > 0;
    const hasAyuda = ayuda.length > 0;

    return (
        <div className="bg-[#1e1e1e] border border-[#ff4444]/20 rounded-2xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl relative">
                        {(hasBautismos || hasAyuda) && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>}
                        <ShieldAlert size={20} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-widest text-sm uppercase">Atención Pastoral</h3>
                        <p className="text-[#888] text-[10px] uppercase font-bold">Solicitudes Pendientes</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
                {(!hasBautismos && !hasAyuda) ? (
                    <div className="flex flex-col items-center justify-center opacity-50 py-6 text-center">
                        <HeartHandshake size={32} className="text-[#555] mb-2" />
                        <p className="text-[#888] text-xs font-bold uppercase">No hay solicitudes nuevas</p>
                    </div>
                ) : (
                    <>
                        {hasAyuda && (
                            <Link href="/solicitudes" className="group bg-[#151515] p-4 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 text-red-400 rounded-lg group-hover:scale-110 transition-transform"><HeartHandshake size={18} /></div>
                                    <div>
                                        <p className="text-white text-sm font-bold">Acompañamiento</p>
                                        <p className="text-[#888] text-[10px] uppercase font-bold">{ayuda.length} solicitudes esperando</p>
                                    </div>
                                </div>
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md">{ayuda.length}</span>
                            </Link>
                        )}
                        {hasBautismos && (
                            <Link href="/solicitudes" className="group bg-[#151515] p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/40 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform"><Droplet size={18} /></div>
                                    <div>
                                        <p className="text-white text-sm font-bold">Bautismos</p>
                                        <p className="text-[#888] text-[10px] uppercase font-bold">{bautismos.length} candidatos inscritos</p>
                                    </div>
                                </div>
                                <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md">{bautismos.length}</span>
                            </Link>
                        )}
                    </>
                )}
            </div>

            <div className="mt-4 flex justify-between gap-2">
                <button className="flex-1 bg-[#222] hover:bg-[#333] border border-[#444] rounded-lg py-2 text-white text-[10px] font-bold uppercase tracking-wider transition-all">Ver Todas</button>
            </div>
        </div>
    );
};

export default TareasPendientes;

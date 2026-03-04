'use client'
import React from 'react';
import { Droplets, Info, ExternalLink, Calendar, Phone } from 'lucide-react';

interface SolicitudesViewProps {
    bautismos: any[];
    ayuda: any[];
}

const SolicitudesView: React.FC<SolicitudesViewProps> = ({ bautismos, ayuda }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Centro de Solicitudes</h2>
                <p className="text-[#888] text-sm">Gestiona los pedidos de bautismo y ayuda recibidos desde la App.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECCIÓN BAUTISMOS */}
                <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#333] shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[#00D9FF] text-xl font-bold flex items-center gap-3">
                            <Droplets size={24} /> Bautismos
                        </h3>
                        <span className="bg-[#00D9FF]/10 text-[#00D9FF] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            {bautismos.length} PENDIENTES
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {bautismos.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-[#333] rounded-2xl">
                                <p className="text-[#555] italic">No hay solicitudes nuevas de bautismo</p>
                            </div>
                        ) : (
                            bautismos.map((b) => (
                                <div key={b.id} className="bg-[#252525] p-5 rounded-2xl border border-[#333] hover:border-[#00D9FF]/30 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-white text-lg font-bold">{b.miembros?.nombre} {b.miembros?.apellido}</div>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-[#888]">
                                                    <Calendar size={12} className="text-[#00D9FF]" />
                                                    {b.edad} años
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-[#888]">
                                                    <Info size={12} className="text-[#00D9FF]" />
                                                    Grupo: <span className="text-white font-medium">{b.pertenece_grupo}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://wa.me/${b.celular?.replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
                                        >
                                            <Phone size={18} />
                                        </a>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#333] text-[10px] text-[#555] font-black uppercase tracking-tighter">
                                        CELULAR: {b.celular}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SECCIÓN AYUDA */}
                <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#333] shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-red-500 text-xl font-bold flex items-center gap-3">
                            <Info size={24} /> Pedidos de Ayuda
                        </h3>
                        <span className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            {ayuda.length} ALERTAS
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {ayuda.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-[#333] rounded-2xl">
                                <p className="text-[#555] italic">Todo en orden, no hay pedidos de ayuda</p>
                            </div>
                        ) : (
                            ayuda.map((a) => (
                                <div key={a.id} className="bg-[#252525] p-5 rounded-2xl border border-[#333] hover:border-red-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-white text-lg font-bold">{a.miembros?.nombre} {a.miembros?.apellido}</div>
                                        <a
                                            href={`https://wa.me/${a.celular?.replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
                                        >
                                            <Phone size={18} />
                                        </a>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-red-500/10 italic text-[#aaa] text-sm leading-relaxed">
                                        "{a.mensaje}"
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#333] text-[10px] text-red-500 font-black uppercase tracking-tighter">
                                        TELÉFONO DE CONTACTO: {a.celular}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolicitudesView;

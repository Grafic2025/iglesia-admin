'use client'
import React from 'react';
import { ImageIcon, RefreshCw, Trash2, Edit, PlusCircle, Droplets, Info } from 'lucide-react';

interface CMSViewProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    editarNoticia: (n: any) => void;
    eliminarNoticia: (id: string) => void;
    agregarNoticia: () => void;
    bautismos: any[];
    ayuda: any[];
    supabase: any;
}

const CMSView = ({
    noticias, syncYouTube, editarNoticia, eliminarNoticia, agregarNoticia,
    bautismos, ayuda
}: CMSViewProps) => {

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Management */}
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[#FFB400] text-lg font-bold flex items-center gap-2">
                            <ImageIcon size={20} /> CMS: Noticias y Banners
                        </h3>
                        <button
                            onClick={() => syncYouTube(true)}
                            className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all"
                        >
                            <RefreshCw size={14} /> Sync YouTube
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {noticias.map((n) => (
                            <div key={n.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center gap-4">
                                <img src={n.imagen_url} className="w-12 h-12 rounded-lg object-cover bg-[#333]" alt="" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-white text-sm font-bold truncate">{n.titulo}</div>
                                        {n.activa && <div className="w-1.5 h-1.5 rounded-full bg-[#A8D500]" />}
                                    </div>
                                    <div className="text-[10px] text-[#888] flex gap-2">
                                        <span>{n.es_youtube ? '🔴 YouTube' : '📰 Noticia'}</span>
                                        {n.categoria && <span className="text-[#A8D500] font-bold"># {n.categoria}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editarNoticia(n)} className="p-2 text-[#FFB400] hover:bg-[#FFB40010] rounded-lg">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => eliminarNoticia(n.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={agregarNoticia}
                            className="w-full py-4 border-2 border-dashed border-[#333] text-[#888] rounded-xl flex items-center justify-center gap-2 hover:border-[#A8D500] hover:text-[#A8D500] transition-all"
                        >
                            <PlusCircle size={20} /> Agregar Contenido Manual
                        </button>
                    </div>
                </div>

                {/* Requests & Inquiries */}
                <div className="space-y-6">
                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                        <h3 className="text-[#00D9FF] text-lg font-bold flex items-center gap-2 mb-6">
                            <Droplets size={20} /> Bautismos
                        </h3>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto">
                            {bautismos.length === 0 && <p className="text-[#555] text-center py-4 italic">Sin solicitudes nuevas</p>}
                            {bautismos.map((b) => (
                                <div key={b.id} className="bg-[#252525] p-4 rounded-xl border border-[#333]">
                                    <div className="text-white font-bold">{b.miembros?.nombre} {b.miembros?.apellido}</div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="text-[10px] text-[#888]">Edad: <span className="text-white">{b.edad}</span></div>
                                        <div className="text-[10px] text-[#888]">Grupo: <span className="text-white">{b.pertenece_grupo}</span></div>
                                    </div>
                                    <div className="text-[10px] text-[#00D9FF] mt-1 font-bold">Cel: {b.celular}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                        <h3 className="text-red-500 text-lg font-bold flex items-center gap-2 mb-6">
                            <Info size={20} /> Pedidos de Ayuda
                        </h3>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto">
                            {ayuda.length === 0 && <p className="text-[#555] text-center py-4 italic">Todo en orden</p>}
                            {ayuda.map((a) => (
                                <div key={a.id} className="bg-[#252525] p-4 rounded-xl border border-[#333]">
                                    <div className="text-white font-bold">{a.miembros?.nombre} {a.miembros?.apellido}</div>
                                    <div className="text-[#aaa] text-xs mt-2 italic">"{a.mensaje}"</div>
                                    <div className="text-[10px] text-red-500 mt-2 font-bold">Cel: {a.celular}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSView;

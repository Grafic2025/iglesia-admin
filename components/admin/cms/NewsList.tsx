import React from 'react';
import { ImageIcon, RefreshCw, Trash2, Edit, PlusCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface NewsListProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    onEdit: (n: any) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onMove?: (id: string, direction: 'up' | 'down') => void;
}

const NewsList: React.FC<NewsListProps> = ({ noticias, syncYouTube, onEdit, onDelete, onAdd, onMove }) => {
    return (
        <div className="bg-[#151515] p-6 rounded-3xl border border-[#222] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[#FFB400] text-xl font-black flex items-center gap-2 tracking-tight">
                    <ImageIcon size={22} /> CMS: Noticias
                    <span className="text-[#555] font-medium text-sm">(Carrusel)</span>
                </h3>
                <button
                    onClick={() => syncYouTube(true)}
                    className="flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-3 py-2 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                >
                    <RefreshCw size={14} /> SYNC YOUTUBE
                </button>
            </div>

            <div className="space-y-3">
                {noticias.map((n) => (
                    <div key={n.id} className="bg-[#1e1e1e] p-3 rounded-2xl border border-[#2a2a2a] flex items-center gap-4 group hover:border-[#FFB40050] transition-all">
                        <div className="relative shrink-0">
                            <img src={n.imagen_url} className="w-12 h-12 rounded-xl object-cover bg-[#151515] border border-[#2a2a2a] shadow-inner" alt="" />
                            {n.activa && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#A8D500] border-2 border-[#1e1e1e] shadow-sm" />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-white text-sm font-bold truncate group-hover:text-[#FFB400] transition-colors uppercase tracking-wide">{n.titulo}</div>
                            <div className="text-[10px] text-[#555] flex items-center gap-2 font-bold mt-1">
                                <span className="bg-[#151515] px-2 py-0.5 rounded-md border border-white/5">{n.es_youtube ? '🔴 YOUTUBE' : '📰 NOTICIA'}</span>
                                {n.categoria && <span className="text-[#FFB400] tracking-widest"># {n.categoria.toUpperCase()}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity bg-[#151515] p-1 rounded-xl border border-white/5">
                            {onMove && (
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => onMove(n.id, 'up')}
                                        className="p-1 text-[#555] hover:text-[#FFB400] transition-colors"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => onMove(n.id, 'down')}
                                        className="p-1 text-[#555] hover:text-[#FFB400] transition-colors"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            )}
                            <div className="w-px h-6 bg-[#2a2a2a] mx-1" />
                            <button onClick={() => onEdit(n)} className="p-2 text-[#FFB400] hover:bg-[#FFB40015] rounded-lg transition-colors">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(n.id)} className="p-2 text-red-500 hover:bg-red-500/15 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={onAdd}
                    className="w-full py-6 border-2 border-dashed border-[#222] text-[#555] rounded-3xl flex items-center justify-center gap-2 hover:border-[#FFB40050] hover:text-[#FFB400] hover:bg-[#FFB40005] transition-all font-black text-xs tracking-widest"
                >
                    <PlusCircle size={20} /> AGREGAR CONTENIDO MANUAL
                </button>
            </div>
        </div>
    );
};

export default NewsList;

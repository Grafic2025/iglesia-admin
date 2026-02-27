import React from 'react';
import { ImageIcon, RefreshCw, Trash2, Edit, PlusCircle } from 'lucide-react';

interface NewsListProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    onEdit: (n: any) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

const NewsList: React.FC<NewsListProps> = ({ noticias, syncYouTube, onEdit, onDelete, onAdd }) => {
    return (
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

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {noticias.map((n) => (
                    <div key={n.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center gap-4">
                        <img src={n.imagen_url} className="w-12 h-12 rounded-lg object-cover bg-[#333]" alt="" />
                        <div className="flex-1 min-w-0 text-left">
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
                            <button onClick={() => onEdit(n)} className="p-2 text-[#FFB400] hover:bg-[#FFB40010] rounded-lg">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => onDelete(n.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={onAdd}
                    className="w-full py-4 border-2 border-dashed border-[#333] text-[#888] rounded-xl flex items-center justify-center gap-2 hover:border-[#A8D500] hover:text-[#A8D500] transition-all"
                >
                    <PlusCircle size={20} /> Agregar Contenido Manual
                </button>
            </div>
        </div>
    );
};

export default NewsList;

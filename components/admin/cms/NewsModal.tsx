import React from 'react';
import { ImageIcon, Plus, X } from 'lucide-react';

interface NewsModalProps {
    currentNews: any;
    titulo: string; setTitulo: (v: string) => void;
    descripcion: string; setDescripcion: (v: string) => void;
    imagenUrl: string; setImagenUrl: (v: string) => void;
    categoria: string; setCategoria: (v: string) => void;
    activa: boolean; setActiva: (v: boolean) => void;
    venceEl: string; setVenceEl: (v: string) => void;
    isUploading: boolean;
    handleUpload: (e: any) => void;
    onSave: () => void;
    onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({
    currentNews, titulo, setTitulo, descripcion, setDescripcion,
    imagenUrl, setImagenUrl, categoria, setCategoria, activa, setActiva,
    venceEl, setVenceEl, isUploading, handleUpload, onSave, onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E1E1E] border border-[#333] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-left">
                <div className="flex-1 p-6 space-y-4 max-h-[85vh] overflow-y-auto border-r border-[#333] custom-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg">{currentNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
                        <button onClick={onClose} className="text-[#888] md:hidden"><X /></button>
                    </div>
                    <div>
                        <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Título</label>
                        <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={60} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]" />
                    </div>
                    <div>
                        <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Descripción (Opcional)</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={150} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500] h-20 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Categoría</label>
                            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]">
                                <option>Aviso</option>
                                <option>Evento</option>
                                <option>Serie</option>
                                <option>Inscripción</option>
                                <option>Campaña</option>
                                <option>Importante</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Vence el: (Opcional)</label>
                            <input type="date" value={venceEl} onChange={e => setVenceEl(e.target.value)} className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500] [color-scheme:dark]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={activa} onChange={e => setActiva(e.target.checked)} className="accent-[#A8D500] w-4 h-4" />
                            <span className="text-white text-xs font-bold">Activa</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Imagen</label>
                        <div className="flex gap-2">
                            <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#A8D500]" />
                            <label className="bg-[#333] p-2 rounded-xl cursor-pointer hover:bg-[#444] transition-all">
                                <Plus size={20} className="text-[#A8D500]" />
                                <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
                            </label>
                        </div>
                        {isUploading && <p className="text-[#A8D500] text-[10px] mt-1 italic animate-pulse">Subiendo imagen...</p>}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 text-[#888] font-bold bg-[#333] rounded-xl">CANCELAR</button>
                        <button onClick={onSave} className="flex-1 py-3 bg-[#A8D500] text-black font-bold rounded-xl shadow-lg shadow-[#A8D50030]">GUARDAR</button>
                    </div>
                </div>

                {/* PREVIEW PANEL */}
                <div className="w-full md:w-[320px] bg-[#121212] p-6 flex flex-col items-center justify-center">
                    <div className="flex justify-between w-full mb-4">
                        <h4 className="text-[#555] text-[9px] font-bold uppercase tracking-widest">Vista Previa App</h4>
                        <button onClick={onClose} className="text-[#888] hidden md:block"><X /></button>
                    </div>
                    <div className="w-[280px] h-[180px] rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 bg-[#1E1E1E]">
                        {imagenUrl ? (
                            <img src={imagenUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#222]">
                                <ImageIcon size={32} className="text-[#333]" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <div className="bg-[#A8D500] px-2 py-0.5 rounded text-[8px] font-black text-black self-start mb-1 uppercase tracking-wider">
                                {categoria}
                            </div>
                            <h5 className="text-white font-bold text-sm leading-tight">{titulo || 'Título de la Noticia'}</h5>
                            {descripcion && <p className="text-white/60 text-[10px] mt-1 truncate">{descripcion}</p>}
                        </div>
                    </div>
                    <div className="mt-8 bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#A8D50020] flex items-center justify-center text-[#A8D500] font-bold text-xs italic">
                                {titulo?.[0] || '?'}
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-white font-bold">{titulo || 'Nueva Noticia'}</div>
                                <div className="text-[8px] text-[#555]">Hace unos segundos</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[9px] text-[#444] mt-6 text-center italic">Así se verá en el carrusel principal.</p>
                </div>
            </div>
        </div>
    );
};

export default NewsModal;

'use client'
import React from 'react';
import { ImageIcon, RefreshCw, Trash2, Edit, PlusCircle, Droplets, Info, Plus } from 'lucide-react';

interface CMSViewProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    editarNoticia: (n: any) => void;
    eliminarNoticia: (id: string) => void;
    agregarNoticia: () => void;
    bautismos: any[];
    ayuda: any[];
    supabase: any;
    fetchNoticias: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

const CMSView = ({
    noticias, syncYouTube, editarNoticia, eliminarNoticia, agregarNoticia,
    bautismos, ayuda, supabase, fetchNoticias, registrarAuditoria
}: CMSViewProps) => {
    const [showModal, setShowModal] = React.useState(false);
    const [currentNews, setCurrentNews] = React.useState<any>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    // Form states
    const [titulo, setTitulo] = React.useState('');
    const [descripcion, setDescripcion] = React.useState('');
    const [imagenUrl, setImagenUrl] = React.useState('');
    const [categoria, setCategoria] = React.useState('Aviso');
    const [activa, setActiva] = React.useState(true);
    const [venceEl, setVenceEl] = React.useState('');

    const openEdit = (n: any) => {
        setCurrentNews(n);
        setTitulo(n.titulo);
        setDescripcion(n.descripcion || '');
        setImagenUrl(n.imagen_url);
        setCategoria(n.categoria || 'Aviso');
        setActiva(n.activa);
        setVenceEl(n.vence_el || '');
        setShowModal(true);
    };

    const openAdd = () => {
        setCurrentNews(null);
        setTitulo('');
        setDescripcion('');
        setImagenUrl('');
        setCategoria('Aviso');
        setActiva(true);
        setVenceEl('');
        setShowModal(true);
    };

    const handleSave = async () => {
        const payload = {
            titulo,
            descripcion,
            imagen_url: imagenUrl,
            categoria,
            activa,
            es_youtube: currentNews?.es_youtube || false,
            vence_el: venceEl || null
        };
        let error;
        if (currentNews?.id) {
            const { error: err } = await supabase.from('noticias').update(payload).eq('id', currentNews.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('noticias').insert([payload]);
            error = err;
        }

        if (error) alert("Error al guardar: " + error.message);
        else {
            setShowModal(false);
            if (fetchNoticias) await fetchNoticias();
            else window.location.reload();
        }
    };

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `noticias/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('imagenes-iglesia')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('imagenes-iglesia')
                .getPublicUrl(filePath);

            setImagenUrl(publicUrl);
        } catch (error: any) {
            alert('Error subiendo imagen: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

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
                                    <button onClick={() => openEdit(n)} className="p-2 text-[#FFB400] hover:bg-[#FFB40010] rounded-lg">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => eliminarNoticia(n.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={openAdd}
                            className="w-full py-4 border-2 border-dashed border-[#333] text-[#888] rounded-xl flex items-center justify-center gap-2 hover:border-[#A8D500] hover:text-[#A8D500] transition-all"
                        >
                            <PlusCircle size={20} /> Agregar Contenido Manual
                        </button>
                    </div>
                </div>

                {/* News Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#1E1E1E] border border-[#333] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col md:flex-row">
                            <div className="flex-1 p-6 space-y-4 max-h-[85vh] overflow-y-auto border-r border-[#333]">
                                <h3 className="text-white font-bold text-lg mb-4">{currentNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
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
                                        <input type="checkbox" checked={activa} onChange={e => setActiva(e.target.checked)} className="accent-[#A8D500]" />
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
                                    <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-[#888] font-bold bg-[#333] rounded-xl">CANCELAR</button>
                                    <button onClick={handleSave} className="flex-1 py-3 bg-[#A8D500] text-black font-bold rounded-xl shadow-lg shadow-[#A8D50030]">GUARDAR</button>
                                </div>
                            </div>

                            {/* PREVIEW PANEL */}
                            <div className="w-full md:w-[320px] bg-[#121212] p-6 flex flex-col items-center justify-center">
                                <h4 className="text-[#555] text-[9px] font-bold uppercase mb-4 self-start tracking-widest">Vista Previa App</h4>
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
                                        <div>
                                            <div className="text-[10px] text-white font-bold">{titulo || 'Nueva Noticia'}</div>
                                            <div className="text-[8px] text-[#555]">Hace unos segundos</div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-[#444] mt-6 text-center italic">Así se verá en el carrusel principal.</p>
                            </div>
                        </div>
                    </div>
                )}

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

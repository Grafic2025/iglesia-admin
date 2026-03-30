'use client';
import React, { useEffect, useState } from 'react';

export default function VideosPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal de videos
    const [modalAbierto, setModalAbierto] = useState(false);
    const [categoriaActual, setCategoriaActual] = useState<string | null>(null);
    const [nuevoId, setNuevoId] = useState('');
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevaFecha, setNuevaFecha] = useState('');

    // Modal de secciones
    const [modalSeccionAbierto, setModalSeccionAbierto] = useState(false);
    const [nuevaSeccionNombre, setNuevaSeccionNombre] = useState('');
    const [nuevaSeccionColor, setNuevaSeccionColor] = useState('#FF0055');

    const loadContent = async () => {
        try {
            setLoading(true);
            const configRes = await fetch('/api/videos-config');
            const data = await configRes.json();
            setConfig(data);
        } catch (err) {
            console.error('Error loading config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    const guardarConfiguracion = async (nuevaConfig: any) => {
        try {
            await fetch('/api/videos-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaConfig)
            });
            setConfig(nuevaConfig);
        } catch (error) {
            alert('Error al guardar la configuración');
        }
    };

    const manejarAgregarSeccion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaSeccionNombre) return;

        const id = nuevaSeccionNombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const nuevaSeccionObj = {
            id,
            titulo: nuevaSeccionNombre,
            color: nuevaSeccionColor,
            videos: []
        };

        const nuevaConfig = {
            ...config,
            secciones: [...(config.secciones || []), nuevaSeccionObj]
        };

        await guardarConfiguracion(nuevaConfig);
        setModalSeccionAbierto(false);
        setNuevaSeccionNombre('');
    };

    const manejarEliminarSeccion = async (secId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta sección COMPLETA y todos sus videos?')) return;
        const nuevaConfig = {
            ...config,
            secciones: (config.secciones || []).filter((s: any) => s.id !== secId)
        };
        await guardarConfiguracion(nuevaConfig);
    };

    const manejarAgregarVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaActual || !nuevoId || !nuevoTitulo || !config) return;

        const nuevoVideo = {
            id: nuevoId,
            titulo: nuevoTitulo,
            descripcion: nuevaDescripcion,
            fecha: nuevaFecha || new Date().toISOString().split('T')[0]
        };

        let nuevaConfig = { ...config };

        if (categoriaActual.startsWith('seccion:')) {
            const secId = categoriaActual.split(':')[1];
            nuevaConfig.secciones = (nuevaConfig.secciones || []).map((sec: any) => {
                if (sec.id === secId) {
                    return { ...sec, videos: [nuevoVideo, ...(sec.videos || [])] };
                }
                return sec;
            });
        } else {
            nuevaConfig = {
                ...config,
                [categoriaActual]: [nuevoVideo, ...(config[categoriaActual] || [])]
            };
        }

        await guardarConfiguracion(nuevaConfig);
        cerrarModal();
    };

    const manejarEliminarVideo = async (categoria: string, id: string) => {
        if (!confirm('¿Estás seguro de eliminar este video?')) return;
        
        let nuevaConfig = { ...config };

        if (categoria.startsWith('seccion:')) {
            const secId = categoria.split(':')[1];
            nuevaConfig.secciones = (nuevaConfig.secciones || []).map((sec: any) => {
                if (sec.id === secId) {
                    return { ...sec, videos: sec.videos.filter((v: any) => v.id !== id) };
                }
                return sec;
            });
        } else {
            nuevaConfig[categoria] = nuevaConfig[categoria].filter((v: any) => v.id !== id);
        }
        
        await guardarConfiguracion(nuevaConfig);
    };

    const abrirModal = (categoria: string) => {
        setCategoriaActual(categoria);
        setNuevoId('');
        setNuevoTitulo('');
        setNuevaDescripcion('');
        setNuevaFecha(new Date().toISOString().split('T')[0]);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCategoriaActual(null);
    };

    if (loading) return <div className="p-20 text-white">Cargando videoteca...</div>;
    if (!config) return <div className="p-20 text-red-500">Error cargando configuración</div>;

    const predicas = config.predicas || [];
    const podcasts = config.podcasts || [];
    const secciones = config.secciones || [];

    return (
        <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20 relative">
            <div className="flex items-center justify-between mb-16">
                <div>
                    <h2 className="text-[#c5ff00] text-xs font-black tracking-[4px] uppercase mb-1">Centro Multimedia</h2>
                    <h3 className="text-5xl font-black tracking-tighter">Videoteca Admin</h3>
                    <p className="text-white/70 mt-3 max-w-2xl text-base font-medium">Contenido organizado en categorías interactivas.</p>
                </div>
                <button onClick={() => setModalSeccionAbierto(true)} className="bg-[#c5ff00] text-black px-6 py-3 rounded-full font-black tracking-widest uppercase text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(197,255,0,0.3)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    AGREGAR SECCIÓN
                </button>
            </div>

            <div className="space-y-6">
                {/* TARJETA ESENCIALES */}
                <CategoriaTarjeta titulo="Esenciales" color="#c5ff00" cantidad={predicas.length} abierta={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                        {predicas.map((v: any) => (
                            <VideoItemAdmin key={v.id} video={v} color="#c5ff00" category="ESENCIALES" onEliminar={() => manejarEliminarVideo('predicas', v.id)} />
                        ))}
                    </div>
                    <button onClick={() => abrirModal('predicas')} className="w-full py-4 rounded-xl border-2 border-dashed border-[#c5ff00]/20 text-[#c5ff00]/70 hover:border-[#c5ff00]/50 hover:text-[#c5ff00] transition-colors font-bold tracking-widest uppercase text-sm">
                        + Agregar a Esenciales
                    </button>
                </CategoriaTarjeta>

                {/* TARJETA PODCASTS */}
                <CategoriaTarjeta titulo="Podcasts" color="#00D9FF" cantidad={podcasts.length} abierta={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                        {podcasts.map((v: any) => (
                            <VideoItemAdmin key={v.id} video={v} color="#00D9FF" category="PODCAST" onEliminar={() => manejarEliminarVideo('podcasts', v.id)} />
                        ))}
                    </div>
                    <button onClick={() => abrirModal('podcasts')} className="w-full py-4 rounded-xl border-2 border-dashed border-[#00D9FF]/20 text-[#00D9FF]/70 hover:border-[#00D9FF]/50 hover:text-[#00D9FF] transition-colors font-bold tracking-widest uppercase text-sm">
                        + Agregar Podcast
                    </button>
                </CategoriaTarjeta>

                {/* SECCIONES DINÁMICAS */}
                {secciones.map((sec: any) => (
                    <CategoriaTarjeta key={sec.id} titulo={sec.titulo} color={sec.color} cantidad={sec.videos?.length || 0} abierta={false} onEliminarSeccion={() => manejarEliminarSeccion(sec.id)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                            {(sec.videos || []).map((v: any) => (
                                <VideoItemAdmin key={v.id} video={v} color={sec.color} category={sec.titulo.toUpperCase()} onEliminar={() => manejarEliminarVideo(`seccion:${sec.id}`, v.id)} />
                            ))}
                        </div>
                        <button onClick={() => abrirModal(`seccion:${sec.id}`)} className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-white/50 hover:text-white transition-colors font-bold tracking-widest uppercase text-sm" style={{ borderStyle: 'dashed', borderColor: sec.color, opacity: 0.7 }}>
                            <span style={{ color: sec.color }}>+ Agregar a {sec.titulo}</span>
                        </button>
                    </CategoriaTarjeta>
                ))}
            </div>

            {/* MODAL DE AGREGAR VIDEO */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">
                            Añadir Video
                        </h3>
                        <form onSubmit={manejarAgregarVideo} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">ID del Video (YouTube)</label>
                                <input required value={nuevoId} onChange={e => setNuevoId(e.target.value)} type="text" placeholder="Ej: TrbgzzYroR8" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                                <p className="text-[10px] text-white/30 mt-1">El código de 11 letras de youtube (Ej: watch?v=CODIGO)</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Título</label>
                                <input required value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Descripción (Opcional)</label>
                                <textarea value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Fecha</label>
                                <input required type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                            </div>
                            
                            <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                                <button type="button" onClick={cerrarModal} className="flex-1 py-3 text-white/50 font-bold hover:text-white transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE AGREGAR SECCIÓN */}
            {modalSeccionAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight text-[#c5ff00]">
                            Nueva Sección
                        </h3>
                        <form onSubmit={manejarAgregarSeccion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Nombre de la sección</label>
                                <input required value={nuevaSeccionNombre} onChange={e => setNuevaSeccionNombre(e.target.value)} type="text" placeholder="Ej: Alabanzas" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c5ff00]/50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 mb-1 uppercase tracking-wider">Color Distintivo</label>
                                <div className="flex gap-3">
                                    <input type="color" value={nuevaSeccionColor} onChange={e => setNuevaSeccionColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                                    <input type="text" value={nuevaSeccionColor} onChange={e => setNuevaSeccionColor(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setModalSeccionAbierto(false)} className="flex-1 py-3 text-white/50 font-bold hover:text-white transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-[#c5ff00] text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategoriaTarjeta({ titulo, color, cantidad, abierta, onEliminarSeccion, children }: any) {
    const [isOpen, setIsOpen] = useState(abierta);

    return (
        <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 relative group/tarjeta">
            <div className="flex w-full">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="flex-1 px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-3 h-12 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: color }}></div>
                        <h4 className="text-4xl font-black tracking-tight">{titulo}</h4>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="bg-white/10 text-white px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-widest">{cantidad} Videos</span>
                        <svg className={`w-8 h-8 text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                {onEliminarSeccion && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEliminarSeccion(); }}
                        className="px-6 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-colors border-l border-white/5 flex items-center justify-center"
                        title="Eliminar Sección Completa"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="px-8 pb-8 pt-4 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-4 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}

function VideoItemAdmin({ video, color, category, onEliminar }: any) {
    return (
        <div className="group relative">
            <a href={`/ver.html?v=${video.id}`} target="_blank" className="block relative aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:scale-[1.02]">
                <img 
                    src={video.portada_url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl">
                    <p className="text-[8px] font-black tracking-widest uppercase text-white" style={{ color }}>{category}</p>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <h5 className="font-extrabold text-xs leading-snug line-clamp-2 text-white group-hover:text-white transition-colors">{video.titulo}</h5>
                </div>
            </a>
            <button 
                onClick={(e) => { e.preventDefault(); onEliminar(); }}
                className="absolute -top-3 -right-3 bg-red-600 outline outline-[3px] outline-[#111] text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:scale-110 z-10"
                title="Eliminar Video"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

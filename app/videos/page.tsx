'use client';
import React, { useEffect, useState } from 'react';

const playlistId = 'PL9eGAPSt61HBxiNwoXIG0xpaWzf0aNTuC';

// Datos estáticos de Prédicas (Edición Verano)
const PREDICAS_ESENCIALES = [
    { id: 'TrbgzzYroR8', titulo: 'Esenciales | El Prójimo', fecha: '2024-03-05', portada_url: 'https://img.youtube.com/vi/TrbgzzYroR8/hqdefault.jpg' },
    { id: 'ajYJitRcmNM', titulo: 'Esenciales | Dones', fecha: '2024-02-26', portada_url: 'https://img.youtube.com/vi/ajYJitRcmNM/hqdefault.jpg' },
    { id: '-A4WkBh8Pbc', titulo: 'Esenciales | Identidad', fecha: '2024-02-19', portada_url: 'https://img.youtube.com/vi/-A4WkBh8Pbc/hqdefault.jpg' },
    { id: 'RY2A-EqvPSo', titulo: 'Esenciales | Los Atributos De Dios', fecha: '2024-02-12', portada_url: 'https://img.youtube.com/vi/RY2A-EqvPSo/hqdefault.jpg' },
    { id: '1WEbEMosr4Y', titulo: 'Esenciales | La Trinidad', fecha: '2024-02-05', portada_url: 'https://img.youtube.com/vi/1WEbEMosr4Y/hqdefault.jpg' },
    { id: '8N10Cm1eYrM', titulo: 'Esenciales | El Señor', fecha: '2024-01-29', portada_url: 'https://img.youtube.com/vi/8N10Cm1eYrM/hqdefault.jpg' },
    { id: '_xXHimF8LYA', titulo: 'Esenciales | La Segunda Venida', fecha: '2024-01-22', portada_url: 'https://img.youtube.com/vi/_xXHimF8LYA/hqdefault.jpg' },
    { id: 'GuIwcWzk9Po', titulo: 'Esenciales | La Iglesia', fecha: '2024-01-15', portada_url: 'https://img.youtube.com/vi/GuIwcWzk9Po/hqdefault.jpg' },
    { id: 'qT7N-PNa_0o', titulo: 'Esenciales | La Oración y La Palabra', fecha: '2024-01-08', portada_url: 'https://img.youtube.com/vi/qT7N-PNa_0o/hqdefault.jpg' },
    { id: '1l7d7ZYzXCQ', titulo: 'Esenciales | El Salvador', fecha: '2024-01-01', portada_url: 'https://img.youtube.com/vi/1l7d7ZYzXCQ/hqdefault.jpg' }
];

export default function VideosPage() {
    const [podcasts, setPodcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
                const data = await response.json();
                
                if (data && data.contents) {
                    const xml = data.contents;
                    const entries = xml.split('<entry>').slice(1);
                    const mappedVideos = entries.map((entry: string) => {
                        const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
                        const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
                        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
                        
                        if (!videoId) return null;
                        
                        // Solo incluimos como podcasts los que dicen "Episodio" en el título
                        // o los que no están en la lista fija de Prédicas
                        return {
                            id: videoId,
                            titulo: title || 'Video',
                            fecha: published || new Date().toISOString(),
                            portada_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                        };
                    }).filter((v: any) => v !== null && (v.titulo.toLowerCase().includes('episodio') || !PREDICAS_ESENCIALES.find(p => p.id === v.id)));
                    
                    setPodcasts(mappedVideos);
                }
            } catch (err) {
                console.error('Error YouTube:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, []);

    return (
        <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Cabecera */}
            <div className="mb-12">
                <h2 className="text-[#A8D500] text-xs font-black tracking-[4px] uppercase mb-1">Multimedia</h2>
                <h3 className="text-4xl font-black">Videoteca Admin</h3>
                <p className="text-white/40 mt-2 max-w-2xl text-sm">Organización del contenido audiovisual para la aplicación y la web.</p>
            </div>

            <div className="space-y-20">
                {/* 1. Prédicas Esenciales */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-[2px] bg-[#c5ff00]"></div>
                            <h4 className="text-2xl font-black tracking-tight">Prédicas</h4>
                        </div>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[3px]">Summer Edition • 10 Videos</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {PREDICAS_ESENCIALES.map(v => <VideoCard key={v.id} video={v} color="#c5ff00" category="PRÉDICA" />)}
                    </div>
                </section>

                {/* 2. Podcasts (Episodios) */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-[2px] bg-[#00D9FF]"></div>
                            <h4 className="text-2xl font-black tracking-tight">Podcasts</h4>
                        </div>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[3px]">Desde YouTube • {podcasts.length} Episodios</span>
                    </div>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-white">
                            {podcasts.length > 0 ? podcasts.map(v => <VideoCard key={v.id} video={v} color="#00D9FF" category="EPISODIO" />) : 
                                <div className="col-span-full py-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
                                    <p className="text-white/20 italic font-medium">No se encontraron nuevos episodios en el feed de YouTube.</p>
                                </div>
                            }
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function VideoCard({ video, color, category }: { video: any, color: string, category: string }) {
    return (
        <a 
            href={`/ver.html?v=${video.id}`}
            target="_blank"
            className="group block relative"
        >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.05] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                <img 
                    src={video.portada_url} 
                    alt={video.titulo} 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                />
                
                {/* Overlay Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-40"></div>
                
                {/* Badge de Categoría */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                    <p className="text-[8px] font-black tracking-widest uppercase text-white/80">{category}</p>
                </div>

                {/* Botón Play */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                </div>

                {/* Info Inferior */}
                <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-500 group-hover:translate-y-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
                        <p className="text-[9px] font-black uppercase tracking-[2px] text-white/60">ID: {video.id}</p>
                    </div>
                    <h5 className="font-bold text-xs leading-snug line-clamp-2 text-white group-hover:text-white transition-colors">{video.titulo}</h5>
                </div>
            </div>
        </a>
    );
}

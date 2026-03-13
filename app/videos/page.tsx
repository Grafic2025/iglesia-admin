'use client';
import React, { useEffect, useState } from 'react';

// 1. PRÉDICAS (Summer Edition - Títulos según capturas)
const PREDICAS = [
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

// 2. PODCASTS (Episodios fundamentales)
const PODCASTS_ESTATICOS = [
    { id: '1l7d7ZYzXCQ', titulo: 'Episodio 01 | El Salvador', fecha: '2024-01-01', portada_url: 'https://img.youtube.com/vi/1l7d7ZYzXCQ/hqdefault.jpg' },
    { id: 'qT7N-PNa_0o', titulo: 'Episodio 02 | La Oración y La Palabra', fecha: '2024-01-08', portada_url: 'https://img.youtube.com/vi/qT7N-PNa_0o/hqdefault.jpg' },
    { id: 'GuIwcWzk9Po', titulo: 'Episodio 03 | La Iglesia', fecha: '2024-01-15', portada_url: 'https://img.youtube.com/vi/GuIwcWzk9Po/hqdefault.jpg' },
    { id: '_xXHimF8LYA', titulo: 'Episodio 04 | La Segunda Venida', fecha: '2024-01-22', portada_url: 'https://img.youtube.com/vi/_xXHimF8LYA/hqdefault.jpg' },
    { id: '8N10Cm1eYrM', titulo: 'Episodio 05 | El Señor', fecha: '2024-01-29', portada_url: 'https://img.youtube.com/vi/8N10Cm1eYrM/hqdefault.jpg' },
    { id: '1WEbEMosr4Y', titulo: 'Episodio 06 | La Trinidad', fecha: '2024-02-05', portada_url: 'https://img.youtube.com/vi/1WEbEMosr4Y/hqdefault.jpg' },
    { id: 'RY2A-EqvPSo', titulo: 'Episodio 07 | Los Atributos De Dios', fecha: '2024-02-12', portada_url: 'https://img.youtube.com/vi/RY2A-EqvPSo/hqdefault.jpg' },
    { id: '-A4WkBh8Pbc', titulo: 'Episodio 08 | Identidad', fecha: '2024-02-19', portada_url: 'https://img.youtube.com/vi/-A4WkBh8Pbc/hqdefault.jpg' },
    { id: 'ajYJitRcmNM', titulo: 'Episodio 09 I Dones', fecha: '2024-02-26', portada_url: 'https://img.youtube.com/vi/ajYJitRcmNM/hqdefault.jpg' },
    { id: 'TrbgzzYroR8', titulo: 'Episodio 10 | El Prójimo', fecha: '2024-03-05', portada_url: 'https://img.youtube.com/vi/TrbgzzYroR8/hqdefault.jpg' }
];

const playlistId = 'PL9eGAPSt61HBxiNwoXIG0xpaWzf0aNTuC';

export default function VideosPage() {
    const [podcastsDinamicos, setPodcastsDinamicos] = useState<any[]>([]);
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
                        
                        // Solo incluimos como podcasts extras los que no están ya en nuestras listas estáticas
                        const esEstatico = PODCASTS_ESTATICOS.some(p => p.id === videoId) || PREDICAS.some(p => p.id === videoId);
                        
                        if (esEstatico) return null;

                        return {
                            id: videoId,
                            titulo: title || 'Video',
                            fecha: published || new Date().toISOString(),
                            portada_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                        };
                    }).filter((v: any) => v !== null);
                    
                    setPodcastsDinamicos(mappedVideos);
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
        <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
            {/* Cabecera Principal */}
            <div className="mb-16">
                <h2 className="text-[#c5ff00] text-xs font-black tracking-[4px] uppercase mb-1">Centro Multimedia</h2>
                <h3 className="text-5xl font-black tracking-tighter">Videoteca Admin</h3>
                <p className="text-white/40 mt-3 max-w-2xl text-base">Organización del contenido audiovisual para la aplicación y la web.</p>
            </div>

            <div className="space-y-24">
                {/* 1. SECCIÓN DE PRÉDICAS (ARRIBA) */}
                <section>
                    <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-[#c5ff00]"></div>
                            <div>
                                <h4 className="text-3xl font-black tracking-tight">Prédicas</h4>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Summer Edition • Colección Estática</p>
                            </div>
                        </div>
                        <span className="bg-[#c5ff00]/10 text-[#c5ff00] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">10 Videos</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {PREDICAS.map(v => <VideoCard key={v.id} video={v} color="#c5ff00" category="PRÉDICA" />)}
                    </div>
                </section>

                {/* 2. SECCIÓN DE PODCASTS (ABAJO) */}
                <section>
                    <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-[#00D9FF]"></div>
                            <div>
                                <h4 className="text-3xl font-black tracking-tight">Podcasts</h4>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Episodios y Contenido YouTube</p>
                            </div>
                        </div>
                        <span className="bg-[#00D9FF]/10 text-[#00D9FF] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {PODCASTS_ESTATICOS.length + podcastsDinamicos.length} Videos
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {/* Primero los 10 episodios fundamentales */}
                        {PODCASTS_ESTATICOS.map(v => <VideoCard key={v.id} video={v} color="#00D9FF" category="EPISODIO" />)}
                        
                        {/* Luego los nuevos de YouTube */}
                        {podcastsDinamicos.map(v => <VideoCard key={v.id} video={v} color="#00D9FF" category="YOUTUBE" />)}
                        
                        {loading && podcastsDinamicos.length === 0 && (
                            <div className="col-span-full py-10 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Buscando nuevos episodios en YouTube...</p>
                            </div>
                        )}
                    </div>
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
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#111] border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.05] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <img 
                    src={video.portada_url} 
                    alt={video.titulo} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                />
                
                {/* Overlay Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-40"></div>
                
                {/* Badge de Categoría */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl">
                    <p className="text-[8px] font-black tracking-widest uppercase text-white" style={{ color }}>{category}</p>
                </div>

                {/* Botón Play */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                </div>

                {/* Info Inferior */}
                <div className="absolute bottom-5 left-5 right-5 transform transition-all duration-500 group-hover:translate-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[3px] text-white/40 mb-2">ID: {video.id}</p>
                    <h5 className="font-extrabold text-xs leading-snug line-clamp-2 text-white group-hover:text-[#c5ff00] transition-colors">{video.titulo}</h5>
                </div>
            </div>
            {/* Sombra de fondo decorativa */}
            <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity blur-2xl -z-10`} style={{ backgroundColor: color }}></div>
        </a>
    );
}

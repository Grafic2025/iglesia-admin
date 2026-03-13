'use client';
import React, { useEffect, useState } from 'react';

export default function VideosPage() {
    const [predicas, setPredicas] = useState<any[]>([]);
    const [podcasts, setPodcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            try {
                // 1. Cargar configuración desde el JSON central
                const configRes = await fetch('/videos_config.json');
                const config = await configRes.json();
                
                setPredicas(config.predicas || []);
                const estaticos = config.podcasts || [];
                const playlistId = config.playlistId;

                // 2. Buscar nuevos en YouTube
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
                            if (estaticos.some((p: any) => p.id === videoId)) return null;
                            if (config.predicas.some((p: any) => p.id === videoId)) return null;

                            return {
                                id: videoId,
                                titulo: title || 'Video',
                                fecha: published || new Date().toISOString(),
                                portada_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            };
                        }).filter((v: any) => v !== null);
                        
                        setPodcasts([...estaticos, ...mappedVideos]);
                    } else {
                        setPodcasts(estaticos);
                    }
                } catch (err) {
                    setPodcasts(estaticos);
                }
            } catch (err) {
                console.error('Error loading config:', err);
            } finally {
                setLoading(false);
            }
        }
        loadContent();
    }, []);

    return (
        <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
            <div className="mb-16">
                <h2 className="text-[#c5ff00] text-xs font-black tracking-[4px] uppercase mb-1">Centro Multimedia</h2>
                <h3 className="text-5xl font-black tracking-tighter">Videoteca Admin</h3>
                <p className="text-white/40 mt-3 max-w-2xl text-base">Contenido sincronizado con la aplicación móvil.</p>
            </div>

            <div className="space-y-24">
                <section>
                    <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-[#c5ff00]"></div>
                            <h4 className="text-3xl font-black tracking-tight">Prédicas</h4>
                        </div>
                        <span className="bg-[#c5ff00]/10 text-[#c5ff00] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{predicas.length} Videos</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {predicas.map(v => <VideoCard key={v.id} video={v} color="#c5ff00" category="PRÉDICA" />)}
                    </div>
                </section>

                <section>
                    <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-1 bg-[#00D9FF]"></div>
                            <h4 className="text-3xl font-black tracking-tight">Podcasts</h4>
                        </div>
                        <span className="bg-[#00D9FF]/10 text-[#00D9FF] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{podcasts.length} Videos</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {podcasts.map(v => <VideoCard key={v.id} video={v} color="#00D9FF" category="CONTENIDO" />)}
                    </div>
                </section>
            </div>
        </div>
    );
}

function VideoCard({ video, color, category }: { video: any, color: string, category: string }) {
    return (
        <a href={`/ver.html?v=${video.id}`} target="_blank" className="group block relative">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#111] border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.05]">
                <img 
                    src={video.portada_url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl">
                    <p className="text-[8px] font-black tracking-widest uppercase text-white" style={{ color }}>{category}</p>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                    <h5 className="font-extrabold text-xs leading-snug line-clamp-2 text-white group-hover:text-[#c5ff00] transition-colors">{video.titulo}</h5>
                </div>
            </div>
        </a>
    );
}

'use client';
import React, { useEffect, useState } from 'react';

const playlistId = 'PL9eGAPSt61HBxiNwoXIG0xpaWzf0aNTuC';

export default function VideosPage() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
                const data = await response.json();
                const xml = data.contents;

                const entries = xml.split('<entry>').slice(1);
                const mappedVideos = entries.map((entry: string) => {
                    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
                    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
                    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
                    
                    if (!videoId) return null;
                    return {
                        id: videoId,
                        titulo: title || 'Video',
                        fecha: published || new Date().toISOString(),
                        portada_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    };
                }).filter((v: any) => v !== null);

                setVideos(mappedVideos);
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, []);

    if (loading) return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c5ff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    return (
        <div className="min-h-screen bg-[#020205] text-white p-6 font-sans">
            <header className="mb-12 max-w-6xl mx-auto">
                <h1 className="text-[#c5ff00] text-sm font-black tracking-[4px] uppercase mb-2">Multimedia</h1>
                <h2 className="text-4xl font-black">Videoteca</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {videos.map((video) => (
                    <a 
                        key={video.id} 
                        href={`/ver.html?v=${video.id}`}
                        className="group relative block rounded-3xl overflow-hidden bg-[#0a0a1a] border border-white/5 transition-all hover:scale-[1.02] hover:border-[#c5ff00]/30"
                    >
                        <div className="aspect-video relative overflow-hidden">
                            <img 
                                src={video.portada_url} 
                                alt={video.titulo}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-[#c5ff00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(197,255,0,0.4)]">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-black fill-current">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#c5ff00] transition-colors">
                                {video.titulo}
                            </h3>
                            <p className="text-white/40 text-xs mt-3 font-semibold tracking-wider">
                                {new Date(video.fecha).toLocaleDateString()}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

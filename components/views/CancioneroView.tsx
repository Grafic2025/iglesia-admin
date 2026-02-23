'use client'
import React from 'react';
import { Music, Search, Plus, Play, FileText, ExternalLink } from 'lucide-react';

const CancioneroView = ({ supabase }: { supabase: any }) => {
    const songs = [
        { id: 1, title: 'La Bondad de Dios', artist: 'Bethel Music', bpm: 72, key: 'A', lastPlayed: 'Hoy' },
        { id: 2, title: 'Rey de Reyes', artist: 'Hillsong Worship', bpm: 68, key: 'D', lastPlayed: 'Hace 7 días' },
        { id: 3, title: 'Solo a Ti', artist: 'Miel San Marcos', bpm: 128, key: 'G', lastPlayed: 'Hace 14 días' },
        { id: 4, title: 'Venga Tu Reino', artist: 'En Espíritu y en Verdad', bpm: 76, key: 'F', lastPlayed: 'Hace 30 días' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Music className="text-[#A8D500]" /> CANCIONERO
                    </h2>
                    <p className="text-[#888] text-sm italic">Librería de canciones, acordes y recursos musicales</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#252525] text-white font-bold px-6 py-2.5 rounded-xl border border-[#333] hover:bg-[#333] transition-all">
                        IMPORTAR (PC)
                    </button>
                    <button className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95">
                        <Plus size={18} /> NUEVA CANCIÓN
                    </button>
                </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 border-b border-[#333] flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                        <input
                            placeholder="Buscar canción por título, artista o tono..."
                            className="w-full bg-[#252525] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-[#A8D500] transition-all"
                        />
                    </div>
                    <select className="bg-[#252525] text-white border border-[#333] rounded-xl px-4 py-2.5 outline-none font-bold text-xs uppercase cursor-pointer">
                        <option>Todos los Tonos</option>
                        <option>Tono: A</option>
                        <option>Tono: D</option>
                        <option>Tono: G</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#252525] text-[#888] text-xs uppercase tracking-widest border-b border-[#333]">
                                <th className="px-6 py-4 text-left">Título / Artista</th>
                                <th className="px-6 py-4 text-center">Tono</th>
                                <th className="px-6 py-4 text-center">BPM</th>
                                <th className="px-6 py-4 text-center">Último Uso</th>
                                <th className="px-6 py-4 text-right">Recursos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252525]">
                            {songs.map(song => (
                                <tr key={song.id} className="hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-white font-bold">{song.title}</p>
                                        <p className="text-[#555] text-xs">{song.artist}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-[#A8D50020] text-[#A8D500] px-3 py-1 rounded-lg text-sm font-black border border-[#A8D50020]">
                                            {song.key}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[#888] text-sm font-bold">
                                        {song.bpm}
                                    </td>
                                    <td className="px-6 py-4 text-center text-[#555] text-xs">
                                        {song.lastPlayed}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-[#888] hover:text-[#FFB400] hover:bg-[#FFB40010] rounded-lg transition-all" title="Ver YouTube">
                                                <Play size={16} />
                                            </button>
                                            <button className="p-2 text-[#888] hover:text-[#3B82F6] hover:bg-[#3B82F610] rounded-lg transition-all" title="Ver Acordes / Chart">
                                                <FileText size={16} />
                                            </button>
                                            <button className="p-2 text-[#888] hover:text-white hover:bg-[#333] rounded-lg transition-all">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CancioneroView;

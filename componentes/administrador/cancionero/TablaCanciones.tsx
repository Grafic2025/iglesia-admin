import React from 'react';
import { File, FileText, Edit2, Trash2, Video } from 'lucide-react';

interface TablaCancionesProps {
    songs: any[];
    loading: boolean;
    onEdit: (song: any) => void;
    onDelete: (id: string) => void;
    onViewLyrics: (song: any) => void;
}

const TablaCanciones: React.FC<TablaCancionesProps> = ({ songs, loading, onEdit, onDelete, onViewLyrics }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-[#252525] text-[rgba(255,255,255,0.7)] text-xs uppercase tracking-widest border-b border-[#333]">
                        <th className="px-6 py-4 text-left">Título / Artista</th>
                        <th className="px-6 py-4 text-center">Tono</th>
                        <th className="px-6 py-4 text-center">BPM</th>
                        <th className="px-6 py-4 text-right">Recursos / Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                    {loading ? (
                        <tr><td colSpan={4} className="text-center py-10 text-[rgba(255,255,255,0.5)]">Cargando canciones...</td></tr>
                    ) : songs.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-[rgba(255,255,255,0.5)]">No se encontraron canciones.</td></tr>
                    ) : (
                        songs.map((song) => (
                            <tr key={song.id} className="hover:bg-[#222] transition-colors group">
                                <td className="px-6 py-4 text-left">
                                    <p className="text-white font-bold">{song.titulo}</p>
                                    <p className="text-[rgba(255,255,255,0.5)] text-xs">{song.artista || 'Artista desconocido'}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-[var(--accent)20] text-accent px-3 py-1 rounded-lg text-sm font-black border border-[var(--accent)20]">
                                        {song.tono}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-[rgba(255,255,255,0.7)] text-sm font-bold">
                                    {song.bpm || '--'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {song.youtube_url && (
                                            <button onClick={() => window.open(song.youtube_url)} className="p-2 text-[rgba(255,255,255,0.7)] hover:text-[#FF0000] hover:bg-[#FF000010] rounded-lg transition-all" title="Ver YouTube">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                            </button>
                                        )}
                                        {song.spotify_url && (
                                            <button onClick={() => window.open(song.spotify_url)} className="p-2 text-[rgba(255,255,255,0.7)] hover:text-[#1DB954] hover:bg-[#1DB95410] rounded-lg transition-all" title="Escuchar en Spotify">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                                            </button>
                                        )}
                                        {song.pdf_url && (
                                            <button onClick={() => window.open(song.pdf_url)} className="p-2 text-[rgba(255,255,255,0.7)] hover:text-[#3B82F6] hover:bg-[#3B82F610] rounded-lg transition-all" title="Ver Partitura">
                                                <File size={16} />
                                            </button>
                                        )}
                                        <div className="w-px h-4 bg-[#333] mx-2"></div>
                                        {song.acordes && (
                                            <button onClick={() => onViewLyrics(song)} className="p-2 text-accent bg-[var(--accent)10] rounded-lg transition-all flex items-center gap-1 font-bold text-[10px]" title="Ver Letra y Acordes">
                                                <FileText size={16} /> ACORDES
                                            </button>
                                        )}
                                        <button onClick={() => onEdit(song)} className="p-2 text-[rgba(255,255,255,0.7)] hover:text-accent hover:bg-[var(--accent)10] rounded-lg transition-all" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(song.id)} className="p-2 text-[rgba(255,255,255,0.7)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaCanciones;


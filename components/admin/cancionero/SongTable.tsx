import React from 'react';
import { Youtube, File, FileText, Edit2, Trash2 } from 'lucide-react';

interface SongTableProps {
    songs: any[];
    loading: boolean;
    onEdit: (song: any) => void;
    onDelete: (id: string) => void;
    onViewLyrics: (song: any) => void;
}

const SongTable: React.FC<SongTableProps> = ({ songs, loading, onEdit, onDelete, onViewLyrics }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-[#252525] text-[#888] text-xs uppercase tracking-widest border-b border-[#333]">
                        <th className="px-6 py-4 text-left">Título / Artista</th>
                        <th className="px-6 py-4 text-center">Tono</th>
                        <th className="px-6 py-4 text-center">BPM</th>
                        <th className="px-6 py-4 text-right">Recursos / Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                    {loading ? (
                        <tr><td colSpan={4} className="text-center py-10 text-[#555]">Cargando canciones...</td></tr>
                    ) : songs.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-[#555]">No se encontraron canciones.</td></tr>
                    ) : (
                        songs.map((song) => (
                            <tr key={song.id} className="hover:bg-[#222] transition-colors group">
                                <td className="px-6 py-4 text-left">
                                    <p className="text-white font-bold">{song.titulo}</p>
                                    <p className="text-[#555] text-xs">{song.artista || 'Artista desconocido'}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-[#A8D50020] text-[#A8D500] px-3 py-1 rounded-lg text-sm font-black border border-[#A8D50020]">
                                        {song.tono}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-[#888] text-sm font-bold">
                                    {song.bpm || '--'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {song.youtube_url && (
                                            <button onClick={() => window.open(song.youtube_url)} className="p-2 text-[#888] hover:text-[#FF0000] hover:bg-[#FF000010] rounded-lg transition-all" title="Ver YouTube">
                                                <Youtube size={16} />
                                            </button>
                                        )}
                                        {song.pdf_url && (
                                            <button onClick={() => window.open(song.pdf_url)} className="p-2 text-[#888] hover:text-[#3B82F6] hover:bg-[#3B82F610] rounded-lg transition-all" title="Ver Partitura">
                                                <File size={16} />
                                            </button>
                                        )}
                                        <div className="w-px h-4 bg-[#333] mx-2"></div>
                                        {song.acordes && (
                                            <button onClick={() => onViewLyrics(song)} className="p-2 text-[#A8D500] bg-[#A8D50010] rounded-lg transition-all flex items-center gap-1 font-bold text-[10px]" title="Ver Letra y Acordes">
                                                <FileText size={16} /> ACORDES
                                            </button>
                                        )}
                                        <button onClick={() => onEdit(song)} className="p-2 text-[#888] hover:text-[#A8D500] hover:bg-[#A8D50010] rounded-lg transition-all" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(song.id)} className="p-2 text-[#888] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
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

export default SongTable;

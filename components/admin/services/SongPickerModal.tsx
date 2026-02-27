import React from 'react';
import { X, Search } from 'lucide-react';

interface SongPickerModalProps {
    allSongs: any[];
    selectedSongIds: string[];
    songSearch: string;
    setSongSearch: (s: string) => void;
    toggleSong: (id: string) => void;
    onClose: () => void;
}

const SongPickerModal: React.FC<SongPickerModalProps> = ({
    allSongs,
    selectedSongIds,
    songSearch,
    setSongSearch,
    toggleSong,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-6 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 text-left">
                    <h3 className="text-white font-bold uppercase tracking-widest">Seleccionar Canciones</h3>
                    <button onClick={onClose} className="text-[#888]"><X /></button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar canción por título o artista..."
                        value={songSearch}
                        onChange={e => setSongSearch(e.target.value)}
                        className="w-full bg-[#222] border border-[#333] rounded-2xl py-3 pl-11 pr-4 text-white text-xs outline-none focus:border-[#A8D500] transition-all"
                    />
                </div>
                <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                    {allSongs.filter(s =>
                        s.titulo.toLowerCase().includes(songSearch.toLowerCase()) ||
                        s.artista.toLowerCase().includes(songSearch.toLowerCase())
                    ).map(s => (
                        <button
                            key={s.id}
                            onClick={() => toggleSong(s.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedSongIds.includes(s.id) ? 'bg-[#A8D500] border-transparent text-black' : 'bg-[#222] border-[#333] text-white hover:border-[#A8D500]'}`}
                        >
                            <div className="flex-1">
                                <p className="font-bold text-sm">{s.titulo}</p>
                                <p className={`text-[10px] ${selectedSongIds.includes(s.id) ? 'text-black/60' : 'text-[#555]'}`}>{s.artista} • {s.tono}</p>
                            </div>
                            {selectedSongIds.includes(s.id) && <X size={14} />}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-[#A8D500] text-black font-black rounded-xl mt-6 uppercase tracking-widest text-xs"
                >
                    Listo
                </button>
            </div>
        </div>
    );
};

export default SongPickerModal;

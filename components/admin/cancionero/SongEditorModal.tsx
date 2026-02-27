import React from 'react';
import { X } from 'lucide-react';

interface SongEditorModalProps {
    currentSong: any;
    titulo: string; setTitulo: (v: string) => void;
    artista: string; setArtista: (v: string) => void;
    tono: string; setTono: (v: string) => void;
    bpm: string; setBpm: (v: string) => void;
    youtubeUrl: string; setYoutubeUrl: (v: string) => void;
    pdfUrl: string; setPdfUrl: (v: string) => void;
    acordes: string; setAcordes: (v: string) => void;
    keys: string[];
    onSave: () => void;
    onClose: () => void;
}

const SongEditorModal: React.FC<SongEditorModalProps> = ({
    currentSong, titulo, setTitulo, artista, setArtista, tono, setTono, bpm, setBpm,
    youtubeUrl, setYoutubeUrl, pdfUrl, setPdfUrl, acordes, setAcordes, keys, onSave, onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
                <div className="p-6 border-b border-[#333] flex items-center justify-between shrink-0">
                    <h3 className="text-white font-bold text-xl">{currentSong ? 'Editar Canción' : 'Nueva Canción'}</h3>
                    <button onClick={onClose} className="text-[#888] hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Título de la Canción</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej: La Bondad de Dios"
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Artista / Banda</label>
                            <input
                                type="text"
                                value={artista}
                                onChange={(e) => setArtista(e.target.value)}
                                placeholder="Ej: Bethel Music"
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Tono Principal</label>
                            <select
                                value={tono}
                                onChange={(e) => setTono(e.target.value)}
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            >
                                {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">BPM</label>
                            <input
                                type="text"
                                value={bpm}
                                onChange={(e) => setBpm(e.target.value)}
                                placeholder="Ej: 72"
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">YouTube URL</label>
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Link a Partitura / PDF</label>
                            <input
                                type="text"
                                value={pdfUrl}
                                onChange={(e) => setPdfUrl(e.target.value)}
                                placeholder="Link a Drive, Dropbox o URL del PDF..."
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Letra y Acordes (Formato: [Chord] Letra)</label>
                            <textarea
                                value={acordes}
                                onChange={(e) => setAcordes(e.target.value)}
                                placeholder="[C] Dios de [F] amor..."
                                rows={6}
                                className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500] font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[#333] bg-[#1A1A1A] flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-[#222] text-white font-bold py-4 rounded-2xl border border-[#333] hover:bg-[#333] transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 bg-[#A8D500] text-black font-bold py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all"
                    >
                        {currentSong ? 'GUARDAR CAMBIOS' : 'CREAR CANCIÓN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SongEditorModal;

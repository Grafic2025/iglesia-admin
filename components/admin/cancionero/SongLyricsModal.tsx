import React from 'react';
import { X, FileText } from 'lucide-react';

interface SongLyricsModalProps {
    currentSong: any;
    acordes: string;
    transposedOffset: number;
    setTransposedOffset: (v: (p: number) => number) => void;
    transposeChord: (chord: string, semitones: number) => string;
    getTransposedLetra: (content: string, offset: number) => string;
    onClose: () => void;
}

const SongLyricsModal: React.FC<SongLyricsModalProps> = ({
    currentSong, acordes, transposedOffset, setTransposedOffset, transposeChord, getTransposedLetra, onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-0 md:p-10">
            <div className="bg-[#0A0A0A] w-full h-full md:h-auto md:max-w-4xl md:rounded-3xl border border-[#333] shadow-2xl flex flex-col overflow-hidden text-left">
                <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#111]">
                    <div>
                        <h3 className="text-white font-bold text-xl">{currentSong.titulo}</h3>
                        <p className="text-[#A8D500] text-sm font-bold uppercase">{currentSong.artista} • {currentSong.tono} • {currentSong.bpm} BPM</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#222] p-1 rounded-xl border border-[#333]">
                            <button onClick={() => setTransposedOffset(p => p - 1)} className="w-10 h-10 rounded-lg hover:bg-[#333] text-white font-bold">-</button>
                            <div className="px-4 py-1 text-center">
                                <p className="text-[10px] text-[#555] font-black uppercase">Tono</p>
                                <p className="text-[#A8D500] font-black text-sm">{transposeChord(currentSong.tono, transposedOffset)}</p>
                            </div>
                            <button onClick={() => setTransposedOffset(p => p + 1)} className="w-10 h-10 rounded-lg hover:bg-[#333] text-white font-bold">+</button>
                        </div>
                        <button onClick={onClose} className="p-3 text-[#888] hover:text-white rounded-full bg-[#222]"><X size={24} /></button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto font-mono custom-scrollbar">
                    <pre className="text-white text-lg whitespace-pre-wrap leading-relaxed">
                        {getTransposedLetra(acordes, transposedOffset).split('\n').map((line, idx) => (
                            <div key={idx} className="mb-2">
                                {line.split(/(\[[^\]]*\])/).map((part, i) => (
                                    part.startsWith('[') ?
                                        <span key={i} className="text-[#A8D500] font-black">{part.slice(1, -1)}</span> :
                                        <span key={i}>{part}</span>
                                ))}
                            </div>
                        ))}
                    </pre>
                </div>
                <div className="p-6 border-t border-[#333] bg-[#111] flex justify-between items-center">
                    <p className="text-[#555] text-xs italic">* Los acordes en verde se transponen automáticamente</p>
                    <button onClick={() => window.print()} className="text-[#888] hover:text-white flex items-center gap-2 text-sm font-bold">
                        <FileText size={16} /> IMPRIMIR LETRA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SongLyricsModal;

'use client'
import React, { useState, useEffect } from 'react';
import { Music, Search, Plus } from 'lucide-react';

// Modular Components
import SongTable from '../admin/cancionero/SongTable';
import SongEditorModal from '../admin/cancionero/SongEditorModal';
import SongLyricsModal from '../admin/cancionero/SongLyricsModal';

const CancioneroView = ({ supabase }: { supabase: any }) => {
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKey, setSelectedKey] = useState('Todos los Tonos');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [currentSong, setCurrentSong] = useState<any>(null);
    const [showLyricsModal, setShowLyricsModal] = useState(false);
    const [transposedOffset, setTransposedOffset] = useState(0);

    // Form states
    const [titulo, setTitulo] = useState('');
    const [artista, setArtista] = useState('');
    const [tono, setTono] = useState('A');
    const [bpm, setBpm] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [acordes, setAcordes] = useState('');

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('canciones')
                .select('*')
                .order('titulo', { ascending: true });
            if (error) throw error;
            setSongs(data || []);
        } catch (error) {
            console.error("Error fetching songs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, [supabase]);

    const handleOpenModal = (song: any = null) => {
        if (song) {
            setCurrentSong(song);
            setTitulo(song.titulo);
            setArtista(song.artista || '');
            setTono(song.tono || 'A');
            setBpm(song.bpm || '');
            setYoutubeUrl(song.youtube_url || '');
            setPdfUrl(song.pdf_url || '');
            setAcordes(song.acordes || '');
            setTransposedOffset(0);
        } else {
            setCurrentSong(null);
            setTitulo('');
            setArtista('');
            setTono('A');
            setBpm('');
            setYoutubeUrl('');
            setPdfUrl('');
            setAcordes('');
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!titulo) return alert("El título es obligatorio");

        const payload = {
            titulo, artista, tono, bpm,
            youtube_url: youtubeUrl,
            pdf_url: pdfUrl,
            acordes: acordes
        };

        let res;
        if (currentSong) {
            res = await supabase.from('canciones').update(payload).eq('id', currentSong.id);
        } else {
            res = await supabase.from('canciones').insert([payload]);
        }

        if (res.error) alert("Error al guardar: " + res.error.message);
        else {
            setShowModal(false);
            fetchSongs();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta canción permanentemente?")) return;
        const { error } = await supabase.from('canciones').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchSongs();
    };

    const transposeChord = (chord: string, semitones: number) => {
        const chordMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const reverseMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        const match = chord.match(/^([A-G][#b]?)(.*)/);
        if (!match) return chord;
        const [_, root, suffix] = match;

        if (chordMap[root] === undefined) return chord;

        let newIdx = (chordMap[root] + semitones) % 12;
        if (newIdx < 0) newIdx += 12;

        return reverseMap[newIdx] + suffix;
    };

    const getTransposedLetra = (content: string, offset: number) => {
        if (offset === 0) return content;
        return content.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
            return `[${transposeChord(chord, offset)}]`;
        });
    };

    const filteredSongs = songs.filter(s => {
        const matchesSearch = s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.artista && s.artista.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesKey = selectedKey === 'Todos los Tonos' || s.tono === selectedKey;
        return matchesSearch && matchesKey;
    });

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Music className="text-[#A8D500]" /> CANCIONERO
                    </h2>
                    <p className="text-[#888] text-sm italic">Librería de canciones, acordes y recursos musicales</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> NUEVA CANCIÓN
                </button>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 border-b border-[#333] flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={18} />
                        <input
                            placeholder="Buscar por título o artista..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#252525] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-[#A8D500] transition-all"
                        />
                    </div>
                    <select
                        value={selectedKey}
                        onChange={(e) => setSelectedKey(e.target.value)}
                        className="bg-[#252525] text-white border border-[#333] rounded-xl px-4 py-2.5 outline-none font-bold text-xs uppercase cursor-pointer"
                    >
                        <option>Todos los Tonos</option>
                        {keys.map(k => <option key={k} value={k}>Tono: {k}</option>)}
                    </select>
                </div>

                <SongTable
                    songs={filteredSongs}
                    loading={loading}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onViewLyrics={(song) => { setCurrentSong(song); setAcordes(song.acordes); setShowLyricsModal(true); }}
                />
            </div>

            {showModal && (
                <SongEditorModal
                    currentSong={currentSong}
                    titulo={titulo} setTitulo={setTitulo}
                    artista={artista} setArtista={setArtista}
                    tono={tono} setTono={setTono}
                    bpm={bpm} setBpm={setBpm}
                    youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl}
                    pdfUrl={pdfUrl} setPdfUrl={setPdfUrl}
                    acordes={acordes} setAcordes={setAcordes}
                    keys={keys}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showLyricsModal && currentSong && (
                <SongLyricsModal
                    currentSong={currentSong}
                    acordes={acordes}
                    transposedOffset={transposedOffset}
                    setTransposedOffset={setTransposedOffset}
                    transposeChord={transposeChord}
                    getTransposedLetra={getTransposedLetra}
                    onClose={() => { setShowLyricsModal(false); setTransposedOffset(0); }}
                />
            )}
        </div>
    );
};

export default CancioneroView;

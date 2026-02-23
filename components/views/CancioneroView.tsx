'use client'
import React, { useState, useEffect } from 'react';
import { Music, Search, Plus, Play, FileText, ExternalLink, X, Trash2, Edit2, Youtube, File } from 'lucide-react';

const CancioneroView = ({ supabase }: { supabase: any }) => {
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKey, setSelectedKey] = useState('Todos los Tonos');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [currentSong, setCurrentSong] = useState<any>(null);

    // Form states
    const [titulo, setTitulo] = useState('');
    const [artista, setArtista] = useState('');
    const [tono, setTono] = useState('A');
    const [bpm, setBpm] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');

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
        } else {
            setCurrentSong(null);
            setTitulo('');
            setArtista('');
            setTono('A');
            setBpm('');
            setYoutubeUrl('');
            setPdfUrl('');
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!titulo) return alert("El título es obligatorio");

        const payload = {
            titulo,
            artista,
            tono,
            bpm,
            youtube_url: youtubeUrl,
            pdf_url: pdfUrl
        };

        let error;
        if (currentSong) {
            const { error: err } = await supabase.from('canciones').update(payload).eq('id', currentSong.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('canciones').insert([payload]);
            error = err;
        }

        if (error) alert("Error al guardar: " + error.message);
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

    const filteredSongs = songs.filter(s => {
        const matchesSearch = s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.artista && s.artista.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesKey = selectedKey === 'Todos los Tonos' || s.tono === selectedKey;
        return matchesSearch && matchesKey;
    });

    const keys = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

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
                            ) : filteredSongs.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-[#555]">No se encontraron canciones.</td></tr>
                            ) : (
                                filteredSongs.map((song) => (
                                    <tr key={song.id} className="hover:bg-[#222] transition-colors group">
                                        <td className="px-6 py-4">
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
                                                <button onClick={() => handleOpenModal(song)} className="p-2 text-[#888] hover:text-[#A8D500] hover:bg-[#A8D50010] rounded-lg transition-all" title="Editar">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(song.id)} className="p-2 text-[#888] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: Nueva / Editar Canción */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#333] flex items-center justify-between">
                            <h3 className="text-white font-bold text-xl">{currentSong ? 'Editar Canción' : 'Nueva Canción'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#888] hover:text-white"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
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
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-[#222] text-white font-bold py-4 rounded-2xl border border-[#333] hover:bg-[#333] transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-[#A8D500] text-black font-bold py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all"
                                >
                                    {currentSong ? 'GUARDAR CAMBIOS' : 'CREAR CANCIÓN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CancioneroView;

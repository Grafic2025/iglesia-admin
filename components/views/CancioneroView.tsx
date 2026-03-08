'use client'
import React, { useState, useEffect } from 'react';
import { Music, Search, Plus } from 'lucide-react';

// Modular Components
import SongTable from '../admin/cancionero/SongTable';
import SongEditorModal from '../admin/cancionero/SongEditorModal';
import SongLyricsModal from '../admin/cancionero/SongLyricsModal';

import { useCancionero } from '../../hooks/useCancionero';

const CancioneroView = ({ supabase }: { supabase: any }) => {
    const {
        loading,
        songs,
        searchQuery, setSearchQuery,
        selectedKey, setSelectedKey,
        showModal, setShowModal,
        currentSong, setCurrentSong,
        showLyricsModal, setShowLyricsModal,
        transposedOffset, setTransposedOffset,
        titulo, setTitulo,
        artista, setArtista,
        tono, setTono,
        bpm, setBpm,
        youtubeUrl, setYoutubeUrl,
        pdfUrl, setPdfUrl,
        acordes, setAcordes,
        handleOpenModal,
        handleSave,
        handleDelete,
        transposeChord,
        getTransposedLetra,
        filteredSongs,
        keys
    } = useCancionero({ supabase });

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

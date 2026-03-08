import { useState, useEffect, useMemo } from 'react';

interface UseCancioneroProps {
    supabase: any;
}

export function useCancionero({ supabase }: UseCancioneroProps) {
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKey, setSelectedKey] = useState('Todos los Tonos');

    const [showModal, setShowModal] = useState(false);
    const [currentSong, setCurrentSong] = useState<any>(null);
    const [showLyricsModal, setShowLyricsModal] = useState(false);
    const [transposedOffset, setTransposedOffset] = useState(0);

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

    const filteredSongs = useMemo(() => {
        return songs.filter(s => {
            const matchesSearch = s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.artista && s.artista.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesKey = selectedKey === 'Todos los Tonos' || s.tono === selectedKey;
            return matchesSearch && matchesKey;
        });
    }, [songs, searchQuery, selectedKey]);

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return {
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
    };
}

import { useState } from 'react';

interface UseCMSProps {
    supabase: any;
    noticias: any[];
    fetchNoticias: () => Promise<void>;
    syncYouTube: (alert: boolean) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    enviarPushGeneral?: (title: string, message: string, imageUrl?: string, type?: string, extraData?: any) => Promise<any>;
}

export function useCMS({
    supabase,
    noticias,
    fetchNoticias,
    syncYouTube,
    registrarAuditoria,
    enviarPushGeneral
}: UseCMSProps) {
    const [showModal, setShowModal] = useState(false);
    const [currentNews, setCurrentNews] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagenUrl, setImagenUrl] = useState('');
    const [categoria, setCategoria] = useState('Aviso');
    const [activa, setActiva] = useState(true);
    const [venceEl, setVenceEl] = useState('');
    const [url, setUrl] = useState('');
    const [screen, setScreen] = useState('');
    const [notificar, setNotificar] = useState(false);

    const openEdit = (n: any) => {
        setCurrentNews(n);
        setTitulo(n.titulo);
        setDescripcion(n.descripcion || '');
        setImagenUrl(n.imagen_url);
        setCategoria(n.categoria || 'Aviso');
        setActiva(n.activa);
        setVenceEl(n.vence_el || '');
        setUrl(n.url || '');
        setScreen(n.screen || '');
        setShowModal(true);
    };

    const openAdd = () => {
        setCurrentNews(null);
        setTitulo('');
        setDescripcion('');
        setImagenUrl('');
        setCategoria('Aviso');
        setActiva(true);
        setVenceEl('');
        setUrl('');
        setScreen('');
        setNotificar(true);
        setShowModal(true);
    };

    const handleSave = async () => {
        const payload = {
            titulo,
            descripcion,
            imagen_url: imagenUrl,
            categoria,
            activa,
            es_youtube: currentNews?.es_youtube || false,
            vence_el: venceEl || null,
            url: url || null,
            screen: screen || null
        };
        let error;
        let insertedData = null;
        if (currentNews?.id) {
            const { error: err } = await supabase.from('noticias').update(payload).eq('id', currentNews.id);
            error = err;
        } else {
            const { data, error: err } = await supabase.from('noticias').insert([payload]).select().single();
            error = err;
            insertedData = data;
        }

        if (error) alert("Error al guardar: " + error.message);
        else {
            if (!currentNews?.id && notificar && enviarPushGeneral && insertedData) {
                enviarPushGeneral(
                    titulo,
                    descripcion || 'Iglesia del Salvador: Nueva noticia',
                    imagenUrl,
                    'news',
                    { newsId: insertedData.id, news: insertedData }
                );
            }
            setShowModal(false);
            setNotificar(false);
            if (fetchNoticias) await fetchNoticias();
            if (registrarAuditoria) await registrarAuditoria(currentNews ? 'EDITAR NOTICIA' : 'CREAR NOTICIA', titulo);
        }
    };

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `noticias/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('imagenes-iglesia')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('imagenes-iglesia')
                .getPublicUrl(filePath);

            setImagenUrl(publicUrl);
        } catch (error: any) {
            alert('Error subiendo imagen: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSyncYouTube = async (showAlert: boolean) => {
        const res = await syncYouTube(showAlert);
        if (res.success && showAlert) {
            const ytNews = noticias.find(n => n.id === '00000000-0000-0000-0000-000000000001');
            if (ytNews && confirm(`Sincronización exitosa: "${ytNews.titulo}". ¿Deseas enviar una notificación push a toda la iglesia?`)) {
                if (enviarPushGeneral) {
                    enviarPushGeneral(
                        ytNews.titulo,
                        "📺 Ya está disponible el mensaje de hoy. ¡Miralo ahora!",
                        ytNews.imagen_url,
                        'news',
                        { newsId: ytNews.id, news: ytNews }
                    );
                }
            } else {
                alert("Sincronización completada.");
            }
        } else if (!res.success) {
            alert("Error al sincronizar: " + res.error);
        }
    };

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        const sortedNoticias = [...noticias].sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const index = sortedNoticias.findIndex(n => n.id === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sortedNoticias.length) return;

        const currentItem = sortedNoticias[index];
        const adjacentItem = sortedNoticias[newIndex];

        const oldOrder = currentItem.orden || 0;
        const newOrder = adjacentItem.orden || 0;

        const updates = [
            { id: currentItem.id, orden: newOrder === oldOrder ? newIndex : newOrder },
            { id: adjacentItem.id, orden: newOrder === oldOrder ? index : oldOrder }
        ];

        for (const update of updates) {
            await supabase.from('noticias').update({ orden: update.orden }).eq('id', update.id);
        }

        if (fetchNoticias) fetchNoticias();
    };

    return {
        showModal, setShowModal,
        currentNews, setCurrentNews,
        isUploading,
        titulo, setTitulo,
        descripcion, setDescripcion,
        imagenUrl, setImagenUrl,
        categoria, setCategoria,
        activa, setActiva,
        venceEl, setVenceEl,
        url, setUrl,
        screen, setScreen,
        notificar, setNotificar,
        openEdit,
        openAdd,
        handleSave,
        handleUpload,
        handleSyncYouTube,
        handleMove
    };
}

'use client'
import React, { useState } from 'react';

// Modular Components
import NewsList from '../admin/cms/NewsList';
import NewsModal from '../admin/cms/NewsModal';
import ActionsManager from '../admin/cms/ActionsManager';

interface CMSViewProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    eliminarNoticia: (id: string) => void;
    supabase: any;
    fetchNoticias: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    enviarPushGeneral?: (title: string, message: string, imageUrl?: string) => Promise<any>;
}

const CMSView = ({
    noticias, syncYouTube, eliminarNoticia,
    supabase, fetchNoticias, registrarAuditoria,
    enviarPushGeneral
}: CMSViewProps) => {
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
        setNotificar(true); // Default to true for new news
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
        if (currentNews?.id) {
            const { error: err } = await supabase.from('noticias').update(payload).eq('id', currentNews.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('noticias').insert([payload]);
            error = err;
        }

        if (error) alert("Error al guardar: " + error.message);
        else {
            // Si es noticia nueva y el checkbox está marcado, notificar
            if (!currentNews?.id && notificar && enviarPushGeneral) {
                enviarPushGeneral(titulo, descripcion || 'Iglesia del Salvador: Nueva noticia', imagenUrl);
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

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        const sortedNoticias = [...noticias].sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const index = sortedNoticias.findIndex(n => n.id === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sortedNoticias.length) return;

        // Swap order values
        const currentItem = sortedNoticias[index];
        const adjacentItem = sortedNoticias[newIndex];

        const oldOrder = currentItem.orden || 0;
        const newOrder = adjacentItem.orden || 0;

        // If both are 0 (never moved), we need to initialize them based on current position
        const updates = [
            { id: currentItem.id, orden: newOrder === oldOrder ? newIndex : newOrder },
            { id: adjacentItem.id, orden: newOrder === oldOrder ? index : oldOrder }
        ];

        for (const update of updates) {
            await supabase.from('noticias').update({ orden: update.orden }).eq('id', update.id);
        }

        if (fetchNoticias) fetchNoticias();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Gestión de Contenido</h2>
                <p className="text-[#888] text-sm">Administra las noticias del carrusel y los accesos directos de la App desde un solo lugar.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                {/* COLUMNA 1: NOTICIAS */}
                <div className="space-y-6">
                    <NewsList
                        noticias={noticias}
                        syncYouTube={syncYouTube}
                        onEdit={openEdit}
                        onDelete={eliminarNoticia}
                        onAdd={openAdd}
                        onMove={handleMove}
                    />
                </div>

                {/* COLUMNA 2: TARJETAS DE INICIO */}
                <div className="space-y-6">
                    <ActionsManager
                        supabase={supabase}
                        registrarAuditoria={registrarAuditoria}
                        onPromote={(action) => {
                            setCurrentNews(null);
                            setTitulo(action.titulo);
                            setDescripcion('¡Novedad!');
                            setImagenUrl(action.imagen_url || '');
                            setScreen(action.pantalla);
                            setUrl('');
                            setCategoria('Aviso');
                            setActiva(true);
                            setShowModal(true);
                        }}
                    />
                </div>
            </div>

            {showModal && (
                <NewsModal
                    currentNews={currentNews}
                    titulo={titulo} setTitulo={setTitulo}
                    descripcion={descripcion} setDescripcion={setDescripcion}
                    imagenUrl={imagenUrl} setImagenUrl={setImagenUrl}
                    categoria={categoria} setCategoria={setCategoria}
                    activa={activa} setActiva={setActiva}
                    venceEl={venceEl} setVenceEl={setVenceEl}
                    url={url} setUrl={setUrl}
                    screen={screen} setScreen={setScreen}
                    notificar={notificar} setNotificar={setNotificar}
                    isNew={!currentNews}
                    isUploading={isUploading}
                    handleUpload={handleUpload}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default CMSView;

'use client'
import React, { useState } from 'react';

// Modular Components
import NewsList from '../admin/cms/NewsList';
import NewsModal from '../admin/cms/NewsModal';
import SidebarSections from '../admin/cms/SidebarSections';

interface CMSViewProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => void;
    eliminarNoticia: (id: string) => void;
    bautismos: any[];
    ayuda: any[];
    supabase: any;
    fetchNoticias: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

const CMSView = ({
    noticias, syncYouTube, eliminarNoticia,
    bautismos, ayuda, supabase, fetchNoticias, registrarAuditoria
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

    const openEdit = (n: any) => {
        setCurrentNews(n);
        setTitulo(n.titulo);
        setDescripcion(n.descripcion || '');
        setImagenUrl(n.imagen_url);
        setCategoria(n.categoria || 'Aviso');
        setActiva(n.activa);
        setVenceEl(n.vence_el || '');
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
            vence_el: venceEl || null
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
            setShowModal(false);
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewsList
                    noticias={noticias}
                    syncYouTube={syncYouTube}
                    onEdit={openEdit}
                    onDelete={eliminarNoticia}
                    onAdd={openAdd}
                />

                <SidebarSections
                    bautismos={bautismos}
                    ayuda={ayuda}
                />
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

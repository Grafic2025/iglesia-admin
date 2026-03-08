'use client'
import React, { useState } from 'react';

// Modular Components
import NewsList from '../admin/cms/NewsList';
import NewsModal from '../admin/cms/NewsModal';
import ActionsManager from '../admin/cms/ActionsManager';

interface CMSViewProps {
    noticias: any[];
    syncYouTube: (alert: boolean) => Promise<any>;
    eliminarNoticia: (id: string) => void;
    supabase: any;
    fetchNoticias: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    enviarPushGeneral?: (title: string, message: string, imageUrl?: string, type?: string, extraData?: any) => Promise<any>;
}

import { useCMS } from '../../hooks/useCMS';

const CMSView = ({
    noticias, syncYouTube, eliminarNoticia,
    supabase, fetchNoticias, registrarAuditoria,
    enviarPushGeneral
}: CMSViewProps) => {
    const {
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
    } = useCMS({
        supabase,
        noticias,
        fetchNoticias,
        syncYouTube,
        registrarAuditoria,
        enviarPushGeneral
    });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 w-full min-h-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Gestión de Contenido</h2>
                    <p className="text-[#666] text-sm font-medium">Administra las noticias del carrusel y los accesos directos de la App.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* COLUMNA 1: NOTICIAS (40%) */}
                <div className="lg:col-span-5 space-y-6">
                    <NewsList
                        noticias={noticias}
                        syncYouTube={handleSyncYouTube}
                        onEdit={openEdit}
                        onDelete={eliminarNoticia}
                        onAdd={openAdd}
                        onMove={handleMove}
                    />
                </div>

                {/* COLUMNA 2: TARJETAS DE INICIO (60%) */}
                <div className="lg:col-span-7 space-y-6">
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

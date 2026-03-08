'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';

// Modular Components
import ServiceCard from '../admin/services/ServiceCard';
import ServiceEditorModal from '../admin/services/ServiceEditorModal';
import SongPickerModal from '../admin/services/SongPickerModal';
import StaffPickerModal from '../admin/services/StaffPickerModal';
import TemplatePickerModal from '../admin/services/TemplatePickerModal';

import { useServicios } from '../../hooks/useServicios';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano", "Teclados", "Guitarra"] },
    { name: "Medios", roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"] },
    { name: "Voces", roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"] },
    { name: "General", roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"] }
];

const ServiciosView = ({ supabase, enviarNotificacionIndividual, registrarAuditoria }: {
    supabase: any,
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>,
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>
}) => {
    const {
        loading,
        schedules,
        selectedSchedule,
        allSongs,
        allMembers,
        fecha, setFecha,
        horario, setHorario,
        notas, setNotas,
        detailedRows, setDetailedRows,
        selectedSongIds,
        assignedStaff, setAssignedStaff,
        showModal, setShowModal,
        showSongPicker, setShowSongPicker,
        showStaffPicker, setShowStaffPicker,
        showTemplatePicker, setShowTemplatePicker,
        songSearch, setSongSearch,
        staffSearch, setStaffSearch,
        notificarAlGuardar, setNotificarAlGuardar,
        handleOpenModal,
        handleSave,
        notificarEquipoManual,
        deleteSchedule,
        toggleChat,
        exportarCSV,
        toggleSong,
        assignStaff,
        handleSelectTemplate
    } = useServicios({ supabase, enviarNotificacionIndividual, registrarAuditoria });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-[#A8D500]" /> PLANIFICACIÓN (CRONOGRAMAS)
                    </h2>
                    <p className="text-[#888] text-sm italic">Organiza los cultos, equipos y canciones del domingo</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> CREAR CRONOGRAMA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map(s => (
                    <ServiceCard
                        key={s.id}
                        service={s}
                        onEdit={handleOpenModal}
                        onDelete={deleteSchedule}
                        onNotify={notificarEquipoManual}
                        onToggleChat={toggleChat}
                        onExport={exportarCSV}
                    />
                ))}
            </div>

            {showModal && (
                <ServiceEditorModal
                    selectedSchedule={selectedSchedule}
                    fecha={fecha} setFecha={setFecha}
                    horario={horario} setHorario={setHorario}
                    notas={notas} setNotas={setNotas}
                    detailedRows={detailedRows} setDetailedRows={setDetailedRows}
                    selectedSongIds={selectedSongIds}
                    allSongs={allSongs}
                    assignedStaff={assignedStaff} setAssignedStaff={setAssignedStaff}
                    allMembers={allMembers}
                    roleCategories={ROLE_CATEGORIES}
                    notificarAlGuardar={notificarAlGuardar} setNotificarAlGuardar={setNotificarAlGuardar}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    onShowSongPicker={() => setShowSongPicker(true)}
                    onShowStaffPicker={() => setShowStaffPicker(true)}
                    onShowTemplatePicker={() => setShowTemplatePicker(true)}
                    onToggleSong={toggleSong}
                />
            )}

            {showSongPicker && (
                <SongPickerModal
                    allSongs={allSongs}
                    selectedSongIds={selectedSongIds}
                    songSearch={songSearch}
                    setSongSearch={setSongSearch}
                    toggleSong={toggleSong}
                    onClose={() => setShowSongPicker(false)}
                />
            )}

            {showStaffPicker && (
                <StaffPickerModal
                    allMembers={allMembers}
                    assignedStaff={assignedStaff}
                    staffSearch={staffSearch}
                    setStaffSearch={setStaffSearch}
                    assignStaff={assignStaff}
                    onClose={() => setShowStaffPicker(false)}
                />
            )}

            {showTemplatePicker && (
                <TemplatePickerModal
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                />
            )}
        </div>
    );
};

export default ServiciosView;

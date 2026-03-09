'use client'
import React, { useState } from 'react';
import { Calendar, Plus, Search } from 'lucide-react';

// Modular Components
import TarjetaServicio from '../administrador/servicios/TarjetaServicio';
import ModalEditorServicio from '../administrador/servicios/ModalEditorServicio';
import ModalSelectorCancion from '../administrador/servicios/ModalSelectorCancion';
import ModalSelectorPersonal from '../administrador/servicios/ModalSelectorPersonal';
import ModalSelectorPlantilla from '../administrador/servicios/ModalSelectorPlantilla';

import { usarServicios } from '../../ganchos/usarServicios';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Ginterfaztarra Acústica", "Bajo", "Directora Musical", "Batería", "Ginterfaztarra Eléctrica 1", "Ginterfaztarra Eléctrica 2", "Piano", "Teclados", "Ginterfaztarra"] },
    { name: "Medios", roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"] },
    { name: "Voces", roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"] },
    { name: "General", roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"] }
];

const VistaServicios = ({ supabase, enviarNotificacionIndividual, registrarAuditoria }: {
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
    } = usarServicios({ supabase, enviarNotificacionIndividual, registrarAuditoria });

    const [musicianSearch, setMusicianSearch] = useState('');

    const filteredSchedules = schedules.filter((s: any) => {
        if (!musicianSearch) return true;

        const searchLower = musicianSearch.toLowerCase();

        // Check in `equipo_ids`
        if (s.equipo_ids?.some((m: any) => (m.nombre && m.nombre.toLowerCase().includes(searchLower)) || (m.rol && m.rol.toLowerCase().includes(searchLower)))) {
            return true;
        }

        // Check in `plan_detallado` responsables
        if (s.plan_detallado?.some((r: any) => r.responsable && r.responsable.toLowerCase().includes(searchLower))) {
            return true;
        }

        return false;
    });

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

            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Buscar para ver asignar a: Músico, Vocalista, Sonido, Audiovisuales..."
                    value={musicianSearch}
                    onChange={(e) => setMusicianSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A8D500] transition-all font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchedules.map((s: any) => (
                    <TarjetaServicio
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
                <ModalEditorServicio
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
                <ModalSelectorCancion
                    allSongs={allSongs}
                    selectedSongIds={selectedSongIds}
                    songSearch={songSearch}
                    setSongSearch={setSongSearch}
                    toggleSong={toggleSong}
                    onClose={() => setShowSongPicker(false)}
                />
            )}

            {showStaffPicker && (
                <ModalSelectorPersonal
                    allMembers={allMembers}
                    assignedStaff={assignedStaff}
                    staffSearch={staffSearch}
                    setStaffSearch={setStaffSearch}
                    assignStaff={assignStaff}
                    onClose={() => setShowStaffPicker(false)}
                />
            )}

            {showTemplatePicker && (
                <ModalSelectorPlantilla
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                />
            )}
        </div>
    );
};

export default VistaServicios;


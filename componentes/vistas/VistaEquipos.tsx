'use client'
import React, { useState, useEffect } from 'react';
import { Users2, Plus } from 'lucide-react';

// Modular Components
import TarjetaEquipo from '../administrador/equipos/TarjetaEquipo';
import CalendarioEquipo from '../administrador/equipos/CalendarioEquipo';
import ListaCronogramaEquipo from '../administrador/equipos/ListaCronogramaEquipo';
import SeccionBloqueos from '../administrador/equipos/SeccionBloqueos';
import ModalDetallesEquipo from '../administrador/equipos/ModalDetallesEquipo';
import ModalAsignarMiembro from '../administrador/equipos/ModalAsignarMiembro';
import ModalNuevoEquipo from '../administrador/equipos/ModalNuevoEquipo';
import ModalComposicionEquipo from '../administrador/equipos/ModalComposicionEquipo';

import { usarEquipos } from '../../ganchos/usarEquipos';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Ginterfaztarra Acústica", "Bajo", "Directora Musical", "Batería", "Ginterfaztarra Eléctrica 1", "Ginterfaztarra Eléctrica 2", "Piano", "Teclados", "Ginterfaztarra"] },
    { name: "Medios", roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"] },
    { name: "Voces", roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"] },
    { name: "General", roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"] }
];

const EquiposView = ({ supabase, setActiveTab, enviarNotificacionIndividual, registrarAuditoria }: {
    supabase: any,
    setActiveTab?: (t: string) => void,
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>,
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>
}) => {
    const {
        equipos,
        miembros,
        selectedTeam,
        showTeamModal,
        setShowTeamModal,
        showAssignModal,
        setShowAssignModal,
        showModalNuevoEquipo,
        setShowModalNuevoEquipo,
        teamMembers,
        showModalComposicionEquipo,
        setShowModalComposicionEquipo,
        newTeamName,
        setNewTeamName,
        newTeamIcon,
        setNewTeamIcon,
        searchQuery,
        setSearchQuery,
        assignRole,
        setAssignRole,
        blockouts,
        upcomingSchedules,
        currentMonth,
        setCurrentMonth,
        selectedDateSchedule,
        setSelectedDateSchedule,
        handleSelectTeam,
        handleCreateTeam,
        handleAssignMember,
        handleRemoveMember,
        toggleTeamBlock,
        handleDeleteTeam
    } = usarEquipos({ supabase, registrarAuditoria, enviarNotificacionIndividual });

    const filteredMembers = miembros.filter(m =>
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users2 className="text-[#A8D500]" /> EQUIPOS Y VOLUNTARIOS
                    </h2>
                    <p className="text-[rgba(255,255,255,0.7)] text-sm italic">Gestión de servidores y cronogramas de servicio</p>
                </div>
                <button
                    onClick={() => setShowModalNuevoEquipo(true)}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> NUEVO EQUIPO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {equipos.map(team => (
                    <TarjetaEquipo
                        key={team.id}
                        team={team}
                        onSelect={handleSelectTeam}
                        onToggleBlock={toggleTeamBlock}
                        onDelete={handleDeleteTeam}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CalendarioEquipo
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    upcomingSchedules={upcomingSchedules}
                    selectedDateSchedule={selectedDateSchedule}
                    onSelectDate={setSelectedDateSchedule}
                />

                <ListaCronogramaEquipo
                    selectedDateSchedule={selectedDateSchedule}
                    upcomingSchedules={upcomingSchedules}
                    setSelectedDateSchedule={setSelectedDateSchedule}
                    setShowModalComposicionEquipo={setShowModalComposicionEquipo}
                    setActiveTab={setActiveTab}
                    miembros={miembros}
                />
            </div>

            <SeccionBloqueos blockouts={blockouts} />

            {/* Modals */}
            {showTeamModal && (
                <ModalDetallesEquipo
                    selectedTeam={selectedTeam}
                    teamMembers={teamMembers}
                    onClose={() => setShowTeamModal(false)}
                    onAddMember={() => setShowAssignModal(true)}
                    onRemoveMember={handleRemoveMember}
                />
            )}

            {showAssignModal && (
                <ModalAsignarMiembro
                    selectedTeam={selectedTeam}
                    assignRole={assignRole}
                    setAssignRole={setAssignRole}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredMembers={filteredMembers}
                    roleCategories={ROLE_CATEGORIES}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssignMember}
                />
            )}

            {showModalNuevoEquipo && (
                <ModalNuevoEquipo
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    newTeamIcon={newTeamIcon}
                    setNewTeamIcon={setNewTeamIcon}
                    onClose={() => setShowModalNuevoEquipo(false)}
                    onCreate={handleCreateTeam}
                />
            )}

            {showModalComposicionEquipo && (
                <ModalComposicionEquipo
                    selectedDateSchedule={selectedDateSchedule}
                    roleCategories={ROLE_CATEGORIES}
                    miembros={miembros}
                    onClose={() => setShowModalComposicionEquipo(false)}
                />
            )}
        </div>
    );
};

export default EquiposView;


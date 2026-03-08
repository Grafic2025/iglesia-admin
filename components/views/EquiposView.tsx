'use client'
import React, { useState, useEffect } from 'react';
import { Users2, Plus } from 'lucide-react';

// Modular Components
import TeamCard from '../admin/teams/TeamCard';
import TeamCalendar from '../admin/teams/TeamCalendar';
import TeamScheduleList from '../admin/teams/TeamScheduleList';
import BlockoutsSection from '../admin/teams/BlockoutsSection';
import TeamDetailsModal from '../admin/teams/TeamDetailsModal';
import AssignMemberModal from '../admin/teams/AssignMemberModal';
import NewTeamModal from '../admin/teams/NewTeamModal';
import TeamCompositionModal from '../admin/teams/TeamCompositionModal';

import { useEquipos } from '../../hooks/useEquipos';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano", "Teclados", "Guitarra"] },
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
        teams,
        members,
        selectedTeam,
        showTeamModal,
        setShowTeamModal,
        showAssignModal,
        setShowAssignModal,
        showNewTeamModal,
        setShowNewTeamModal,
        teamMembers,
        showTeamCompositionModal,
        setShowTeamCompositionModal,
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
    } = useEquipos({ supabase, registrarAuditoria, enviarNotificacionIndividual });

    const filteredMembers = members.filter(m =>
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users2 className="text-[#A8D500]" /> EQUIPOS Y VOLUNTARIOS
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestión de servidores y cronogramas de servicio</p>
                </div>
                <button
                    onClick={() => setShowNewTeamModal(true)}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> NUEVO EQUIPO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map(team => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        onSelect={handleSelectTeam}
                        onToggleBlock={toggleTeamBlock}
                        onDelete={handleDeleteTeam}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TeamCalendar
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    upcomingSchedules={upcomingSchedules}
                    selectedDateSchedule={selectedDateSchedule}
                    onSelectDate={setSelectedDateSchedule}
                />

                <TeamScheduleList
                    selectedDateSchedule={selectedDateSchedule}
                    upcomingSchedules={upcomingSchedules}
                    setSelectedDateSchedule={setSelectedDateSchedule}
                    setShowTeamCompositionModal={setShowTeamCompositionModal}
                    setActiveTab={setActiveTab}
                    members={members}
                />
            </div>

            <BlockoutsSection blockouts={blockouts} />

            {/* Modals */}
            {showTeamModal && (
                <TeamDetailsModal
                    selectedTeam={selectedTeam}
                    teamMembers={teamMembers}
                    onClose={() => setShowTeamModal(false)}
                    onAddMember={() => setShowAssignModal(true)}
                    onRemoveMember={handleRemoveMember}
                />
            )}

            {showAssignModal && (
                <AssignMemberModal
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

            {showNewTeamModal && (
                <NewTeamModal
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    newTeamIcon={newTeamIcon}
                    setNewTeamIcon={setNewTeamIcon}
                    onClose={() => setShowNewTeamModal(false)}
                    onCreate={handleCreateTeam}
                />
            )}

            {showTeamCompositionModal && (
                <TeamCompositionModal
                    selectedDateSchedule={selectedDateSchedule}
                    roleCategories={ROLE_CATEGORIES}
                    members={members}
                    onClose={() => setShowTeamCompositionModal(false)}
                />
            )}
        </div>
    );
};

export default EquiposView;

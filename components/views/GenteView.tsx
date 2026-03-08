'use client'
import React, { useState, useMemo } from 'react';
import { UserPlus, Phone, Search, ShieldCheck, UserCircle, Archive, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GenteViewProps {
    miembros: any[];
    hoyArg: string;
    fetchMiembros: () => Promise<void>;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

import { MemberCreateModal } from '../members/MemberCreateModal';
import { MemberFilters } from '../members/MemberFilters';
import { MemberListItem } from '../members/MemberListItem';
import { MemberStats } from '../members/MemberStats';
import { useGente } from '../../hooks/useGente';

const PAGE_SIZE = 20;

const GenteView = ({ miembros, hoyArg, fetchMiembros, enviarNotificacionIndividual, registrarAuditoria }: GenteViewProps) => {
    const {
        search, setSearch,
        page, setPage,
        timeFilter, setTimeFilter,
        showArchived, setShowArchived,
        showCreateModal, setShowCreateModal,
        newMember, setNewMember,
        saving,
        toggleServerStatus,
        toggleAdminStatus,
        handleArchive,
        handleRestore,
        handleCreateMember,
        filteredMiembros,
        stats
    } = useGente({ miembros, fetchMiembros, enviarNotificacionIndividual, registrarAuditoria });

    const totalPages = Math.max(1, Math.ceil((filteredMiembros || []).length / PAGE_SIZE));
    const paginatedList = (filteredMiembros || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" /> Base de Datos de Miembros
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestioná toda la gente de la iglesia y sus permisos</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00D9FF] text-black rounded-xl text-sm font-black hover:bg-[#00c4e6] transition-all active:scale-95"
                    >
                        <UserPlus size={16} />
                        NUEVO MIEMBRO
                    </button>
                    <button
                        onClick={() => { setShowArchived(!showArchived); setPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showArchived ? 'bg-[#FFB400] text-black' : 'bg-[#222] text-[#888] border border-[#333] hover:text-white'}`}
                    >
                        <Archive size={14} />
                        {showArchived ? 'VER ACTIVOS' : 'VER ARCHIVADOS'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Section */}
            <MemberStats stats={stats} />

            {/* Search Bar + Filters Section */}
            <MemberFilters
                search={search}
                setSearch={setSearch}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                setPage={setPage}
                filteredCount={filteredMiembros.length}
            />

            <div className="grid grid-cols-1 gap-4">
                {paginatedList.length === 0 && (
                    <div className="bg-[#1E1E1E] p-10 rounded-2xl border border-[#333] text-center">
                        <span className="text-[#555] italic">{showArchived ? 'No hay miembros archivados.' : 'No se encontraron miembros con esos filtros.'}</span>
                    </div>
                )}

                {paginatedList.map((m) => (
                    <MemberListItem
                        key={m.id}
                        member={m}
                        showArchived={showArchived}
                        toggleServerStatus={toggleServerStatus}
                        toggleAdminStatus={toggleAdminStatus}
                        handleArchive={handleArchive}
                        handleRestore={handleRestore}
                    />
                ))}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[#555] text-xs font-bold">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-4 py-2 bg-[#1E1E1E] border border-[#333] text-white text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-[#252525] transition-all"
                        >
                            <ChevronLeft size={14} /> Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-4 py-2 bg-[#1E1E1E] border border-[#333] text-white text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-[#252525] transition-all"
                        >
                            Siguiente <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create Member Modal */}
            <MemberCreateModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                member={newMember}
                setMember={setNewMember}
                onSave={handleCreateMember}
                saving={saving}
            />
        </div>
    );
};

export default GenteView;

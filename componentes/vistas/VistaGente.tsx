'use client'
import React, { useState, useMemo } from 'react';
import { UserPlus, Phone, Search, ShieldCheck, UserCircle, Archive, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { supabase } from '../../libreria/supabase';

interface VistaGenteProps {
    miembros: any[];
    hoyArg: string;
    fetchMiembros: () => Promise<void>;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    loading?: boolean;
}

import { ModalCrearMiembro } from '../miembros/ModalCrearMiembro';
import { FiltrosMiembros } from '../miembros/FiltrosMiembros';
import { ItemListaMiembros } from '../miembros/ItemListaMiembros';
import { EstadisticasMiembros } from '../miembros/EstadisticasMiembros';
import { usarGente } from '../../ganchos/usarGente';

const PAGE_SIZE = 20;

const VistaGente = ({ miembros, hoyArg, fetchMiembros, enviarNotificacionIndividual, registrarAuditoria, loading }: VistaGenteProps) => {
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
    } = usarGente({ miembros, fetchMiembros, enviarNotificacionIndividual, registrarAuditoria });

    const totalPages = Math.max(1, Math.ceil((filteredMiembros || []).length / PAGE_SIZE));
    const paginatedList = (filteredMiembros || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" /> Base de Datos de Miembros
                    </h2>
                    <p className="text-[rgba(255,255,255,0.7)] text-sm italic">Gestioná toda la gente de la iglesia y sus permisos</p>
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showArchived ? 'bg-[#FFB400] text-black' : 'bg-[#222] text-[rgba(255,255,255,0.7)] border border-[#333] hover:text-white'}`}
                    >
                        <Archive size={14} />
                        {showArchived ? 'VER ACTIVOS' : 'VER ARCHIVADOS'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Section */}
            <EstadisticasMiembros stats={stats} />

            {/* Search Bar + Filters Section */}
            <FiltrosMiembros
                search={search}
                setSearch={setSearch}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                setPage={setPage}
                filteredCount={filteredMiembros.length}
            />

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-[#1E1E1E] border border-[#333] rounded-2xl">
                                <div className="w-12 h-12 bg-[#2a2a2a] rounded-full"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-[#2a2a2a] rounded w-1/4"></div>
                                    <div className="h-3 bg-[#2a2a2a] rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {paginatedList.length === 0 && (
                            <div className="bg-[#1E1E1E] p-10 rounded-2xl border border-[#333] text-center">
                                <span className="text-[rgba(255,255,255,0.5)] italic">{showArchived ? 'No hay miembros archivados.' : 'No se encontraron miembros con esos filtros.'}</span>
                            </div>
                        )}

                        {paginatedList.map((m) => (
                            <ItemListaMiembros
                                key={m.id}
                                member={m}
                                showArchived={showArchived}
                                toggleServerStatus={toggleServerStatus}
                                toggleAdminStatus={toggleAdminStatus}
                                handleArchive={handleArchive}
                                handleRestore={handleRestore}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[rgba(255,255,255,0.5)] text-xs font-bold">Página {page} de {totalPages}</span>
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
                            Siginterfazente <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create Member Modal */}
            <ModalCrearMiembro
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

export default VistaGente;


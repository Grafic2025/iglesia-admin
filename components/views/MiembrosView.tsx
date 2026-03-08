'use client'
import React, { useState } from 'react';
import { Send, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Modular Components
import MemberRewards from '../admin/members/MemberRewards';
import MemberProfileModal from '../admin/members/MemberProfileModal';

interface MiembrosViewProps {
    busqueda: string;
    setBusqueda: (v: string) => void;
    filtroHorario: string;
    setFiltroHorario: (v: string) => void;
    datosFiltrados: any[];
    premiosPendientes: any;
    premiosEntregados: any[];
    marcarComoEntregado: (id: string, nivel: number, nombre: string) => void;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje?: string) => Promise<any>;
    hoyArg: string;
    supabase: any;
    fetchAsistencias: () => Promise<void>;
    fetchMiembros: () => Promise<void>;
    horariosDisponibles: any[];
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

import { useMiembrosView } from '../../hooks/useMiembrosView';
import MemberFilters from '../admin/members/MemberFilters';
import MemberTable from '../admin/members/MemberTable';
import MemberPagination from '../admin/members/MemberPagination';

const MiembrosView = ({
    busqueda, setBusqueda, filtroHorario, setFiltroHorario,
    datosFiltrados, premiosPendientes, premiosEntregados,
    marcarComoEntregado, enviarNotificacionIndividual, hoyArg, supabase,
    fetchAsistencias, fetchMiembros, horariosDisponibles, registrarAuditoria
}: MiembrosViewProps) => {

    const {
        page, setPage,
        selectedMember, setSelectedMember,
        handleBusqueda,
        handleFiltro,
        toggleServerStatus,
        totalPages,
        paginatedData
    } = useMiembrosView({
        supabase,
        setBusqueda,
        setFiltroHorario,
        fetchAsistencias,
        fetchMiembros,
        registrarAuditoria,
        datosFiltrados
    });

    return (
        <div className="space-y-6">
            <MemberRewards
                premiosPendientes={premiosPendientes}
                premiosEntregados={premiosEntregados}
                marcarComoEntregado={marcarComoEntregado}
            />

            <MemberFilters
                busqueda={busqueda}
                handleBusqueda={handleBusqueda}
                filtroHorario={filtroHorario}
                handleFiltro={handleFiltro}
                horariosDisponibles={horariosDisponibles}
                registrosCount={datosFiltrados.length}
            />

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <MemberTable
                    paginatedData={paginatedData}
                    hoyArg={hoyArg}
                    setSelectedMember={setSelectedMember}
                    enviarNotificacionIndividual={enviarNotificacionIndividual}
                    toggleServerStatus={toggleServerStatus}
                />

                <MemberPagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    registrosCount={datosFiltrados.length}
                />
            </div>

            <MemberProfileModal
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
};

export default MiembrosView;

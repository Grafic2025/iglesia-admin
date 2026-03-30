'use client'
import React, { useState } from 'react';
import { Send, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Modular Components
import PremiosMiembros from '../administrador/miembros/PremiosMiembros';
import ModalPerfilMiembro from '../administrador/miembros/ModalPerfilMiembro';

interface VistaMiembrosProps {
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
    loading?: boolean;
}

import { usarVistaMiembros } from '../../ganchos/usarVistaMiembros';
import FiltrosMiembros from '../administrador/miembros/FiltrosMiembros';
import TablaMiembros from '../administrador/miembros/TablaMiembros';
import PaginacionMiembros from '../administrador/miembros/PaginacionMiembros';
import { SeccionEsqueleto, FilaTablaEsqueleto } from '../diseno/CargandoEsqueleto';

const VistaMiembros = ({
    busqueda, setBusqueda, filtroHorario, setFiltroHorario,
    datosFiltrados, premiosPendientes, premiosEntregados,
    marcarComoEntregado, enviarNotificacionIndividual, hoyArg, supabase,
    fetchAsistencias, fetchMiembros, horariosDisponibles, registrarAuditoria, loading
}: VistaMiembrosProps) => {

    const {
        page, setPage,
        selectedMember, setSelectedMember,
        handleBusqueda,
        handleFiltro,
        toggleServerStatus,
        resetearPin,
        totalPages,
        paginatedData
    } = usarVistaMiembros({
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
            <PremiosMiembros
                premiosPendientes={premiosPendientes}
                premiosEntregados={premiosEntregados}
                marcarComoEntregado={marcarComoEntregado}
            />

            <FiltrosMiembros
                busqueda={busqueda}
                handleBusqueda={handleBusqueda}
                filtroHorario={filtroHorario}
                handleFiltro={handleFiltro}
                horariosDisponibles={horariosDisponibles}
                registrosCount={datosFiltrados.length}
            />

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <tbody className="divide-y divide-white/5">
                            {[...Array(8)].map((_, i) => <FilaTablaEsqueleto key={i} />)}
                        </tbody>
                    </table>
                ) : (
                    <TablaMiembros
                        paginatedData={paginatedData}
                        hoyArg={hoyArg}
                        setSelectedMember={setSelectedMember}
                        enviarNotificacionIndividual={enviarNotificacionIndividual}
                        toggleServerStatus={toggleServerStatus}
                    />
                )}

                {!loading && (
                    <PaginacionMiembros
                        page={page}
                        totalPages={totalPages}
                        setPage={setPage}
                        registrosCount={datosFiltrados.length}
                    />
                )}
            </div>

            <ModalPerfilMiembro
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
                resetearPin={resetearPin}
            />
        </div >
    );
};

export default VistaMiembros;


'use client'
import React, { useState, useMemo } from 'react';
import { History, Shield, User, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface VistaAuditoriaProps {
    logs: any[];
}

const LOGS_PER_PAGE = 25;

import { usarAuditoria } from '../../ganchos/usarAuditoria';

const VistaAuditoria = ({ logs }: VistaAuditoriaProps) => {
    const {
        search, setSearch,
        actionFilter, setActionFilter,
        page, setPage,
        actionTypes,
        filteredLogs,
        totalPages,
        paginatedLogs
    } = usarAuditoria({ logs });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <History className="text-[#A8D500]" /> AUDITORÍA DE ACCIONES
                    </h2>
                    <p className="text-[rgba(255,255,255,0.7)] text-sm italic">Registro de seguridad y trazabilidad de cambios en el sistema</p>
                </div>
                <span className="text-[10px] bg-[#252525] text-[rgba(255,255,255,0.7)] px-3 py-1.5 rounded-full font-bold border border-[#333]">
                    {filteredLogs.length} de {logs.length} registros
                </span>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)]" />
                    <input
                        type="text"
                        placeholder="Buscar por acción, detalle, administrador o fecha..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#A8D500] transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)]" />
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="bg-[#1E1E1E] border border-[#333] rounded-2xl pl-9 pr-6 py-3 text-white text-sm outline-none focus:border-[#A8D500] appearance-none min-w-[200px]"
                    >
                        {actionTypes.map(type => (
                            <option key={type} value={type}>{type === 'Todas' ? '📋 Todas las acciones' : type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-3xl border border-[#333] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-[#151515] text-[rgba(255,255,255,0.5)] font-black uppercase tracking-widest border-b border-[#333]">
                            <th className="p-5">Fecha y Hora</th>
                            <th className="p-5">Usuario/Admin</th>
                            <th className="p-5">Acción</th>
                            <th className="p-5">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {paginatedLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-[rgba(255,255,255,0.5)] italic">
                                    {search || actionFilter !== 'Todas'
                                        ? 'No se encontraron registros con esos filtros.'
                                        : 'No hay registros de auditoría aún.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#252525] transition-all group">
                                    <td className="p-5 text-white font-medium">
                                        {new Date(log.created_at).toLocaleString('es-AR')}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-[#A8D50015] rounded-lg">
                                                <User size={14} className="text-[#A8D500]" />
                                            </div>
                                            <span className="text-[rgba(255,255,255,0.7)] font-bold">{log.administrador_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.accion.includes('ELIMINAR') ? 'bg-red-500/10 text-red-500' :
                                            log.accion.includes('EDITAR') ? 'bg-orange-500/10 text-orange-500' :
                                                log.accion.includes('CREAR') ? 'bg-green-500/10 text-green-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {log.accion}
                                        </span>
                                    </td>
                                    <td className="p-5 text-[rgba(255,255,255,0.7)] text-xs max-w-sm">
                                        {log.detalle}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-[#252525] bg-[#151515]">
                        <span className="text-[rgba(255,255,255,0.5)] text-xs font-bold">Página {page} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                <ChevronLeft size={14} /> Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                Siginterfazente <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
                <Shield className="text-yellow-500 shrink-0" size={20} />
                <p className="text-yellow-200/50 text-[10px] leading-relaxed uppercase font-bold tracking-wider">
                    ESTE REGISTRO ES INMUTABLE Y SIRVE PARA GARANTIZAR QUE TODAS LAS MODIFICACIONES TENGAN UN RESPONSABLE ASIGNADO.
                </p>
            </div>
        </div>
    );
};

export default VistaAuditoria;


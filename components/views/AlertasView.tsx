'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Search } from 'lucide-react';

// Modular Components
import AlertCard from '../admin/alerts/AlertCard';
import AlertStats from '../admin/alerts/AlertStats';

interface AlertasViewProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

import { useAlertas } from '../../hooks/useAlertas';

const AlertasView = ({ supabase, registrarAuditoria }: AlertasViewProps) => {
    const {
        loading,
        search, setSearch,
        alertas,
        handleContact
    } = useAlertas({ supabase, registrarAuditoria });

    if (loading) return <div className="text-white p-10 text-center">Calculando informes de retención...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> ALERTAS PASTORALES
                    </h2>
                    <p className="text-[#888] text-sm italic">Miembros que no han asistido en los últimos 30 días</p>
                </div>
            </div>

            <AlertStats count={alertas.length} />

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                <input
                    type="text"
                    placeholder="Buscar entre los miembros en alerta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertas.length === 0 && (
                    <div className="col-span-2 text-center py-20 bg-[#1E1E1E] rounded-3xl border border-[#333]">
                        <p className="text-[#555] italic">¡Excelente! No hay miembros con ausencias prolongadas detectadas.</p>
                    </div>
                )}
                {alertas.map(m => (
                    <AlertCard key={m.id} m={m} onContact={handleContact} />
                ))}
            </div>
        </div>
    );
};

export default AlertasView;

'use client'
import React, { useState, useMemo } from 'react';
import { LayoutDashboard } from 'lucide-react';
import StatCard from '../StatCard';

// Modular Components
import AttendanceChart from '../admin/dashboard/AttendanceChart';
import GrowthChart from '../admin/dashboard/GrowthChart';
import DemographicsChart from '../admin/dashboard/DemographicsChart';
import ServiceQuickInfo from '../admin/dashboard/ServiceQuickInfo';
import ActivitySummary from '../admin/dashboard/ActivitySummary';

interface DashboardViewProps {
    asistencias: any[];
    asistencias7dias: any[];
    oracionesActivas: number;
    nuevosMes: number;
    crecimientoAnual: any[];
    horariosReunion: any[]; // Renombrado de horariosDisponibles
    miembros: any[];       // Hecho obligatorio
    bautismos: any[];
    ayuda: any[];
}

import { useDashboard } from '../../hooks/useDashboard';

const DashboardView = ({
    asistencias,
    asistencias7dias,
    oracionesActivas,
    nuevosMes,
    crecimientoAnual,
    horariosReunion,
    miembros,
    bautismos,
    ayuda
}: DashboardViewProps) => {
    const {
        growthRange,
        setGrowthRange,
        demographicData,
        filteredGrowth,
        todayCount,
        todayTrend,
        lastServiceDate,
        nextSundayString,
        GROWTH_RANGES,
        COLORS
    } = useDashboard({ asistencias, asistencias7dias, crecimientoAnual, miembros });

    return (
        <div className="space-y-6">
            <ActivitySummary
                oracionesActivas={oracionesActivas}
                nuevosMes={nuevosMes}
                asistenciaHoy={todayCount}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard
                    label="Total Hoy"
                    value={todayCount}
                    color="#A8D500"
                    isActive={todayCount > 0}
                    icon={<LayoutDashboard size={18} />}
                    trend={todayTrend}
                />
                {(horariosReunion || []).map(h => (
                    <StatCard
                        key={h}
                        label={`${h} HS`}
                        value={(asistencias || []).filter(a => a.horario_reunion === h).length}
                        color="#fff"
                        isActive={(asistencias || []).filter(a => a.horario_reunion === h).length > 0}
                    />
                ))}
                <StatCard
                    label="Extra"
                    value={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length}
                    color="#FFB400"
                    isActive={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length > 0}
                />
                <StatCard label="Oraciones" value={oracionesActivas} color="#9333EA" isActive={oracionesActivas > 0} icon="🙏" />
                <StatCard label="Bautismos" value={bautismos?.length || 0} color="#3B82F6" isActive={(bautismos?.length || 0) > 0} icon="💧" />
                <StatCard label="Acompañamiento" value={ayuda?.length || 0} color="#EF4444" isActive={(ayuda?.length || 0) > 0} icon="🤝" />
                <StatCard label="Nuevos Mes" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="📈" />
            </div>

            <ServiceQuickInfo
                lastServiceDate={lastServiceDate}
                nextSundayString={nextSundayString}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart data={asistencias7dias} />

                <GrowthChart
                    data={filteredGrowth}
                    growthRange={growthRange}
                    setGrowthRange={setGrowthRange}
                    GROWTH_RANGES={GROWTH_RANGES}
                />
            </div>

            <DemographicsChart
                data={demographicData.ageChart}
                COLORS={COLORS}
            />
        </div>
    );
};

export default DashboardView;

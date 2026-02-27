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
    horariosDisponibles: any[];
    miembros?: any[];
}

const GROWTH_RANGES = [
    { key: '3M', label: '3 meses', months: 3 },
    { key: '6M', label: '6 meses', months: 6 },
    { key: '12M', label: '12 meses', months: 12 },
];

const COLORS = ['#A8D500', '#00D9FF', '#FFB400', '#9333EA', '#FF4444', '#3B82F6'];

const DashboardView = ({ asistencias, asistencias7dias, oracionesActivas, nuevosMes, crecimientoAnual, horariosDisponibles, miembros = [] }: DashboardViewProps) => {
    const [growthRange, setGrowthRange] = useState('12M');

    // Calculate Demographic Data
    const demographicData = useMemo(() => {
        const ages = { 'Niños (<13)': 0, 'Adolescentes (13-17)': 0, 'Jóvenes (18-29)': 0, 'Adultos (30-59)': 0, 'Mayores (60+)': 0, 'S/D': 0 };

        miembros.forEach(m => {
            if (m.fecha_nacimiento) {
                const age = new Date().getFullYear() - new Date(m.fecha_nacimiento).getFullYear();
                if (age < 13) ages['Niños (<13)']++;
                else if (age < 18) ages['Adolescentes (13-17)']++;
                else if (age < 30) ages['Jóvenes (18-29)']++;
                else if (age < 60) ages['Adultos (30-59)']++;
                else ages['Mayores (60+)']++;
            } else {
                ages['S/D']++;
            }
        });

        const ageChart = Object.entries(ages).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
        return { ageChart };
    }, [miembros]);

    // Filter growth data based on selected range
    const filteredGrowth = useMemo(() => {
        const rangeConfig = GROWTH_RANGES.find(r => r.key === growthRange);
        if (!rangeConfig || !crecimientoAnual.length) return crecimientoAnual;
        return crecimientoAnual.slice(-rangeConfig.months);
    }, [crecimientoAnual, growthRange]);

    // Calculate trend for "Total Hoy"
    const todayCount = (asistencias || []).length;
    const yesterdayCount = (asistencias7dias || []).length >= 2 ? asistencias7dias[asistencias7dias.length - 2]?.total || 0 : 0;
    const todayTrend = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : null;

    // Quick service info
    const lastServiceDate = (asistencias7dias || []).filter(d => d.total > 0).slice(-1)[0];
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));

    return (
        <div className="space-y-6">
            <ServiceQuickInfo
                lastServiceDate={lastServiceDate}
                nextSunday={nextSunday}
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
                {(horariosDisponibles || []).map(h => (
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
                <StatCard label="Nuevos Mes" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="📈" />
            </div>
        </div>
    );
};

export default DashboardView;

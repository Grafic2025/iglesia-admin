import { useState, useMemo, useEffect } from 'react';

const GROWTH_RANGES = [
    { key: '3M', label: '3 meses', months: 3 },
    { key: '6M', label: '6 meses', months: 6 },
    { key: '12M', label: '12 meses', months: 12 },
];

const COLORS = ['#A8D500', '#00D9FF', '#FFB400', '#9333EA', '#FF4444', '#3B82F6'];

interface UseDashboardProps {
    asistencias: any[];
    asistencias7dias: any[];
    crecimientoAnual: any[];
    miembros: any[];
}

export function useDashboard({
    asistencias,
    asistencias7dias,
    crecimientoAnual,
    miembros = []
}: UseDashboardProps) {
    const [growthRange, setGrowthRange] = useState('12M');

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

    const filteredGrowth = useMemo(() => {
        const rangeConfig = GROWTH_RANGES.find(r => r.key === growthRange);
        if (!rangeConfig || !crecimientoAnual.length) return crecimientoAnual;
        return crecimientoAnual.slice(-rangeConfig.months);
    }, [crecimientoAnual, growthRange]);

    const todayCount = (asistencias || []).length;
    const yesterdayCount = (asistencias7dias || []).length >= 2 ? asistencias7dias[asistencias7dias.length - 2]?.total || 0 : 0;
    const todayTrend = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : null;

    const lastServiceDate = (asistencias7dias || []).filter(d => d.total > 0).slice(-1)[0];
    const [nextSundayString, setNextSundayString] = useState('');

    useEffect(() => {
        const nextSunday = new Date();
        nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
        setNextSundayString(nextSunday.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, []);

    return {
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
    };
}

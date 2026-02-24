'use client'
import React, { useState, useMemo } from 'react';
import {
    BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line, LabelList, Cell
} from 'recharts';
import { LucideBarChart, LucideLineChart, LayoutDashboard, CalendarDays, Clock, Users2, MapPin } from 'lucide-react';
import StatCard from '../StatCard';

interface DashboardViewProps {
    asistencias: any[];
    asistencias7dias: any[];
    oracionesActivas: number;
    nuevosMes: number;
    crecimientoAnual: any[];
    horariosDisponibles: any[];
    miembros?: any[]; // Added for demographics
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
        const zones: Record<string, number> = {};

        miembros.forEach(m => {
            // Age Group
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

            // Zones
            const z = m.zona || 'Sin especificar';
            zones[z] = (zones[z] || 0) + 1;
        });

        const ageChart = Object.entries(ages).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
        const zoneChart = Object.entries(zones).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

        return { ageChart, zoneChart };
    }, [miembros]);

    // Filter growth data based on selected range
    const filteredGrowth = useMemo(() => {
        const rangeConfig = GROWTH_RANGES.find(r => r.key === growthRange);
        if (!rangeConfig || !crecimientoAnual.length) return crecimientoAnual;
        return crecimientoAnual.slice(-rangeConfig.months);
    }, [crecimientoAnual, growthRange]);

    // Calculate trend for "Total Hoy" comparing yesterday to today
    const todayCount = (asistencias || []).length;
    const yesterdayCount = (asistencias7dias || []).length >= 2 ? asistencias7dias[asistencias7dias.length - 2]?.total || 0 : 0;
    const todayTrend = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : null;

    // Quick service info from attendance
    const lastServiceDate = (asistencias7dias || []).filter(d => d.total > 0).slice(-1)[0];
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));

    return (
        <div className="space-y-6">
            {/* Service Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                    <div className="p-3 bg-[#A8D50015] rounded-xl">
                        <CalendarDays size={24} className="text-[#A8D500]" />
                    </div>
                    <div>
                        <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest">Último Servicio con Asistencia</p>
                        {lastServiceDate ? (
                            <p className="text-white font-bold text-lg">
                                {lastServiceDate.dia} — <span className="text-[#A8D500]">{lastServiceDate.total} personas</span>
                            </p>
                        ) : (
                            <p className="text-[#555] text-sm italic">Sin datos recientes</p>
                        )}
                    </div>
                </div>
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                    <div className="p-3 bg-[#00D9FF15] rounded-xl">
                        <Clock size={24} className="text-[#00D9FF]" />
                    </div>
                    <div>
                        <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest">Próximo Domingo</p>
                        <p className="text-white font-bold text-lg">
                            {nextSunday.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <LucideBarChart size={18} className="text-[#A8D500]" /> Tendencia: Últimos 7 Días
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineBarChart data={asistencias7dias}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="dia" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }}
                                    itemStyle={{ color: '#A8D500' }}
                                />
                                <Bar dataKey="total" fill="#A8D500" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="total" position="top" fill="#A8D500" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </ReLineBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white text-sm font-medium flex items-center gap-2">
                            <LucideLineChart size={18} className="text-[#00D9FF]" /> Crecimiento Acumulado
                        </h3>
                        <div className="flex gap-1 bg-[#111] rounded-xl p-1">
                            {GROWTH_RANGES.map(r => (
                                <button
                                    key={r.key}
                                    onClick={() => setGrowthRange(r.key)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${growthRange === r.key ? 'bg-[#00D9FF] text-black' : 'text-[#555] hover:text-white'}`}
                                >
                                    {r.key}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineChart data={filteredGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }}
                                    itemStyle={{ color: '#00D9FF' }}
                                />
                                <Line type="monotone" dataKey="c" stroke="#00D9FF" strokeWidth={3} dot={{ fill: '#00D9FF', r: 6 }} activeDot={{ r: 8 }}>
                                    <LabelList dataKey="c" position="top" fill="#00D9FF" fontSize={10} fontWeight="bold" />
                                </Line>
                                <Line type="monotone" dataKey="meta" stroke="#333" strokeDasharray="5 5" />
                            </ReLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Demographics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <Users2 size={18} className="text-[#FFB400]" /> Edades de la Congregación
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineBarChart data={demographicData.ageChart} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" stroke="#888" fontSize={10} />
                                <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={120} />
                                <Tooltip contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {demographicData.ageChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="right" fill="#fff" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </ReLineBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <MapPin size={18} className="text-[#9333EA]" /> Distribución por Zonas
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineBarChart data={demographicData.zoneChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }} />
                                <Bar dataKey="value" fill="#9333EA" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="value" position="top" fill="#9333EA" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </ReLineBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <Users2 size={18} className="text-[#A8D500]" /> Resumen de Actividad
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-[#111] rounded-2xl border border-[#222] text-center">
                            <p className="text-[#888] text-[10px] font-black uppercase tracking-widest mb-1">Pedidos de Oración</p>
                            <p className="text-3xl font-black text-[#9333EA]">{oracionesActivas}</p>
                        </div>
                        <div className="p-4 bg-[#111] rounded-2xl border border-[#222] text-center">
                            <p className="text-[#888] text-[10px] font-black uppercase tracking-widest mb-1">Nuevos este Mes</p>
                            <p className="text-3xl font-black text-[#00D9FF]">{nuevosMes}</p>
                        </div>
                        <div className="p-4 bg-[#111] rounded-2xl border border-[#222] text-center">
                            <p className="text-[#888] text-[10px] font-black uppercase tracking-widest mb-1">Asistencia Hoy</p>
                            <p className="text-3xl font-black text-[#A8D500]">{(asistencias || []).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard label="Total Hoy" value={(asistencias || []).length} color="#A8D500" isActive={(asistencias || []).length > 0} icon={<LayoutDashboard size={18} />} trend={todayTrend} />
                {(horariosDisponibles || []).map(h => (
                    <StatCard key={h} label={`${h} HS`} value={(asistencias || []).filter(a => a.horario_reunion === h).length} color="#fff" isActive={(asistencias || []).filter(a => a.horario_reunion === h).length > 0} />
                ))}
                <StatCard label="Extra" value={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length} color="#FFB400" isActive={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length > 0} />
                <StatCard label="Oraciones" value={oracionesActivas} color="#9333EA" isActive={oracionesActivas > 0} icon="🙏" />
                <StatCard label="Nuevos Mes" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="📈" />
            </div>
        </div>
    );
};

export default DashboardView;

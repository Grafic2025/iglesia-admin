'use client'
import React from 'react';
import {
    BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line
} from 'recharts';
import { LucideBarChart, LucideLineChart, LayoutDashboard } from 'lucide-react';
import StatCard from '../StatCard';

interface DashboardViewProps {
    asistencias: any[];
    oracionesActivas: number;
    nuevosMes: number;
    crecimientoAnual: any[];
    horariosDisponibles: any[];
    retencion: { total: number; activos: number; porcentaje: number };
    heatmap: any[];
}

const DashboardView = ({ asistencias, oracionesActivas, nuevosMes, crecimientoAnual, horariosDisponibles, retencion, heatmap }: DashboardViewProps) => {
    return (
        <div className="space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <LucideBarChart size={18} className="text-[#A8D500]" /> Tendencia: Últimos 7 Días
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineBarChart data={asistencias.slice(0, 7).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="fecha" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }}
                                    itemStyle={{ color: '#A8D500' }}
                                />
                                <Bar dataKey="racha" fill="#A8D500" radius={[4, 4, 0, 0]} />
                            </ReLineBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <LucideLineChart size={18} className="text-[#00D9FF]" /> Crecimiento Acumulado (Anual)
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineChart data={crecimientoAnual}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }}
                                    itemStyle={{ color: '#00D9FF' }}
                                />
                                <Line type="monotone" dataKey="c" stroke="#00D9FF" strokeWidth={3} dot={{ fill: '#00D9FF', r: 6 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="meta" stroke="#333" strokeDasharray="5 5" />
                            </ReLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <LucideBarChart size={18} className="text-[#FFB400]" /> Mapa de Calor: Distribución (30 días)
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReLineBarChart data={heatmap}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="label" stroke="#888" fontSize={10} />
                                <YAxis stroke="#888" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }}
                                    itemStyle={{ color: '#FFB400' }}
                                />
                                <Bar dataKey="value" fill="#FFB400" radius={[4, 4, 0, 0]} />
                            </ReLineBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] flex flex-col justify-center">
                    <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                        <LayoutDashboard size={18} className="text-[#A8D500]" /> Tasa de Retención
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="transparent" stroke="#222" strokeWidth="12" />
                                <circle
                                    cx="80" cy="80" r="70" fill="transparent" stroke="#A8D500" strokeWidth="12"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * retencion.porcentaje) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">{retencion.porcentaje}%</span>
                                <span className="text-[10px] text-[#555] font-black uppercase">Fideliad</span>
                            </div>
                        </div>
                        <p className="text-[#888] text-xs text-center max-w-[200px]">
                            <span className="text-white font-bold">{retencion.activos}</span> de <span className="text-white font-bold">{retencion.total}</span> miembros asistieron en los últimos 30 días.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard label="Total Hoy" value={asistencias.length} color="#A8D500" isActive={asistencias.length > 0} icon={<LayoutDashboard size={18} />} />
                {horariosDisponibles.map(h => (
                    <StatCard key={h} label={`${h} HS`} value={asistencias.filter(a => a.horario_reunion === h).length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === h).length > 0} />
                ))}
                <StatCard label="Extra" value={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length} color="#FFB400" isActive={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length > 0} />
                <StatCard label="Oraciones" value={oracionesActivas} color="#9333EA" isActive={oracionesActivas > 0} icon="🙏" />
                <StatCard label="Nuevos Mes" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="📈" />
                <StatCard label="Retención" value={`${retencion.porcentaje}%`} color="#A8D500" isActive={true} icon="🎯" />
            </div>
        </div>
    );
};

export default DashboardView;

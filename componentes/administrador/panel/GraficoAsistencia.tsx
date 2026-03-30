import React from 'react';
import { BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { LucideBarChart } from 'lucide-react';

interface GraficoAsistenciaProps {
    data: any[];
    onBarClick?: (date: string) => void;
}

const GraficoAsistencia: React.FC<GraficoAsistenciaProps> = ({ data, onBarClick }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                <LucideBarChart size={18} className="text-[var(--accent)]" /> Tendencia: Últimos 7 Días
            </h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                    <ReLineBarChart 
                        data={data}
                        onClick={(e: any) => {
                            if (e && e.activePayload && onBarClick) {
                                onBarClick(e.activePayload[0].payload.fecha);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="dia" 
                            stroke="rgba(255,255,255,0.4)" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis 
                            stroke="rgba(255,255,255,0.4)" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ 
                                background: 'rgba(20,20,20,0.9)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                        />
                        <Bar 
                            dataKey="total" 
                            fill="var(--accent)" 
                            radius={[6, 6, 0, 0]}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <LabelList dataKey="total" position="top" fill="var(--accent)" fontSize={11} fontWeight="black" offset={10} />
                        </Bar>
                    </ReLineBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GraficoAsistencia;


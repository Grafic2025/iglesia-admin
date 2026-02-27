import React from 'react';
import { BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { LucideBarChart } from 'lucide-react';

interface AttendanceChartProps {
    data: any[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                <LucideBarChart size={18} className="text-[#A8D500]" /> Tendencia: Últimos 7 Días
            </h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ReLineBarChart data={data}>
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
    );
};

export default AttendanceChart;

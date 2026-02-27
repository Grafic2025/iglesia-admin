import React from 'react';
import { BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Users2 } from 'lucide-react';

interface DemographicsChartProps {
    data: any[];
    COLORS: string[];
}

const DemographicsChart: React.FC<DemographicsChartProps> = ({ data, COLORS }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-white text-sm font-medium mb-6 flex items-center gap-2">
                <Users2 size={18} className="text-[#FFB400]" /> Edades de la Congregación
            </h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ReLineBarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#888" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={120} />
                        <Tooltip contentStyle={{ background: '#222', border: '1px solid #444', borderRadius: '12px' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="value" position="right" fill="#fff" fontSize={10} fontWeight="bold" />
                        </Bar>
                    </ReLineBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DemographicsChart;

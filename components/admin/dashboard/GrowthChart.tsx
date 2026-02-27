import React from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { LucideLineChart } from 'lucide-react';

interface GrowthChartProps {
    data: any[];
    growthRange: string;
    setGrowthRange: (range: string) => void;
    GROWTH_RANGES: any[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data, growthRange, setGrowthRange, GROWTH_RANGES }) => {
    return (
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
                    <ReLineChart data={data}>
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
    );
};

export default GrowthChart;

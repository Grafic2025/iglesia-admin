'use client'
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    trend?: number | null; // percentage change vs previous period
}

const StatCard = ({ label, value, color = '#A8D500', icon, isActive, trend }: StatCardProps) => {
    const trendColor = trend && trend > 0 ? '#22c55e' : trend && trend < 0 ? '#ef4444' : '#888';
    const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;

    return (
        <div className={`p-4 rounded-2xl bg-[#1E1E1E] border border-[#333] transition-all duration-300 ${isActive ? 'shadow-[0_4px_20px_-5px_rgba(168,213,0,0.1)]' : ''}`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-[#888] text-xs font-semibold uppercase tracking-wider">{label}</span>
                {icon && <div style={{ color }}>{typeof icon === 'string' ? <span className="text-base">{icon}</span> : icon}</div>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: isActive ? color : '#fff' }}>
                    {value}
                </span>
                {isActive && !trend && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>}
            </div>
            {trend !== undefined && trend !== null && (
                <div className="flex items-center gap-1 mt-2">
                    <TrendIcon size={12} style={{ color: trendColor }} />
                    <span className="text-[10px] font-bold" style={{ color: trendColor }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="text-[10px] text-[#555]">vs ayer</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;

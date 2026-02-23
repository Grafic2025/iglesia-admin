'use client'
import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    isActive?: boolean;
}

const StatCard = ({ label, value, color = '#A8D500', icon, isActive }: StatCardProps) => {
    return (
        <div className={`p-4 rounded-2xl bg-[#1E1E1E] border border-[#333] transition-all duration-300 ${isActive ? 'shadow-[0_4px_20px_-5px_rgba(168,213,0,0.1)]' : ''}`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-[#888] text-xs font-semibold uppercase tracking-wider">{label}</span>
                {icon && <div style={{ color }}>{icon}</div>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: isActive ? color : '#fff' }}>
                    {value}
                </span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>}
            </div>
        </div>
    );
};

export default StatCard;

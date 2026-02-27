import React from 'react';
import { Users2 } from 'lucide-react';

interface ActivitySummaryProps {
    oracionesActivas: number;
    nuevosMes: number;
    asistenciaHoy: number;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ oracionesActivas, nuevosMes, asistenciaHoy }) => {
    return (
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
                        <p className="text-3xl font-black text-[#A8D500]">{asistenciaHoy}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivitySummary;

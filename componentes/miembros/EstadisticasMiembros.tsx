import React from 'react';

interface EstadisticasMiembrosProps {
    stats: {
        totalActivos: number;
        totalServidores: number;
        nuevosHoy: number;
        nuevosSemana: number;
    };
}

export const EstadisticasMiembros = ({ stats }: EstadisticasMiembrosProps) => {
    const { totalActivos, totalServidores, nuevosHoy, nuevosSemana } = stats;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                <p className="text-2xl font-bold text-white">{totalActivos}</p>
                <p className="text-[rgba(255,255,255,0.5)] text-[10px] font-bold uppercase mt-1">Miembros Activos</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                <p className="text-2xl font-bold text-accent">{totalServidores}</p>
                <p className="text-[rgba(255,255,255,0.5)] text-[10px] font-bold uppercase mt-1">Servidores</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                <p className="text-2xl font-bold text-[#00D9FF]">{nuevosHoy}</p>
                <p className="text-[rgba(255,255,255,0.5)] text-[10px] font-bold uppercase mt-1">Nuevos Hoy</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                <p className="text-2xl font-bold text-[#FFB400]">{nuevosSemana}</p>
                <p className="text-[rgba(255,255,255,0.5)] text-[10px] font-bold uppercase mt-1">Nuevos Semana</p>
            </div>
        </div>
    );
};


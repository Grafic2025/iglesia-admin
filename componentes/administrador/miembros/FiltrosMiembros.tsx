import React from 'react';

const FiltrosMiembros = ({
    busqueda,
    handleBusqueda,
    filtroHorario,
    handleFiltro,
    horariosDisponibles,
    registrosCount
}: any) => {
    return (
        <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden mb-4">
            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <input
                    placeholder="🔍 Buscar por nombre o apellido..."
                    value={busqueda}
                    onChange={(e) => handleBusqueda(e.target.value)}
                    className="flex-1 bg-white/5 text-white px-5 py-3 rounded-2xl border border-white/10 outline-none focus:border-[var(--accent)]/50 transition-all font-bold placeholder:text-white/20"
                />
                <select
                    value={filtroHorario}
                    onChange={(e) => handleFiltro(e.target.value)}
                    className="bg-[var(--accent)] text-black font-black px-6 py-3 rounded-2xl outline-none cursor-pointer shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-transform"
                >
                    <option value="Todas">Todas las Reuniones</option>
                    {horariosDisponibles.map((h: string) => (
                        <option key={h} value={h}>{h} HS</option>
                    ))}
                    <option value="Extraoficial">Extraoficiales</option>
                </select>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-white/5 px-4 py-3 rounded-2xl border border-white/5">{registrosCount} registros</span>
            </div>
        </div>
    );
};

export default FiltrosMiembros;


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
                    className="flex-1 bg-[#252525] text-white px-4 py-2.5 rounded-xl border border-[#444] outline-none focus:border-[#A8D500] transition-all"
                />
                <select
                    value={filtroHorario}
                    onChange={(e) => handleFiltro(e.target.value)}
                    className="bg-[#A8D500] text-black font-bold px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                >
                    <option value="Todas">Todas las Reuniones</option>
                    {horariosDisponibles.map((h: string) => (
                        <option key={h} value={h}>{h} HS</option>
                    ))}
                    <option value="Extraoficial">Extraoficiales</option>
                </select>
                <span className="text-[#555] text-xs font-bold whitespace-nowrap">{registrosCount} registros</span>
            </div>
        </div>
    );
};

export default FiltrosMiembros;


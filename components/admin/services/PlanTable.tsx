import React from 'react';
import { X } from 'lucide-react';

interface PlanTableProps {
    detailedRows: any[];
    setDetailedRows: (rows: any[]) => void;
    addDetailedRow: () => void;
}

const PlanTable: React.FC<PlanTableProps> = ({ detailedRows, setDetailedRows, addDetailedRow }) => {
    return (
        <div>
            <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                Minuto a Minuto (Detailed Plan)
            </h4>
            <div className="bg-[#1A1A1A] rounded-2xl border border-[#333] overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-[#222] text-[#555] font-black uppercase tracking-widest border-b border-[#333]">
                            <th className="p-3 text-left w-20">Tiempo</th>
                            <th className="p-3 text-left">Actividad</th>
                            <th className="p-3 text-left">Resp.</th>
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {detailedRows.map(row => (
                            <tr key={row.id} className="group">
                                <td className="p-2">
                                    <input
                                        value={row.tiempo}
                                        onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, tiempo: e.target.value } : r))}
                                        className="w-full bg-transparent text-white outline-none"
                                        placeholder="10m"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        value={row.actividad}
                                        onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, actividad: e.target.value } : r))}
                                        className="w-full bg-transparent text-white outline-none"
                                        placeholder="Descripción..."
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        value={row.responsable}
                                        onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, responsable: e.target.value } : r))}
                                        className="w-full bg-transparent text-white outline-none"
                                        placeholder="Banda"
                                    />
                                </td>
                                <td className="p-2 text-right">
                                    <button
                                        onClick={() => setDetailedRows(detailedRows.filter(r => r.id !== row.id))}
                                        className="text-red-900 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={addDetailedRow}
                    className="w-full p-3 text-[#555] hover:text-[#A8D500] hover:bg-[#A8D50010] transition-all text-[10px] font-bold uppercase"
                >
                    + Agregar Momento
                </button>
            </div>
        </div>
    );
};

export default PlanTable;

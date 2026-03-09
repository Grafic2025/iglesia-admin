import React from 'react';
import { Search } from 'lucide-react';

interface FiltrosMiembrosProps {
    search: string;
    setSearch: (val: string) => void;
    timeFilter: string;
    setTimeFilter: (val: string) => void;
    setPage: (val: number) => void;
    filteredCount: number;
}

export const FiltrosMiembros = ({
    search,
    setSearch,
    timeFilter,
    setTimeFilter,
    setPage,
    filteredCount
}: FiltrosMiembrosProps) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00D9FF] transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-[#1E1E1E] rounded-2xl p-1 border border-[#333]">
                    {['Todos', 'Hoy', 'Semana', 'Mes'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setTimeFilter(f); setPage(1); }}
                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all ${timeFilter === f ? 'bg-[#00D9FF] text-black' : 'text-[#555] hover:text-white'}`}
                        >
                            {f === 'Todos' ? 'Todos' : f === 'Hoy' ? '📅 Hoy' : f === 'Semana' ? '📆 7 días' : '🗓️ 30 días'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="text-[#555] text-xs font-bold pl-1">
                {filteredCount} miembro{filteredCount !== 1 ? 's' : ''} encontrado{filteredCount !== 1 ? 's' : ''}
            </div>
        </div>
    );
};


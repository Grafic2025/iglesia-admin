import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MemberPagination = ({
    page,
    totalPages,
    setPage,
    registrosCount
}: any) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#252525] bg-[#151515]">
            <span className="text-[#555] text-xs font-bold">Página {page} de {totalPages} • {registrosCount} registros</span>
            <div className="flex gap-2">
                <button
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                >
                    <ChevronLeft size={14} /> Anterior
                </button>
                <button
                    onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                >
                    Siguiente <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default MemberPagination;

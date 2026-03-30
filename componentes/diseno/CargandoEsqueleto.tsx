import React from 'react';

export const TarjetaEsqueleto = () => (
    <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="w-20 h-3 bg-white/5 rounded-full"></div>
            <div className="w-8 h-8 bg-white/5 rounded-lg"></div>
        </div>
        <div className="w-12 h-8 bg-white/10 rounded-lg mb-2"></div>
        <div className="w-16 h-3 bg-white/5 rounded-full"></div>
    </div>
);

export const FilaTablaEsqueleto = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="w-32 h-4 bg-white/10 rounded mb-2"></div>
            <div className="w-20 h-2 bg-white/5 rounded"></div>
        </td>
        <td className="px-6 py-4"><div className="w-24 h-6 bg-white/5 rounded-full"></div></td>
        <td className="px-6 py-4 text-center"><div className="w-16 h-4 bg-white/5 rounded mx-auto"></div></td>
        <td className="px-6 py-4 text-center"><div className="w-10 h-4 bg-white/5 rounded mx-auto"></div></td>
        <td className="px-6 py-4 text-center">
            <div className="flex gap-2 justify-center">
                <div className="w-8 h-8 bg-white/5 rounded-full"></div>
                <div className="w-8 h-8 bg-white/5 rounded-full"></div>
            </div>
        </td>
    </tr>
);

export const SeccionEsqueleto = () => (
    <div className="space-y-6">
        <div className="h-40 bg-[#1E1E1E] border border-[#333] rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TarjetaEsqueleto />
            <TarjetaEsqueleto />
            <TarjetaEsqueleto />
            <TarjetaEsqueleto />
        </div>
    </div>
);

'use client';
import React from 'react';

interface ModalExportarProps {
    showModalExportar: boolean;
    setShowModalExportar: (v: boolean) => void;
    exportStart: string;
    setExportStart: (v: string) => void;
    exportEnd: string;
    setExportEnd: (v: string) => void;
    exportarCSVRango: (fecha: string) => void;
    fechaSeleccionada: string;
}

const ModalExportar: React.FC<ModalExportarProps> = ({
    showModalExportar,
    setShowModalExportar,
    exportStart,
    setExportStart,
    exportEnd,
    setExportEnd,
    exportarCSVRango,
    fechaSeleccionada
}) => {
    if (!showModalExportar) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                    Exportar por Rango
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest px-1">Fecha Inicio</label>
                        <input
                            type="date"
                            value={exportStart}
                            onChange={(e) => setExportStart(e.target.value)}
                            className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest px-1">Fecha Fin</label>
                        <input
                            type="date"
                            value={exportEnd}
                            onChange={(e) => setExportEnd(e.target.value)}
                            className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 [color-scheme:dark]"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowModalExportar(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all border border-white/5"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={() => {
                                exportarCSVRango(fechaSeleccionada);
                                setShowModalExportar(false);
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                        >
                            Descargar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalExportar;


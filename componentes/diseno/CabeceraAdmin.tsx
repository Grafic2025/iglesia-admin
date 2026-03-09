'use client';
import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { TAB_LABELS } from '../../app/constantes';

import { usePathname } from 'next/navigation';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';

const CabeceraAdmin: React.FC = () => {
    const {
        fechaSeleccionada,
        establecerFechaSeleccionada,
        exportarCSV,
        establecerInicioExportacion,
        establecerFinExportacion,
        establecerMostrarModalExportacion,
        manejarCerrarSesion,
        alternarMenuLateral
    } = useContextoAdmin();

    const pathname = usePathname();
    const activeTab = pathname === '/' ? 'panel' : pathname.replace('/', '');
    return (
        <header className="h-20 bg-[#161616] border-b border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={alternarMenuLateral}
                    className="lg:hidden p-2 text-[#888] hover:text-white"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block h-10 w-1.5 bg-indigo-600 rounded-full"></div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {TAB_LABELS[activeTab]}
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest leading-none">Iglesia del Salvador</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {activeTab === 'miembros' && (
                    <div className="flex items-center gap-3 bg-[#1e1e1e] p-1.5 rounded-xl border border-white/5 shadow-inner">
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => establecerFechaSeleccionada(e.target.value)}
                            className="bg-transparent text-white px-3 py-1.5 rounded-lg focus:outline-none text-sm font-medium"
                        />
                        <button
                            onClick={exportarCSV}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Exportar Hoy
                        </button>
                        <button
                            onClick={() => {
                                establecerInicioExportacion(fechaSeleccionada);
                                establecerFinExportacion(fechaSeleccionada);
                                establecerMostrarModalExportacion(true);
                            }}
                            className="bg-[#2a2a2a] hover:bg-[#333] text-gray-300 px-5 py-2 rounded-lg text-sm font-bold transition-all border border-white/5"
                        >
                            Rango...
                        </button>
                    </div>
                )}

                <button
                    onClick={manejarCerrarSesion}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 transition-all border border-white/5"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Salir</span>
                </button>
            </div>
        </header>
    );
};

export default CabeceraAdmin;


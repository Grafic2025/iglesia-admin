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
                    className="lg:hidden p-2 text-white/50 hover:text-white"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block h-10 w-1.5 bg-[#A8D500] rounded-full shadow-[0_0_15px_rgba(168,213,0,0.3)]"></div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        {TAB_LABELS[activeTab]}
                    </h2>
                    <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest leading-none">Iglesia del Salvador</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {(activeTab === 'miembros' || activeTab === 'panel') && (
                    <div className="flex items-center gap-3 bg-[#1e1e1e] p-1.5 rounded-xl border border-white/5 shadow-inner">
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => establecerFechaSeleccionada(e.target.value)}
                            className="bg-transparent text-white px-3 py-1.5 rounded-lg focus:outline-none text-sm font-medium [color-scheme:dark]"
                        />
                        {activeTab === 'miembros' && (
                            <>
                                <button
                                    onClick={exportarCSV}
                                    className="bg-[#A8D500] hover:bg-[#c5ff00] text-black px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#A8D500]/20"
                                >
                                    Exportar Hoy
                                </button>
                                <button
                                    onClick={() => {
                                        establecerInicioExportacion(fechaSeleccionada);
                                        establecerFinExportacion(fechaSeleccionada);
                                        establecerMostrarModalExportacion(true);
                                    }}
                                    className="bg-[#2a2a2a] hover:bg-[#333] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all border border-white/5"
                                >
                                    Rango...
                                </button>
                            </>
                        )}
                    </div>
                )}

                <button
                    onClick={manejarCerrarSesion}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-[#A8D500]/10 text-white/60 hover:text-[#A8D500] transition-all border border-white/5"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Salir</span>
                </button>
            </div>
        </header>
    );
};

export default CabeceraAdmin;


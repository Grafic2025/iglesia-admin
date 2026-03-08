'use client';
import React from 'react';
import { LogOut } from 'lucide-react';
import { TAB_LABELS } from '../../app/constants';

interface AdminHeaderProps {
    activeTab: string;
    fechaSeleccionada: string;
    setFechaSeleccionada: (v: string) => void;
    exportarCSV: () => void;
    setExportStart: (v: string) => void;
    setExportEnd: (v: string) => void;
    setShowExportModal: (v: boolean) => void;
    handleLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    activeTab,
    fechaSeleccionada,
    setFechaSeleccionada,
    exportarCSV,
    setExportStart,
    setExportEnd,
    setShowExportModal,
    handleLogout
}) => {
    return (
        <header className="h-20 bg-[#161616] border-b border-white/5 flex items-center justify-between px-10 shrink-0">
            <div className="flex items-center gap-4">
                <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {TAB_LABELS[activeTab]}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Iglesia del Salvador • Gestión Rev</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {activeTab === 'miembros' && (
                    <div className="flex items-center gap-3 bg-[#1e1e1e] p-1.5 rounded-xl border border-white/5 shadow-inner">
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => setFechaSeleccionada(e.target.value)}
                            className="bg-transparent text-white px-3 py-1.5 rounded-lg focus:outline-none text-sm font-medium"
                        />
                        <button
                            onClick={exportarCSV}
                            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                        >
                            Exportar Hoy
                        </button>
                        <button
                            onClick={() => {
                                setExportStart(fechaSeleccionada);
                                setExportEnd(fechaSeleccionada);
                                setShowExportModal(true);
                            }}
                            className="bg-[#2a2a2a] hover:bg-[#333] text-gray-300 px-5 py-2 rounded-lg text-sm font-bold transition-all border border-white/5"
                        >
                            Rango...
                        </button>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-white/5"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Salir</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;

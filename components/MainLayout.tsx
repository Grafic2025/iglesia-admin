'use client';
import React from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './layout/AdminHeader';
import ExportModal from './layout/ExportModal';
import { useAdminContext } from '../context/AdminContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const admin = useAdminContext();

    return (
        <div className="flex h-screen bg-[#121212] text-white overflow-hidden font-sans selection:bg-[#A8D500]/30 selection:text-white">
            <Sidebar onLogout={admin.handleLogout} />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <AdminHeader />
                {admin.notificacionStatus.show && (
                    <div className={`fixed top-24 right-10 z-[100] p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-500 ${admin.notificacionStatus.error ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${admin.notificacionStatus.error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className="font-bold text-sm">{admin.notificacionStatus.message}</span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    {children}
                </div>
                <ExportModal
                    showExportModal={admin.showExportModal}
                    setShowExportModal={admin.setShowExportModal}
                    exportStart={admin.exportStart}
                    setExportStart={admin.setExportStart}
                    exportEnd={admin.exportEnd}
                    setExportEnd={admin.setExportEnd}
                    exportarCSVRango={admin.exportarCSVRango}
                    fechaSeleccionada={admin.fechaSeleccionada}
                />
            </main>
        </div>
    );
}

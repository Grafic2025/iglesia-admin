'use client';
import React from 'react';
import BarraLateral from './BarraLateral';
import CabeceraAdmin from './diseno/CabeceraAdmin';
import ModalExportar from './diseno/ModalExportar';
import { useContextoAdmin } from '../contextos/ContextoAdmin';

export default function DisenoPrincipal({ children }: { children: React.ReactNode }) {
    const administrador = useContextoAdmin();

    return (
        <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden font-sans selection:bg-[#A8D500]/30 selection:text-white relative">
            {/* Efectos de Brillo (Fondo) */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#A8D500]/[0.03] blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[#A8D500]/[0.02] blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[30%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none"></div>

            <BarraLateral onLogout={administrador.manejarCerrarSesion} />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <CabeceraAdmin />
                {administrador.estadoNotificacion.mostrar && (
                    <div className={`fixed top-24 right-10 z-[100] p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-500 ${administrador.estadoNotificacion.error ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${administrador.estadoNotificacion.error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className="font-bold text-sm">{administrador.estadoNotificacion.mensaje}</span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                    {children}
                </div>
                <ModalExportar
                    showModalExportar={administrador.mostrarModalExportacion}
                    setShowModalExportar={administrador.establecerMostrarModalExportacion}
                    exportStart={administrador.inicioExportacion}
                    setExportStart={administrador.establecerInicioExportacion}
                    exportEnd={administrador.finExportacion}
                    setExportEnd={administrador.establecerFinExportacion}
                    exportarCSVRango={administrador.exportarCSVRango}
                    fechaSeleccionada={administrador.fechaSeleccionada}
                />
            </main>
        </div>
    );
}


'use client';
import React from 'react';
import BarraLateral from './BarraLateral';
import CabeceraAdmin from './diseno/CabeceraAdmin';
import ModalExportar from './diseno/ModalExportar';
import { useContextoAdmin } from '../contextos/ContextoAdmin';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function DisenoPrincipal({ children }: { children: React.ReactNode }) {
    const administrador = useContextoAdmin();
    const pathname = usePathname();

    // Lógica de Guardia de URL
    const userInfoRaw = typeof window !== 'undefined' ? localStorage.getItem('admin_user_info') : null;
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

    const tienePermiso = () => {
        if (!userInfo) return false;
        if (userInfo.rol === 'superadmin') return true;
        
        // Pagina de inicio siempre permitida
        if (pathname === '/') return true;

        // Limpiamos el pathname de la barra inicial (ej: /videos -> videos)
        const pathSlug = pathname.split('/')[1];
        if (!pathSlug) return true;

        // Pagina de admins solo para superadmin
        if (pathSlug === 'admins') return false;

        return userInfo.menus?.includes(pathSlug);
    };

    const accesoPermitido = tienePermiso();

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
                    {accesoPermitido ? (
                        children
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                                <ShieldAlert size={40} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">Acceso Restringido</h2>
                            <p className="text-white/40 font-medium">Lo sentimos, no tienes los permisos necesarios para ver esta sección. Contacta con el administrador principal.</p>
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm border border-white/5 transition-all"
                            >
                                VOLVER AL INICIO
                            </button>
                        </div>
                    )}
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


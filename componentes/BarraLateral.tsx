'use client'
import React from 'react';
import {
    LayoutDashboard,
    Users,
    Bell,
    Image as ImageIcon,
    Calendar,
    LogOut,
    ChevronRight,
    Music,
    UserCircle,
    Users2,
    Clock,
    History,
    ShieldAlert,
    Bot,
    ClipboardList,
    Video,
    X,
} from 'lucide-react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useContextoAdmin } from '../contextos/ContextoAdmin';

interface BarraLateralProps {
    onLogout: () => void;
}

const BarraLateral = ({ onLogout }: BarraLateralProps) => {
    const administrador = useContextoAdmin();
    const pathname = usePathname();
    const menuItems = [
        { id: 'panel', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'miembros', label: 'Asistencias', icon: Users },
        { id: 'gente', label: 'Gente', icon: UserCircle },
        { id: 'notificaciones', label: 'Mensajería', icon: Bell },
        { id: 'bot', label: 'IDS BOT', icon: Bot },
        { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
        { id: 'alertas', label: 'Retención (Alertas)', icon: ShieldAlert },
        { id: 'cms', label: 'Contenido', icon: ImageIcon },
        { id: 'videos', label: 'Videoteca', icon: Video },
        { id: 'servicios', label: 'Plan de Culto', icon: Calendar },
        { id: 'equipos', label: 'Equipos/Servir', icon: Users2 },
        { id: 'cancionero', label: 'Cancionero', icon: Music },
        { id: 'agenda_config', label: 'Config. Agenda', icon: Clock },
        { id: 'auditoria', label: 'Auditoría', icon: History },
    ];

    return (
        <>
            {/* Overlay para móviles */}
            {administrador.estaMenuLateralAbierto && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={administrador.alternarMenuLateral}
                ></div>
            )}

            <div className={`flex flex-col h-full bg-[#0F0F0F] border-r border-[#222] w-64 fixed lg:static z-50 transition-transform duration-300 transform ${administrador.estaMenuLateralAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
                <div className="p-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-[#A8D500] text-2xl font-black tracking-tighter italic">IDS <span className="text-white">DIGITAL</span></h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#A8D500] animate-pulse"></span>
                            <p className="text-[#666] text-[10px] uppercase font-bold tracking-widest">Panel de Control</p>
                        </div>
                    </div>
                    <button onClick={administrador.alternarMenuLateral} className="lg:hidden text-[#888]">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === `/${item.id}` || (pathname === '/' && item.id === 'panel');
                        return (
                            <Link
                                key={item.id}
                                href={item.id === 'panel' ? '/' : `/${item.id}`}
                                onClick={() => administrador.establecerEstaMenuLateralAbierto(false)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#A8D500] text-black shadow-[0_0_15px_rgba(168,213,0,0.3)]'
                                    : 'text-[#aaa] hover:bg-[#252525] hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={isActive ? 'text-black' : 'group-hover:text-[#A8D500]'} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#333]">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#ff4444] hover:bg-[#ff444415] rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default BarraLateral;


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
    Palette,
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
        { id: 'admins', label: '🔑 Admins', icon: ShieldAlert }, // Usamos ShieldAlert o alguno similar
    ];

    // Filtrar menús según permisos
    const userInfoRaw = typeof window !== 'undefined' ? localStorage.getItem('admin_user_info') : null;
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

    const filteredMenuItems = menuItems.filter(item => {
        if (!userInfo) return false;
        if (userInfo.rol === 'superadmin') return true;
        
        // El dashboard siempre es visible? O depende de 'panel'
        if (item.id === 'panel') return true;

        // Admins solo para superadmin
        if (item.id === 'admins') return false;

        // Verificar si el id del menú está en la lista de permitidos
        return userInfo.menus?.includes(item.id);
    });

    React.useEffect(() => {
        const savedColor = localStorage.getItem('admin_theme_color');
        if (savedColor) {
            document.documentElement.style.setProperty('--accent', savedColor);
        }
    }, []);

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
                            <p className="text-[rgba(255,255,255,0.6)] text-[10px] uppercase font-bold tracking-widest">Panel de Control</p>
                        </div>
                    </div>
                    <button onClick={administrador.alternarMenuLateral} className="lg:hidden text-[rgba(255,255,255,0.7)]">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto no-scrollbar">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === `/${item.id}` || (pathname === '/' && item.id === 'panel');
                        return (
                            <Link
                                key={item.id}
                                href={item.id === 'panel' ? '/' : `/${item.id}`}
                                onClick={() => administrador.establecerEstaMenuLateralAbierto(false)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#A8D500] text-black shadow-[0_0_15px_rgba(168,213,0,0.3)] font-bold'
                                    : 'text-white/50 hover:bg-[#252525] hover:text-white font-bold'
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

                <div className="px-6 py-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette size={14} className="text-white/30" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Personalización</span>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { name: 'IDS', color: '#A8D500' },
                            { name: 'Oro', color: '#FFB400' },
                            { name: 'Cielo', color: '#00D9FF' },
                            { name: 'Rosa', color: '#FF007A' }
                        ].map((t) => (
                            <button
                                key={t.name}
                                onClick={() => {
                                    document.documentElement.style.setProperty('--accent', t.color);
                                    localStorage.setItem('admin_theme_color', t.color);
                                }}
                                className="w-6 h-6 rounded-full border border-white/10 hover:scale-125 transition-transform"
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                            />
                        ))}
                    </div>
                </div>

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


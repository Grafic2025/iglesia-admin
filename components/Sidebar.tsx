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
    Home,
    Clock,
    History,
    ShieldAlert,
    Bot,
    ClipboardList
} from 'lucide-react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
    const pathname = usePathname();
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'miembros', label: 'Asistencias', icon: Users },
        { id: 'gente', label: 'Gente', icon: UserCircle },
        { id: 'notificaciones', label: 'Mensajería', icon: Bell },
        { id: 'bot', label: 'IDS BOT', icon: Bot },
        { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
        { id: 'alertas', label: 'Retención (Alertas)', icon: ShieldAlert },
        { id: 'cms', label: 'Contenido', icon: ImageIcon },
        { id: 'servicios', label: 'Plan de Culto', icon: Calendar },
        { id: 'equipos', label: 'Equipos/Servir', icon: Users2 },
        { id: 'cancionero', label: 'Cancionero', icon: Music },
        { id: 'agenda_config', label: 'Config. Agenda', icon: Clock },
        { id: 'auditoria', label: 'Auditoría', icon: History },
    ];

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A] border-r border-[#333] w-64 transition-all duration-300">
            <div className="p-6">
                <h1 className="text-[#A8D500] text-xl font-bold tracking-tight">IDS DIGITAL</h1>
                <p className="text-[#888] text-xs">Panel de Administración</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // match precise route, or start with /route but also handle / as dashboard
                    const isActive = pathname === `/${item.id}` || (pathname === '/' && item.id === 'dashboard');
                    return (
                        <Link
                            key={item.id}
                            href={item.id === 'dashboard' ? '/' : `/${item.id}`}
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
    );
};

export default Sidebar;

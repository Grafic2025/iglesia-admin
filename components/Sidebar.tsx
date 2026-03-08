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
    ClipboardList,
    X,
    Menu
} from 'lucide-react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminContext } from '../context/AdminContext';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
    const admin = useAdminContext();
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
        <>
            {/* Overlay para móviles */}
            {admin.isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={admin.toggleSidebar}
                ></div>
            )}

            <div className={`flex flex-col h-full bg-[#1A1A1A] border-r border-[#333] w-64 fixed lg:static z-50 transition-transform duration-300 transform ${admin.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-[#A8D500] text-xl font-bold tracking-tight">IDS DIGITAL</h1>
                        <p className="text-[#888] text-xs">Panel de Administración</p>
                    </div>
                    <button onClick={admin.toggleSidebar} className="lg:hidden text-[#888]">
                        <X size={20} />
                    </button>
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
                                onClick={() => admin.setIsSidebarOpen(false)}
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

export default Sidebar;

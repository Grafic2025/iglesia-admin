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
    History
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'miembros', label: 'Asistencias', icon: Users },
        { id: 'gente', label: 'Gente', icon: UserCircle },
        { id: 'notificaciones', label: 'Mensajería', icon: Bell },
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

            <nav className="flex-1 px-4 space-y-2 py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
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
                        </button>
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

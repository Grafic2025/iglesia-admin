'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, User, Video, Bell, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ACCIONES = [
    { id: 'dash', label: 'Ver Dashboard', path: '/', icon: <LayoutDashboard size={16} />, cat: 'Navegación' },
    { id: 'asis', label: 'Ver Asistencias', path: '/miembros', icon: <User size={16} />, cat: 'Navegación' },
    { id: 'vid', label: 'Gestionar Videoteca', path: '/videos', icon: <Video size={16} />, cat: 'Navegación' },
    { id: 'adm', label: 'Administrar Usuarios', path: '/admins', icon: <Bell size={16} />, cat: 'Configuración' },
];

export default function BuscadorGlobal() {
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [indice, setIndice] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setAbierto(prev => !prev);
            }
            if (e.key === 'Escape') setAbierto(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (abierto) {
            setBusqueda('');
            setIndice(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [abierto]);

    const filtrados = ACCIONES.filter(a => 
        a.label.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.cat.toLowerCase().includes(busqueda.toLowerCase())
    );

    const manejarNavegacion = (path: string) => {
        router.push(path);
        setAbierto(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setIndice(prev => (prev + 1) % filtrados.length);
        } else if (e.key === 'ArrowUp') {
            setIndice(prev => (prev - 1 + filtrados.length) % filtrados.length);
        } else if (e.key === 'Enter' && filtrados[indice]) {
            manejarNavegacion(filtrados[indice].path);
        }
    };

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-[#111] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
                    <Search className="text-[#A8D500]" size={20} />
                    <input
                        ref={inputRef}
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe para buscar o navegar... (Ej: 'videos')"
                        className="flex-1 bg-transparent border-none outline-none text-white font-bold text-lg placeholder:text-white/20"
                    />
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5 text-[10px] text-white/40 font-black uppercase tracking-widest">
                        <Command size={10} /> K
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
                    {filtrados.length > 0 ? (
                        filtrados.map((item, i) => (
                            <div
                                key={item.id}
                                onClick={() => manejarNavegacion(item.path)}
                                onMouseEnter={() => setIndice(i)}
                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${i === indice ? 'bg-[#A8D500] text-black shadow-lg shadow-[#A8D500]/20' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={i === indice ? 'text-black' : 'text-[#A8D500]'}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-black ${i === indice ? 'text-black' : 'text-white'}`}>{item.label}</div>
                                        <div className={`text-[10px] uppercase tracking-widest font-bold ${i === indice ? 'text-black/60' : 'text-white/30'}`}>{item.cat}</div>
                                    </div>
                                </div>
                                {i === indice && <ArrowRight size={16} />}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-white/20 font-black uppercase tracking-widest text-xs">No se encontraron resultados</p>
                        </div>
                    )}
                </div>

                <div className="bg-[#0a0a0a]/50 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 font-black uppercase tracking-widest">
                    <div className="flex gap-4">
                        <span>↑↓ navegar</span>
                        <span>↵ entrar</span>
                    </div>
                    <span>Esc para cerrar</span>
                </div>
            </div>
        </div>
    );
}

'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../libreria/supabase';
import { Shield, UserPlus, Trash2, Key, CheckCircle2, Circle, Edit2 } from 'lucide-react';

interface AdminUser {
    id: string;
    usuario: string;
    rol: string;
    email?: string;
    menus_permitidos: string[];
}

const MENU_OPTIONS = [
    { id: 'miembros', label: 'Asistencias' },
    { id: 'gente', label: 'Gente' },
    { id: 'notificaciones', label: 'Mensajería' },
    { id: 'bot', label: 'IDS BOT' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'alertas', label: 'Retención (Alertas)' },
    { id: 'cms', label: 'Contenido' },
    { id: 'videos', label: 'Videoteca' },
    { id: 'servicios', label: 'Plan de Culto' },
    { id: 'equipos', label: 'Equipos/Servir' },
    { id: 'cancionero', label: 'Cancionero' },
    { id: 'agenda_config', label: 'Config. Agenda' },
    { id: 'auditoria', label: 'Auditoría' },
];

export default function AdminsPage() {
    const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Formulario Crear/Editar
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formUsuario, setFormUsuario] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRol, setFormRol] = useState('editor');
    const [formMenus, setFormMenus] = useState<string[]>([]);
    const [formEmail, setFormEmail] = useState('');

    useEffect(() => {
        const info = localStorage.getItem('admin_user_info');
        if (info) {
            const parsed = JSON.parse(info);
            setCurrentUser(parsed);
            if (parsed.rol !== 'superadmin') {
                window.location.href = '/';
            }
        }
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('admin_usuarios')
            .select('id, usuario, rol, email, menus_permitidos');
        
        if (!error && data) setUsuarios(data);
        setLoading(false);
    };

    const toggleMenu = (id: string) => {
        if (formMenus.includes(id)) {
            setFormMenus(formMenus.filter(m => m !== id));
        } else {
            setFormMenus([...formMenus, id]);
        }
    };

    const manejarGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload: any = {
            usuario: formUsuario,
            rol: formRol,
            email: formEmail,
            menus_permitidos: formMenus
        };

        if (formPassword) {
            payload.password = formPassword;
        }

        if (editingUser) {
            payload.id = editingUser.id;
        }

        try {
            const res = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (!data.success) throw new Error(data.error);

            setModalAbierto(false);
            obtenerUsuarios();
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const eliminarUsuario = async (id: string) => {
        if (id === currentUser?.id) return alert('No puedes eliminarte a ti mismo');
        if (!confirm('¿Seguro quieres eliminar este acceso?')) return;
        
        try {
            const res = await fetch('/api/admins', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            obtenerUsuarios();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const abrirModal = (user: AdminUser | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormUsuario(user.usuario);
            setFormEmail(user.email || '');
            setFormPassword('');
            setFormRol(user.rol);
            setFormMenus(user.menus_permitidos || []);
        } else {
            setEditingUser(null);
            setFormUsuario('');
            setFormEmail('');
            setFormPassword('');
            setFormRol('editor');
            setFormMenus([]);
        }
        setModalAbierto(true);
    };

    if (loading) return <div className="p-20 text-white">Verificando accesos...</div>;

    return (
        <div className="animate-in fade-in duration-700 max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-accent text-xs font-black tracking-[4px] uppercase mb-1">Seguridad de Sistema</h2>
                    <h1 className="text-5xl font-black tracking-tighter">Administrar Accesos</h1>
                    <p className="text-white/70 mt-3 max-w-2xl text-base font-medium">Controla quién puede entrar al panel y qué información pueden ver.</p>
                </div>
                <button 
                    onClick={() => abrirModal()}
                    className="bg-accent hover:bg-[#bbf000] text-black px-6 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(168,213,0,0.2)]"
                >
                    <UserPlus size={20} />
                    NUEVO USUARIO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuarios.map(u => (
                    <div key={u.id} className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            <button onClick={() => abrirModal(u)} className="p-2 bg-white/5 hover:bg-accent/20 rounded-xl text-white/40 hover:text-accent transition-all">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => eliminarUsuario(u.id)} className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-xl text-white/20 hover:text-red-500 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-white">{u.usuario}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${u.rol === 'superadmin' ? 'bg-accent text-black' : 'bg-white/10 text-white/50'}`}>
                                        {u.rol}
                                    </span>
                                </div>
                                {u.email && <p className="text-[10px] text-white/30 truncate max-w-[150px]">{u.email}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-3">Menús Permitidos</p>
                            <div className="flex flex-wrap gap-2">
                                {u.rol === 'superadmin' ? (
                                    <span className="text-xs text-accent font-black">TODOS LOS ACCESOS (*)</span>
                                ) : (
                                    u.menus_permitidos?.map(m => (
                                        <span key={m} className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-white font-bold border border-white/5">
                                            {MENU_OPTIONS.find(opt => opt.id === m)?.label || m}
                                        </span>
                                    ))
                                )}
                                {(!u.menus_permitidos || u.menus_permitidos.length === 0) && u.rol !== 'superadmin' && (
                                    <span className="text-xs text-red-500/50 italic">Sin accesos configurados</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black tracking-tighter">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setModalAbierto(false)} className="text-white/60 hover:text-white">
                                <Shield size={24} />
                            </button>
                        </div>

                        <form onSubmit={manejarGuardar} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-white/80 uppercase tracking-[2px] mb-2 px-1">Nombre de Usuario</label>
                                    <input 
                                        required 
                                        value={formUsuario} 
                                        onChange={e => setFormUsuario(e.target.value)} 
                                        type="text" 
                                        placeholder="Ej: juan.perez"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent/50 transition-colors placeholder:text-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-white/80 uppercase tracking-[2px] mb-2 px-1">Email de Recuperación</label>
                                    <input 
                                        required 
                                        value={formEmail} 
                                        onChange={e => setFormEmail(e.target.value)} 
                                        type="email" 
                                        placeholder="ejemplo@correo.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent/50 transition-colors placeholder:text-white/10"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-black text-white/80 uppercase tracking-[2px] mb-2 px-1">Contraseña {editingUser && '(Dejar vacío p/ no cambiar)'}</label>
                                    <input 
                                        required={!editingUser} 
                                        value={formPassword} 
                                        onChange={e => setFormPassword(e.target.value)} 
                                        type="password" 
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent/50 transition-colors placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-white/80 uppercase tracking-[2px] mb-4 px-1">Rol en el Sistema</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormRol('editor')}
                                        className={`flex-1 p-4 rounded-2xl border transition-all text-center font-black ${formRol === 'editor' ? 'bg-accent text-black border-transparent shadow-[0_0_20px_rgba(168,213,0,0.2)]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                                    >
                                        Editor Estándar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormRol('superadmin')}
                                        className={`flex-1 p-4 rounded-2xl border transition-all text-center font-black ${formRol === 'superadmin' ? 'bg-accent text-black border-transparent shadow-[0_0_20px_rgba(168,213,0,0.2)]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                                    >
                                        Súper Admin
                                    </button>
                                </div>
                            </div>

                            {formRol !== 'superadmin' && (
                                <div>
                                    <label className="block text-xs font-black text-white/80 uppercase tracking-[2px] mb-4 px-1">Seleccionar Permisos de Menú</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {MENU_OPTIONS.map(opt => (
                                            <div 
                                                key={opt.id} 
                                                onClick={() => toggleMenu(opt.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formMenus.includes(opt.id) ? 'bg-accent/10 border-accent/30 text-accent font-black' : 'bg-white/5 border-white/5 text-white/70 hover:border-white/20 font-bold'}`}
                                            >
                                                <span className="text-sm tracking-tight">{opt.label}</span>
                                                {formMenus.includes(opt.id) ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-white/20" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-white/10 flex gap-4">
                                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 py-4 text-white/40 font-bold hover:text-white transition-colors">Cancelar</button>
                                <button type="submit" className="flex-[2] py-4 bg-accent text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(168,213,0,0.2)] hover:scale-105 transition-transform">
                                    {editingUser ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

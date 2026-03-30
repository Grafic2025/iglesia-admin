'use client'
import React from 'react';

interface PantallaLoginProps {
    usuario: string;
    setUsuario: (usuario: string) => void;
    password: string;
    setPassword: (password: string) => void;
    handleLogin: (e: React.FormEvent) => void;
    loginLocked: boolean;
    lockTimer: number;
    // Props de Recuperación
    modoRecuperacion?: boolean;
    setModoRecuperacion?: (v: boolean) => void;
    pasoRecuperacion?: number;
    emailRecuperacion?: string;
    setEmailRecuperacion?: (v: string) => void;
    codigoRecuperacion?: string;
    setCodigoRecuperacion?: (v: string) => void;
    nuevaContrasena?: string;
    setNuevaContrasena?: (v: string) => void;
    solicitarCodigo?: (e: React.FormEvent) => void;
    resetearPassword?: (e: React.FormEvent) => void;
    cargandoRecuperacion?: boolean;
}

const PantallaLogin = ({
    usuario,
    setUsuario,
    password,
    setPassword,
    handleLogin,
    loginLocked,
    lockTimer,
    modoRecuperacion,
    setModoRecuperacion,
    pasoRecuperacion,
    emailRecuperacion,
    setEmailRecuperacion,
    codigoRecuperacion,
    setCodigoRecuperacion,
    nuevaContrasena,
    setNuevaContrasena,
    solicitarCodigo,
    resetearPassword,
    cargandoRecuperacion
}: PantallaLoginProps) => {
    return (
        <div className="h-screen flex items-center justify-center bg-[#121212] font-sans">
            <div className="bg-[#1e1e1e] p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-full border border-white/10 shadow-[0_0_30px_rgba(168,213,0,0.15)] overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Logo Iglesia"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">
                    Panel Principal
                </h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 px-1 uppercase tracking-tight">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Tu nombre de usuario"
                            className="w-full p-4 bg-[#2a2a2a] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-bold"
                            disabled={loginLocked}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-white/70 mb-2 px-1 uppercase tracking-tight">
                            Contraseña de Acceso
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-[#2a2a2a] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-bold"
                            disabled={loginLocked}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loginLocked}
                        className={`w-full p-4 rounded-xl font-black text-lg transition-all transform active:scale-95 ${loginLocked
                            ? 'bg-gray-800 text-white/20 cursor-not-allowed border border-white/5'
                            : 'bg-[var(--accent)] hover:bg-[#bbf000] text-black shadow-[0_4px_20px_-5px_rgba(168,213,0,0.4)]'
                            }`}
                    >
                        {loginLocked ? `Bloqueado (${lockTimer}s)` : 'Entrar al Panel'}
                    </button>
                </form>

                {!loginLocked && setModoRecuperacion && (
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setModoRecuperacion(true)}
                            className="text-white/50 hover:text-[var(--accent)] text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                )}
                {loginLocked && (
                    <p className="text-center mt-6 text-red-500 text-sm font-black animate-pulse flex items-center justify-center gap-2 uppercase tracking-widest">
                        ⚠️ Demasiados intentos fallidos.
                    </p>
                )}
            </div>

            {/* Modal de Recuperación */}
            {modoRecuperacion && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#1e1e1e] border border-white/10 p-10 rounded-[2rem] w-full max-w-sm shadow-2xl relative">
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Recuperar Acceso</h2>
                        <p className="text-white/50 text-sm mb-8 font-medium">Te enviaremos un código de seguridad a tu email registrado.</p>
                        
                        {pasoRecuperacion === 1 ? (
                            <form onSubmit={solicitarCodigo} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Ingresa tu Email</label>
                                    <input 
                                        required
                                        type="email"
                                        value={emailRecuperacion}
                                        onChange={(e) => setEmailRecuperacion?.(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        className="w-full p-4 bg-[#2a2a2a] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <button 
                                    disabled={cargandoRecuperacion}
                                    type="submit"
                                    className="w-full py-4 bg-[var(--accent)] text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                                >
                                    {cargandoRecuperacion ? 'Enviando...' : 'Solicitar Código'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={resetearPassword} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Código de 6 dígitos</label>
                                    <input 
                                        required
                                        type="text"
                                        maxLength={6}
                                        value={codigoRecuperacion}
                                        onChange={(e) => setCodigoRecuperacion?.(e.target.value)}
                                        placeholder="123456"
                                        className="w-full p-4 bg-[#2a2a2a] border border-white/10 rounded-xl text-white text-center text-2xl font-black tracking-[10px] outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Nueva Contraseña</label>
                                    <input 
                                        required
                                        type="password"
                                        value={nuevaContrasena}
                                        onChange={(e) => setNuevaContrasena?.(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full p-4 bg-[#2a2a2a] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--accent)]"
                                    />
                                </div>
                                <button 
                                    disabled={cargandoRecuperacion}
                                    type="submit"
                                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                                >
                                    {cargandoRecuperacion ? 'Verificando...' : 'Cambiar Contraseña'}
                                </button>
                            </form>
                        )}

                        <button 
                            onClick={() => setModoRecuperacion?.(false)}
                            className="w-full mt-4 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PantallaLogin;


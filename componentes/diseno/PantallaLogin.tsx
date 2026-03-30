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
}

const PantallaLogin = ({
    usuario,
    setUsuario,
    password,
    setPassword,
    handleLogin,
    loginLocked,
    lockTimer
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
                        <label className="block text-sm font-medium text-gray-400 mb-2 px-1">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Nombre de usuario"
                            className="w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8D500]/50 transition-all font-medium"
                            disabled={loginLocked}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 px-1">
                            Contraseña de Acceso
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8D500]/50 transition-all font-medium"
                            disabled={loginLocked}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loginLocked}
                        className={`w-full p-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${loginLocked
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                            : 'bg-[#A8D500] hover:bg-[#bbf000] text-black shadow-[0_4px_20px_-5px_rgba(168,213,0,0.4)]'
                            }`}
                    >
                        {loginLocked ? `Bloqueado (${lockTimer}s)` : 'Entrar al Panel'}
                    </button>
                </form>
                {loginLocked && (
                    <p className="text-center mt-6 text-amber-500 text-sm font-bold animate-pulse flex items-center justify-center gap-2">
                        ⚠️ Demasiados intentos fallidos.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PantallaLogin;


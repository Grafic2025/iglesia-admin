'use client'
import React from 'react';

interface PantallaLoginProps {
    password: string;
    setPassword: (password: string) => void;
    handleLogin: (e: React.FormEvent) => void;
    loginLocked: boolean;
    lockTimer: number;
}

const PantallaLogin = ({
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
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-white/5 rounded-full p-2 border border-white/10 shadow-lg glow-effect">
                        <img
                            src="/logo.png"
                            alt="Logo Iglesia"
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">
                    Panel Principal
                </h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 px-1">
                            Contraseña de Acceso
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            disabled={loginLocked}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loginLocked}
                        className={`w-full p-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${loginLocked
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
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


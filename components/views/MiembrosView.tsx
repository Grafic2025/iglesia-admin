'use client'
import React from 'react';
import { Send } from 'lucide-react';

interface MiembrosViewProps {
    busqueda: string;
    setBusqueda: (v: string) => void;
    filtroHorario: string;
    setFiltroHorario: (v: string) => void;
    datosFiltrados: any[];
    premiosPendientes: any;
    premiosEntregados: any[];
    marcarComoEntregado: (id: string, nivel: number, nombre: string) => void;
    enviarNotificacionIndividual: (token: string, nombre: string) => void;
    hoyArg: string;
}

const MiembrosView = ({
    busqueda, setBusqueda, filtroHorario, setFiltroHorario,
    datosFiltrados, premiosPendientes, premiosEntregados,
    marcarComoEntregado, enviarNotificacionIndividual, hoyArg
}: MiembrosViewProps) => {

    const rewardLevels = [
        { level: 30, title: 'Entrada a Retiro (30+ asistencias)', icon: '🎟️', color: '#9333EA', key: 'nivel30' },
        { level: 20, title: 'Libro Cristiano (20-29 asistencias)', icon: '📚', color: '#3B82F6', key: 'nivel20' },
        { level: 10, title: 'Café Gratis (10-19 asistencias)', icon: '☕', color: '#FFB400', key: 'nivel10' },
        { level: 5, title: 'Sticker IDS (5-9 asistencias)', icon: '⭐', color: '#A8D500', key: 'nivel5' },
    ];

    return (
        <div className="space-y-6">
            {/* Rewards Section */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-[#9333EA] text-lg font-bold mb-2">🎁 Premios Pendientes</h3>
                <p className="text-[#888] text-sm mb-6">Metas alcanzadas en los últimos 30 días</p>

                <div className="space-y-6">
                    {rewardLevels.map((rl) => (
                        premiosPendientes[rl.key]?.length > 0 && (
                            <div key={rl.key}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{rl.icon}</span>
                                    <h4 className="text-white font-medium">{rl.title}</h4>
                                    <span className="bg-[#333] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                        {premiosPendientes[rl.key].length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {premiosPendientes[rl.key].map((m: any) => {
                                        const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === rl.level);
                                        return (
                                            <div
                                                key={m.id}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${yaEntregado ? 'bg-[#151515] border-[#222]' : 'bg-[#252525] border-[#333]'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`${yaEntregado ? 'text-[#555]' : 'text-white'} text-sm font-medium`}>
                                                        {m.nombre} {m.apellido}
                                                    </span>
                                                    <span className="text-[10px] font-bold" style={{ color: rl.color }}>🔥 {m.racha}</span>
                                                </div>
                                                {yaEntregado ? (
                                                    <span className="text-[#A8D500]">✅</span>
                                                ) : (
                                                    <button
                                                        onClick={() => marcarComoEntregado(m.id, rl.level, `${m.nombre} ${m.apellido}`)}
                                                        className="text-[10px] uppercase font-bold px-2 py-1 rounded-md transition-all active:scale-95"
                                                        style={{ backgroundColor: rl.color, color: rl.level === 30 || rl.level === 20 ? '#fff' : '#000' }}
                                                    >
                                                        Entregar
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Search and Table */}
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 border-b border-[#333] flex flex-col md:flex-row gap-4">
                    <input
                        placeholder="🔍 Buscar por nombre o apellido..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="flex-1 bg-[#252525] text-white px-4 py-2.5 rounded-xl border border-[#444] outline-none focus:border-[#A8D500] transition-all"
                    />
                    <select
                        value={filtroHorario}
                        onChange={(e) => setFiltroHorario(e.target.value)}
                        className="bg-[#A8D500] text-black font-bold px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                    >
                        <option value="Todas">Todas las Reuniones</option>
                        <option value="09:00">09:00 HS</option>
                        <option value="11:00">11:00 HS</option>
                        <option value="20:00">20:00 HS</option>
                        <option value="Extraoficial">Extraoficiales</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#252525] text-[#888] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4">Miembro</th>
                                <th className="px-6 py-4">Reunión</th>
                                <th className="px-6 py-4">Hora</th>
                                <th className="px-6 py-4">Racha</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {datosFiltrados.map((a) => {
                                const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
                                return (
                                    <tr key={a.id} className="hover:bg-[#222] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{a.miembros?.nombre} {a.miembros?.apellido}</div>
                                            {esNuevo && <span className="mt-1 inline-block bg-[#A8D500] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${a.horario_reunion === 'Extraoficial' ? 'bg-[#FFB400] text-black' : 'bg-[#333] text-[#aaa]'
                                                }`}>
                                                {a.horario_reunion}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#888] text-sm">{a.hora_entrada}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={a.racha >= 4 ? 'text-[#A8D500]' : 'text-[#888]'}>
                                                    {a.racha >= 4 ? '🔥' : '📍'}
                                                </span>
                                                <span className={`font-bold ${a.racha >= 4 ? 'text-[#A8D500]' : 'text-[#888]'}`}>
                                                    {a.racha}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {a.miembros?.token_notificacion && (
                                                <button
                                                    onClick={() => enviarNotificacionIndividual(a.miembros.token_notificacion, `${a.miembros.nombre} ${a.miembros.apellido}`)}
                                                    className="p-2 rounded-full bg-[#333] text-[#A8D500] hover:bg-[#A8D500] hover:text-black transition-all"
                                                    title="Enviar mensaje personal"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MiembrosView;

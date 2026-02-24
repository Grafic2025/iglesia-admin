'use client'
import React, { useState, useMemo } from 'react';
import { Send, UserCircle, ChevronLeft, ChevronRight, User, X } from 'lucide-react';

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
    supabase: any;
    fetchAsistencias: () => Promise<void>;
    fetchMiembros: () => Promise<void>;
    horariosDisponibles: any[];
}

const PAGE_SIZE = 25;

const MiembrosView = ({
    busqueda, setBusqueda, filtroHorario, setFiltroHorario,
    datosFiltrados, premiosPendientes, premiosEntregados,
    marcarComoEntregado, enviarNotificacionIndividual, hoyArg, supabase,
    fetchAsistencias, fetchMiembros, horariosDisponibles
}: MiembrosViewProps) => {

    const [page, setPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const totalPages = Math.max(1, Math.ceil(datosFiltrados.length / PAGE_SIZE));
    const paginatedData = datosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset page when filters change
    const handleBusqueda = (v: string) => { setBusqueda(v); setPage(1); };
    const handleFiltro = (v: string) => { setFiltroHorario(v); setPage(1); };

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
                <div className="p-4 border-b border-[#333] flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <input
                        placeholder="🔍 Buscar por nombre o apellido..."
                        value={busqueda}
                        onChange={(e) => handleBusqueda(e.target.value)}
                        className="flex-1 bg-[#252525] text-white px-4 py-2.5 rounded-xl border border-[#444] outline-none focus:border-[#A8D500] transition-all"
                    />
                    <select
                        value={filtroHorario}
                        onChange={(e) => handleFiltro(e.target.value)}
                        className="bg-[#A8D500] text-black font-bold px-4 py-2.5 rounded-xl outline-none cursor-pointer"
                    >
                        <option value="Todas">Todas las Reuniones</option>
                        {horariosDisponibles.map(h => (
                            <option key={h} value={h}>{h} HS</option>
                        ))}
                        <option value="Extraoficial">Extraoficiales</option>
                    </select>
                    <span className="text-[#555] text-xs font-bold whitespace-nowrap">{datosFiltrados.length} registros</span>
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
                            {paginatedData.map((a) => {
                                const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
                                return (
                                    <tr key={a.id} className="hover:bg-[#222] transition-colors group cursor-pointer" onClick={() => setSelectedMember(a)}>
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
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {a.miembros?.token_notificacion && (
                                                    <button
                                                        onClick={() => enviarNotificacionIndividual(a.miembros.token_notificacion, `${a.miembros.nombre} ${a.miembros.apellido}`)}
                                                        className="p-2 rounded-full bg-[#333] text-[#A8D500] hover:bg-[#A8D500] hover:text-black transition-all"
                                                        title="Enviar mensaje personal"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        const newVal = !a.miembros?.es_servidor;
                                                        const { error } = await supabase.from('miembros').update({ es_servidor: newVal }).eq('id', a.miembro_id);
                                                        if (!error) {
                                                            await fetchAsistencias();
                                                            await fetchMiembros();
                                                        } else {
                                                            alert("Error: " + error.message);
                                                        }
                                                    }}
                                                    className={`p-2 rounded-full transition-all ${a.miembros?.es_servidor ? 'bg-[#A8D500] text-black' : 'bg-[#333] text-[#555] hover:text-[#A8D500]'}`}
                                                    title={a.miembros?.es_servidor ? "Quitar Acceso Servidor" : "Dar Acceso Servidor"}
                                                >
                                                    <UserCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#252525] bg-[#151515]">
                        <span className="text-[#555] text-xs font-bold">Página {page} de {totalPages} • {datosFiltrados.length} registros</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                <ChevronLeft size={14} /> Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                Siguiente <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Member Profile Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
                    <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#333] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#252525] rounded-full flex items-center justify-center border-2 border-[#A8D500]">
                                    {selectedMember.miembros?.foto_url ? (
                                        <img src={selectedMember.miembros.foto_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="text-[#A8D500]" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{selectedMember.miembros?.nombre} {selectedMember.miembros?.apellido}</h3>
                                    <p className="text-[#888] text-xs">ID: {selectedMember.miembro_id?.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="text-[#888] hover:text-white p-2"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#222] p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-[#A8D500]">{selectedMember.racha >= 4 ? '🔥' : ''} {selectedMember.racha}</p>
                                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Racha</p>
                                </div>
                                <div className="bg-[#222] p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-white">{selectedMember.hora_entrada || '-'}</p>
                                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Hora hoy</p>
                                </div>
                                <div className="bg-[#222] p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-white">{selectedMember.horario_reunion}</p>
                                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Reunión</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className={`flex-1 p-3 rounded-xl text-center text-sm font-bold ${selectedMember.miembros?.es_servidor ? 'bg-[#A8D50020] text-[#A8D500] border border-[#A8D50030]' : 'bg-[#222] text-[#555]'}`}>
                                    {selectedMember.miembros?.es_servidor ? '✅ Servidor Activo' : '⛔ No es Servidor'}
                                </div>
                            </div>
                            {selectedMember.miembros?.created_at && (
                                <p className="text-[#555] text-xs text-center">
                                    Miembro desde {new Date(selectedMember.miembros.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiembrosView;

'use client'
import React, { useState } from 'react';
import { Send, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Modular Components
import MemberRewards from '../admin/members/MemberRewards';
import MemberProfileModal from '../admin/members/MemberProfileModal';

interface MiembrosViewProps {
    busqueda: string;
    setBusqueda: (v: string) => void;
    filtroHorario: string;
    setFiltroHorario: (v: string) => void;
    datosFiltrados: any[];
    premiosPendientes: any;
    premiosEntregados: any[];
    marcarComoEntregado: (id: string, nivel: number, nombre: string) => void;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje?: string) => Promise<any>;
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

    const handleBusqueda = (v: string) => { setBusqueda(v); setPage(1); };
    const handleFiltro = (v: string) => { setFiltroHorario(v); setPage(1); };

    return (
        <div className="space-y-6">
            <MemberRewards
                premiosPendientes={premiosPendientes}
                premiosEntregados={premiosEntregados}
                marcarComoEntregado={marcarComoEntregado}
            />

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

            <MemberProfileModal
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
};

export default MiembrosView;

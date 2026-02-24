'use client'
import React, { useState, useMemo } from 'react';
import { UserPlus, Phone, Search, ShieldCheck, UserCircle, Archive, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GenteViewProps {
    miembros: any[];
    hoyArg: string;
    fetchMiembros: () => Promise<void>;
    enviarNotificacionIndividual: (token: string, nombre: string, mensaje: string) => Promise<void>;
}

const PAGE_SIZE = 20;

const GenteView = ({ miembros, hoyArg, fetchMiembros, enviarNotificacionIndividual }: GenteViewProps) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [timeFilter, setTimeFilter] = useState('Todos');
    const [showArchived, setShowArchived] = useState(false);

    const toggleServerStatus = async (miembro: any) => {
        const nuevoEstado = !miembro.es_servidor;
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: nuevoEstado })
            .eq('id', miembro.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            if (nuevoEstado && miembro.token_notificacion) {
                await enviarNotificacionIndividual(
                    miembro.token_notificacion,
                    miembro.nombre,
                    `¡Hola ${miembro.nombre}! 🎉 Has sido habilitado como SERVIDOR en Iglesia del Salvador. ¡Gracias por sumarte al equipo! 🙌`
                );
            }
            await fetchMiembros();
        }
    };

    const handleArchive = async (miembro: any) => {
        if (!confirm(`¿Archivar a ${miembro.nombre} ${miembro.apellido}? Ya no aparecerá en la lista principal.`)) return;
        const { error } = await supabase.from('miembros').update({ activo: false }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else await fetchMiembros();
    };

    const handleRestore = async (miembro: any) => {
        const { error } = await supabase.from('miembros').update({ activo: true }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else await fetchMiembros();
    };

    const filteredMiembros = useMemo(() => {
        let list = miembros;

        // Active/archived filter
        if (showArchived) {
            list = list.filter(m => m.activo === false);
        } else {
            list = list.filter(m => m.activo !== false);
        }

        // Time filter
        if (timeFilter !== 'Todos') {
            const now = new Date();
            const cutoff = new Date();
            if (timeFilter === 'Hoy') cutoff.setHours(0, 0, 0, 0);
            else if (timeFilter === 'Semana') cutoff.setDate(now.getDate() - 7);
            else if (timeFilter === 'Mes') cutoff.setMonth(now.getMonth() - 1);
            list = list.filter(m => new Date(m.created_at) >= cutoff);
        }

        // Search filter
        if (search) {
            list = list.filter(m =>
                `${m.nombre} ${m.apellido}`.toLowerCase().includes(search.toLowerCase())
            );
        }

        return list;
    }, [miembros, search, timeFilter, showArchived]);

    const totalPages = Math.max(1, Math.ceil(filteredMiembros.length / PAGE_SIZE));
    const paginatedList = filteredMiembros.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Stats
    const totalActivos = miembros.filter(m => m.activo !== false).length;
    const totalServidores = miembros.filter(m => m.es_servidor).length;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nuevosHoy = miembros.filter(m => new Date(m.created_at) >= hoy).length;
    const hace7d = new Date();
    hace7d.setDate(hace7d.getDate() - 7);
    const nuevosSemana = miembros.filter(m => new Date(m.created_at) >= hace7d).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" /> Base de Datos de Miembros
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestioná toda la gente de la iglesia y sus permisos</p>
                </div>
                <button
                    onClick={() => { setShowArchived(!showArchived); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showArchived ? 'bg-[#FFB400] text-black' : 'bg-[#222] text-[#888] border border-[#333] hover:text-white'}`}
                >
                    <Archive size={14} />
                    {showArchived ? 'VER ACTIVOS' : 'VER ARCHIVADOS'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                    <p className="text-2xl font-bold text-white">{totalActivos}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Miembros Activos</p>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                    <p className="text-2xl font-bold text-[#A8D500]">{totalServidores}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Servidores</p>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                    <p className="text-2xl font-bold text-[#00D9FF]">{nuevosHoy}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Nuevos Hoy</p>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] text-center">
                    <p className="text-2xl font-bold text-[#FFB400]">{nuevosSemana}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase mt-1">Nuevos Semana</p>
                </div>
            </div>

            {/* Search Bar + Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00D9FF] transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-[#1E1E1E] rounded-2xl p-1 border border-[#333]">
                    {['Todos', 'Hoy', 'Semana', 'Mes'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setTimeFilter(f); setPage(1); }}
                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all ${timeFilter === f ? 'bg-[#00D9FF] text-black' : 'text-[#555] hover:text-white'}`}
                        >
                            {f === 'Todos' ? 'Todos' : f === 'Hoy' ? '📅 Hoy' : f === 'Semana' ? '📆 7 días' : '🗓️ 30 días'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-[#555] text-xs font-bold">
                {filteredMiembros.length} miembro{filteredMiembros.length !== 1 ? 's' : ''} encontrado{filteredMiembros.length !== 1 ? 's' : ''}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paginatedList.length === 0 && (
                    <div className="bg-[#1E1E1E] p-10 rounded-2xl border border-[#333] text-center">
                        <span className="text-[#555] italic">{showArchived ? 'No hay miembros archivados.' : 'No se encontraron miembros con esos filtros.'}</span>
                    </div>
                )}

                {paginatedList.map((m) => {
                    const sieteDiasAgo = new Date();
                    sieteDiasAgo.setDate(sieteDiasAgo.getDate() - 7);
                    const esNuevo = new Date(m.created_at) > sieteDiasAgo;

                    return (
                        <div key={m.id} className={`bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center justify-between hover:border-[#00D9FF50] transition-all group ${showArchived ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${m.es_servidor ? 'bg-[#A8D50020] text-[#A8D500]' : 'bg-[#00D9FF15] text-[#00D9FF]'} rounded-full flex items-center justify-center font-bold text-xl overflow-hidden`}>
                                    {m.foto_url ? (
                                        <img src={m.foto_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        m.nombre[0]
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-white font-bold text-lg">{m.nombre} {m.apellido}</div>
                                        {m.es_servidor && (
                                            <span title="Servidor Activo">
                                                <ShieldCheck size={16} className="text-[#A8D500]" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#888] mt-1">
                                        <span className="flex items-center gap-1">📍 Se unió el {new Date(m.created_at).toLocaleDateString()}</span>
                                        {esNuevo && <span className="bg-[#00D9FF20] px-2 py-0.5 rounded text-[#00D9FF] font-bold">NUEVO</span>}
                                        {m.es_servidor && <span className="bg-[#A8D50020] px-2 py-0.5 rounded text-[#A8D500] font-bold">SERVIDOR</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {m.celular && (
                                    <button
                                        onClick={() => window.open(`https://wa.me/${m.celular.replace(/\D/g, '')}`, '_blank')}
                                        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                                    >
                                        <Phone size={16} /> WHATSAPP
                                    </button>
                                )}
                                <button
                                    onClick={() => toggleServerStatus(m)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${m.es_servidor
                                        ? 'bg-[#A8D500] text-black shadow-[0_0_15px_rgba(168,213,0,0.3)]'
                                        : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-white'
                                        }`}
                                >
                                    <UserCircle size={16} />
                                    {m.es_servidor ? 'ES SERVIDOR' : 'HACER SERVIDOR'}
                                </button>
                                {showArchived ? (
                                    <button
                                        onClick={() => handleRestore(m)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00D9FF] text-black font-bold text-sm transition-all hover:scale-105"
                                        title="Restaurar miembro"
                                    >
                                        <UserPlus size={14} /> RESTAURAR
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleArchive(m)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#222] text-[#555] hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-all opacity-0 group-hover:opacity-100"
                                        title="Archivar miembro"
                                    >
                                        <Archive size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[#555] text-xs font-bold">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-4 py-2 bg-[#1E1E1E] border border-[#333] text-white text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-[#252525] transition-all"
                        >
                            <ChevronLeft size={14} /> Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-4 py-2 bg-[#1E1E1E] border border-[#333] text-white text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-[#252525] transition-all"
                        >
                            Siguiente <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenteView;

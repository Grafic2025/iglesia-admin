'use client'
import React, { useState, useMemo, useCallback } from 'react';
import { Bell, AlertCircle, Trash2, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificacionesViewProps {
    tituloPush: string;
    setTituloPush: (v: string) => void;
    mensajePush: string;
    setMensajePush: (v: string) => void;
    imageUrlPush: string;
    setImageUrlPush: (v: string) => void;
    typePush: string;
    setTypePush: (v: string) => void;
    filtroHorario: string;
    setFiltroHorario: (v: string) => void;
    enviarNotificacion: () => void;
    enviando: boolean;
    notificacionStatus: any;
    cronogramas: any[];
    eliminarProgramacion: (id: string) => void;
    fetchProgramaciones: () => void;
    supabase: any;
    logs: any[];
    logsError: string | null;
    horariosDisponibles?: string[];
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

import { useNotificacionesAdmin } from '../../hooks/useNotificacionesAdmin';

const LOGS_PER_PAGE = 20;

const NotificacionesView = ({
    tituloPush, setTituloPush, mensajePush, setMensajePush, filtroHorario, setFiltroHorario,
    enviarNotificacion, enviando, notificacionStatus,
    cronogramas, eliminarProgramacion, fetchProgramaciones, supabase,
    logs, logsError, horariosDisponibles = ['09:00', '11:00', '20:00'],
    registrarAuditoria, imageUrlPush, setImageUrlPush,
    typePush, setTypePush
}: NotificacionesViewProps) => {
    const {
        logSearch, setLogSearch,
        logPage, setLogPage,
        logStatusFilter, setLogStatusFilter,
        nMensaje, setNMensaje,
        nDia, setNDia,
        nHora, setNHora,
        filteredLogs,
        totalPages,
        paginatedLogs,
        handleScheduleNotification
    } = useNotificacionesAdmin({ supabase, logs, fetchProgramaciones, registrarAuditoria });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Send Notification Form */}
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-[#A8D500] text-lg font-bold flex items-center gap-2 mb-6">
                        <Bell size={20} /> Envío Inmediato
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Título</label>
                            <input
                                placeholder="Iglesia del Salvador"
                                value={tituloPush}
                                onChange={(e) => setTituloPush(e.target.value)}
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Mensaje</label>
                            <textarea
                                placeholder="Escribe el mensaje aquí..."
                                value={mensajePush}
                                onChange={(e) => setMensajePush(e.target.value)}
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-4 text-white outline-none focus:border-[#A8D500] h-32 resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[#888] text-xs font-bold uppercase mb-1 block">URL Imagen (Opcional)</label>
                                <input
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={imageUrlPush}
                                    onChange={(e) => setImageUrlPush(e.target.value)}
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#A8D500]"
                                />
                            </div>
                            <div>
                                <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Abrir al tocar</label>
                                <select
                                    value={typePush}
                                    onChange={(e) => setTypePush(e.target.value)}
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#A8D500]"
                                >
                                    <option value="General">Buzón de Mensajes</option>
                                    <option value="News">Noticias</option>
                                    <option value="Video">Videos / YouTube</option>
                                    <option value="Prayer">Muro de Oración</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-bold uppercase mb-1 block">Segmento / Destinatarios</label>
                            <select
                                value={filtroHorario}
                                onChange={(e) => {
                                    setFiltroHorario(e.target.value);
                                }}
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#A8D500]"
                            >
                                <option value="Todas">Toda la Iglesia</option>
                                <option value="Lideres">Solo Líderes</option>
                                <option value="Servidores">Todos los Servidores</option>
                                <option value="Nuevos">Nuevos (Último mes)</option>
                                <option value="Varones">Segmento: Varones</option>
                                <option value="Mujeres">Segmento: Mujeres</option>
                                <option value="Adolescentes">Segmento: Adolescentes</option>
                                <option value="EquipoMusica">Equipo de Música</option>
                                {horariosDisponibles?.map(h => (
                                    <option key={h} value={h}>Reunión {h} hs</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-[#A8D50015] border border-[#A8D50030] p-3 rounded-xl">
                            <p className="text-[#A8D500] text-xs text-center font-medium">
                                Se enviará a: <span className="font-bold">{filtroHorario === 'Todas' ? 'Toda la Iglesia' : `Segmento ${filtroHorario}`}</span>
                            </p>
                        </div>
                        <button
                            onClick={enviarNotificacion}
                            disabled={enviando}
                            className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${enviando ? 'bg-[#333] text-[#888]' : 'bg-[#A8D500] text-black shadow-[0_4px_15px_rgba(168,213,0,0.3)]'
                                }`}
                        >
                            {enviando ? 'PROCESANDO...' : 'ENVIAR NOTIFICACIÓN AHORA'}
                        </button>
                        {notificacionStatus.show && (
                            <div className={`mt-4 text-center font-bold ${notificacionStatus.error ? 'text-red-500' : 'text-[#A8D500]'}`}>
                                {notificacionStatus.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phone Preview */}
                <div className="hidden xl:flex flex-col items-center justify-center p-6 bg-[#1E1E1E] rounded-2xl border border-[#333]">
                    <h3 className="text-[#888] text-[10px] font-bold uppercase mb-6 tracking-widest">Vista Previa (Teléfono)</h3>
                    <div className="relative w-[280px] h-[550px] bg-[#000] rounded-[50px] border-[8px] border-[#333] overflow-hidden shadow-2xl">
                        {/* Speaker/Camera Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#333] rounded-b-2xl z-10"></div>

                        {/* Background Mockup */}
                        <div className="absolute inset-0 bg-[#333] opacity-20"></div>

                        {/* Notification Bubble */}
                        <div className="absolute top-20 left-4 right-4 bg-[#ffffffdd] rounded-3xl p-4 shadow-lg animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-[#000] rounded-md flex items-center justify-center">
                                    <span className="text-[10px] text-white">⛪</span>
                                </div>
                                <span className="text-[10px] font-bold text-black uppercase">{tituloPush || 'Nombre App'}</span>
                                <span className="text-[10px] text-gray-500 ml-auto">ahora</span>
                            </div>
                            <p className="text-sm font-bold text-black mb-1">{tituloPush || 'Iglesia del Salvador'}</p>
                            <p className="text-xs text-black leading-tight line-clamp-3 overflow-hidden mb-2">{mensajePush || 'Tu mensaje aparecerá aquí...'}</p>
                            {imageUrlPush && (
                                <img src={imageUrlPush} alt="preview" className="w-full h-24 object-cover rounded-xl border border-[#eee]" />
                            )}
                        </div>

                        {/* Time/Date on phone removed as requested */}
                    </div>
                    <p className="text-[10px] text-[#555] mt-6 italic">Así es como el usuario verá la notificación push.</p>
                </div>

                {/* Scheduler Section (Moved to col-span-1) */}
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] lg:col-span-2 xl:col-span-1">
                    <h3 className="text-[#FFB400] text-lg font-bold flex items-center gap-2 mb-2">
                        <Clock size={20} /> Programación Automática
                    </h3>
                    <p className="text-[#888] text-xs mb-6">Usa <span className="text-white font-bold">VERSICULO</span> para envíos bíblicos diarios</p>

                    <div className="space-y-4 mb-8">
                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="Mensaje o 'VERSICULO'"
                                value={nMensaje}
                                onChange={e => setNMensaje(e.target.value)}
                                className="bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFB400]"
                            />
                            <div className="flex gap-2">
                                <select
                                    value={nDia}
                                    onChange={e => setNDia(e.target.value)}
                                    className="flex-1 bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none"
                                >
                                    <option>Todos los días</option>
                                    <option>Lunes</option><option>Martes</option><option>Miércoles</option>
                                    <option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
                                </select>
                                <input
                                    type="time"
                                    value={nHora}
                                    onChange={e => setNHora(e.target.value)}
                                    className="flex-1 bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none"
                                />
                            </div>
                            <button
                                onClick={handleScheduleNotification}
                                className="bg-[#FFB400] text-black font-bold py-3 rounded-xl transition-all active:scale-95"
                            >
                                PROGRAMAR
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {cronogramas.map((p) => (
                            <div key={p.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${p.ultimo_estado === 'Exitoso' ? 'bg-[#A8D500]' : 'bg-[#555]'}`} />
                                    <div>
                                        <div className={`text-sm font-bold ${p.mensaje === 'VERSICULO' ? 'text-[#FFB400]' : 'text-white'}`}>
                                            {p.mensaje === 'VERSICULO' ? '📖 Versículo Diario' : p.mensaje}
                                        </div>
                                        <div className="text-[10px] text-[#888]">{p.dia_semana} • {p.hora ? p.hora.substring(0, 5) : '--:--'} hs</div>
                                    </div>
                                </div>
                                <button onClick={() => eliminarProgramacion(p.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* History Table with Search & Pagination */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-white text-lg font-bold flex items-center gap-2">
                        <AlertCircle size={20} className="text-[#888]" /> Historial de Envío
                        <span className="text-[10px] bg-[#333] text-[#888] px-2 py-1 rounded-full ml-2 font-bold">
                            {filteredLogs.length} de {logs.length}
                        </span>
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                            <input
                                placeholder="Buscar por título, mensaje o fecha..."
                                value={logSearch}
                                onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                                className="bg-[#252525] border border-[#333] rounded-xl pl-9 pr-4 py-2 text-white text-sm outline-none focus:border-[#A8D500] w-72"
                            />
                        </div>
                        <select
                            value={logStatusFilter}
                            onChange={(e) => { setLogStatusFilter(e.target.value); setLogPage(1); }}
                            className="bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white text-sm outline-none"
                        >
                            <option value="Todos">Todos los estados</option>
                            <option value="Exitoso">✅ Exitoso</option>
                            <option value="Error">❌ Error</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[#888] text-xs uppercase border-b border-[#333]">
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Título</th>
                                <th className="px-4 py-3">Mensaje</th>
                                <th className="px-4 py-3">Destinatarios</th>
                                <th className="px-4 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252525]">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[#555] italic">
                                        {logSearch ? 'No se encontraron resultados para tu búsqueda.' : 'Sin registros de envío.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((l) => (
                                    <tr key={l.id} className="text-sm hover:bg-[#222] transition-colors">
                                        <td className="px-4 py-4 text-[#888]">{new Date(l.fecha).toLocaleDateString('es-AR')}</td>
                                        <td className="px-4 py-4 text-white font-medium">{l.titulo}</td>
                                        <td className="px-4 py-4 text-[#aaa] max-w-xs truncate">{l.mensaje}</td>
                                        <td className="px-4 py-4 text-[#888]">{l.destinatarios_count} pers.</td>
                                        <td className={`px-4 py-4 font-bold ${l.estado === 'Exitoso' ? 'text-[#A8D500]' : 'text-red-500'}`}>{l.estado}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#252525]">
                        <span className="text-[#555] text-xs">Página {logPage} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                                disabled={logPage === 1}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                <ChevronLeft size={14} /> Anterior
                            </button>
                            <button
                                onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                                disabled={logPage === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] text-white text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-[#333] transition-all"
                            >
                                Siguiente <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificacionesView;

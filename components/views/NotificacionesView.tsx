'use client'
import React from 'react';
import { Bell, AlertCircle, Trash2, Clock } from 'lucide-react';

interface NotificacionesViewProps {
    tituloPush: string;
    setTituloPush: (v: string) => void;
    mensajePush: string;
    setMensajePush: (v: string) => void;
    filtroHorario: string;
    setFiltroHorario: (v: string) => void;
    enviarNotificacion: () => void;
    enviando: boolean;
    notificacionStatus: any;
    programaciones: any[];
    eliminarProgramacion: (id: string) => void;
    fetchProgramaciones: () => void;
    supabase: any;
    logs: any[];
    logsError: string | null;
}

const NotificacionesView = ({
    tituloPush, setTituloPush, mensajePush, setMensajePush, filtroHorario, setFiltroHorario,
    enviarNotificacion, enviando, notificacionStatus,
    programaciones, eliminarProgramacion, fetchProgramaciones, supabase,
    logs, logsError
}: NotificacionesViewProps) => {

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
                                <option value="09:00">Reunión 09:00 hs</option>
                                <option value="11:00">Reunión 11:00 hs</option>
                                <option value="20:00">Reunión 20:00 hs</option>
                                <option value="Lideres">Solo Líderes</option>
                                <option value="Nuevos">Nuevos (Último mes)</option>
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

                {/* Scheduler Section */}
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h3 className="text-[#FFB400] text-lg font-bold flex items-center gap-2 mb-2">
                        <Clock size={20} /> Programación Automática
                    </h3>
                    <p className="text-[#888] text-xs mb-6">Usa <span className="text-white font-bold">VERSICULO</span> para envíos bíblicos diarios</p>

                    <div className="space-y-4 mb-8">
                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="Mensaje o 'VERSICULO'"
                                id="prog-msj-v2"
                                className="bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFB400]"
                            />
                            <div className="flex gap-2">
                                <select id="prog-dia-v2" className="flex-1 bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none">
                                    <option>Todos los días</option>
                                    <option>Lunes</option><option>Martes</option><option>Miércoles</option>
                                    <option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
                                </select>
                                <input type="time" id="prog-hora-v2" className="flex-1 bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white outline-none" />
                            </div>
                            <button
                                onClick={async () => {
                                    const mensaje = (document.getElementById('prog-msj-v2') as HTMLInputElement).value;
                                    const dia = (document.getElementById('prog-dia-v2') as HTMLSelectElement).value;
                                    const hora = (document.getElementById('prog-hora-v2') as HTMLInputElement).value;
                                    if (!mensaje || !hora) return alert('Completa mensaje y hora');
                                    const { error } = await supabase.from('programaciones').insert([{ mensaje, dia_semana: dia, hora, activo: true, ultimo_estado: 'Pendiente' }]);
                                    if (error) alert('Error');
                                    else {
                                        (document.getElementById('prog-msj-v2') as HTMLInputElement).value = '';
                                        fetchProgramaciones();
                                    }
                                }}
                                className="bg-[#FFB400] text-black font-bold py-3 rounded-xl transition-all active:scale-95"
                            >
                                PROGRAMAR
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {programaciones.map((p) => (
                            <div key={p.id} className="bg-[#252525] p-3 rounded-xl border border-[#333] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${p.ultimo_estado === 'Exitoso' ? 'bg-[#A8D500]' : 'bg-[#555]'}`} />
                                    <div>
                                        <div className={`text-sm font-bold ${p.mensaje === 'VERSICULO' ? 'text-[#FFB400]' : 'text-white'}`}>
                                            {p.mensaje === 'VERSICULO' ? '📖 Versículo Diario' : p.mensaje}
                                        </div>
                                        <div className="text-[10px] text-[#888]">{p.dia_semana} • {p.hora.substring(0, 5)} hs</div>
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

            {/* History Table */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-white text-lg font-bold flex items-center gap-2 mb-6">
                    <AlertCircle size={20} className="text-[#888]" /> Historial de Envío
                </h3>
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
                            {logs.map((l) => (
                                <tr key={l.id} className="text-sm">
                                    <td className="px-4 py-4 text-[#888]">{new Date(l.fecha).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 text-white font-medium">{l.titulo}</td>
                                    <td className="px-4 py-4 text-[#aaa] max-w-xs truncate">{l.mensaje}</td>
                                    <td className="px-4 py-4 text-[#888]">{l.destinatarios_count} pers.</td>
                                    <td className={`px-4 py-4 font-bold ${l.estado === 'Exitoso' ? 'text-[#A8D500]' : 'text-red-500'}`}>{l.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotificacionesView;

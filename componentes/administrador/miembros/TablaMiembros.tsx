import React from 'react';
import { Send, UserCircle } from 'lucide-react';

const TablaMiembros = ({
    paginatedData,
    hoyArg,
    setSelectedMember,
    enviarNotificacionIndividual,
    toggleServerStatus
}: any) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-[#1a1a1a] text-white/90 text-[11px] font-black uppercase tracking-[2px] border-b border-white/5">
                        <th className="px-6 py-5">Miembro</th>
                        <th className="px-6 py-5">Reunión</th>
                        <th className="px-6 py-5 text-center">Hora</th>
                        <th className="px-6 py-5 text-center">Racha</th>
                        <th className="px-6 py-5 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {paginatedData.map((a: any) => {
                        const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
                        return (
                            <tr key={a.id} className="hover:bg-white/[0.03] transition-all group cursor-pointer relative" onClick={() => setSelectedMember(a)}>
                                <td className="px-6 py-4">
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#A8D500] opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></div>
                                    <div className="font-black text-white text-sm">{a.miembros?.nombre} {a.miembros?.apellido}</div>
                                    {esNuevo && <span className="mt-1 inline-block bg-[#A8D500] text-black text-[9px] font-black px-2 py-0.5 rounded-full tracking-tighter">NUEVO</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${a.horario_reunion === 'Extraoficial' ? 'bg-[#FFB400]/20 border-[#FFB400]/40 text-[#FFB400]' : 'bg-white/5 border-white/10 text-white/60'
                                        }`}>
                                        {a.horario_reunion}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white/80 text-sm font-bold text-center">{a.hora_entrada}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className={a.racha >= 4 ? 'text-[#A8D500]' : 'text-white/40'}>
                                            {a.racha >= 4 ? '🔥' : '📍'}
                                        </span>
                                        <span className={`font-black text-sm ${a.racha >= 4 ? 'text-[#A8D500]' : 'text-white/60'}`}>
                                            {a.racha}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-3">
                                        {a.miembros?.token_notificacion && (
                                            <button
                                                onClick={() => enviarNotificacionIndividual(a.miembros.token_notificacion, `${a.miembros.nombre} ${a.miembros.apellido}`)}
                                                className="p-2.5 rounded-xl bg-white/5 text-[#A8D500] hover:bg-[#A8D500] hover:text-black transition-all border border-white/5 shadow-lg"
                                                title="Enviar mensaje personal"
                                            >
                                                <Send size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleServerStatus(a.miembro_id, `${a.miembros.nombre} ${a.miembros.apellido}`, a.miembros?.es_servidor)}
                                            className={`p-2.5 rounded-xl border transition-all shadow-lg ${a.miembros?.es_servidor ? 'bg-[#A8D500] text-black border-[#A8D500]/50' : 'bg-white/5 text-white/30 border-white/5 hover:text-[#A8D500] hover:border-[#A8D500]/30'}`}
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
    );
};

export default TablaMiembros;


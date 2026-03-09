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
                    <tr className="bg-[#252525] text-[#888] text-xs uppercase tracking-wider">
                        <th className="px-6 py-4">Miembro</th>
                        <th className="px-6 py-4">Reunión</th>
                        <th className="px-6 py-4">Hora</th>
                        <th className="px-6 py-4">Racha</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                    {paginatedData.map((a: any) => {
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
                                            onClick={() => toggleServerStatus(a.miembro_id, `${a.miembros.nombre} ${a.miembros.apellido}`, a.miembros?.es_servidor)}
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
    );
};

export default TablaMiembros;


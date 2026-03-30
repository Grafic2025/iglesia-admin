import React from 'react';
import { History, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface UltimaAuditoriaProps {
    logsAuditoria: any[];
}

const UltimaAuditoria = ({ logsAuditoria }: UltimaAuditoriaProps) => {
    // Only take top 5
    const logsRecientes = logsAuditoria.slice(0, 5);

    return (
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A8D500]/10 rounded-xl">
                        <History size={20} className="text-[#A8D500]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-widest text-sm uppercase">Auditoría Reciente</h3>
                        <p className="text-[rgba(255,255,255,0.7)] text-[10px] uppercase font-bold">Actividad de administradores</p>
                    </div>
                </div>
                <Link href="/auditoria" className="text-[10px] text-[#A8D500] font-bold uppercase hover:underline">Ver Todo</Link>
            </div>

            <div className="flex-1 space-y-3">
                {logsRecientes.length === 0 ? (
                    <div className="h-full flex items-center justify-center flex-col text-center opacity-50 p-4">
                        <ShieldAlert size={32} className="text-[rgba(255,255,255,0.5)] mb-2" />
                        <p className="text-[rgba(255,255,255,0.7)] text-xs font-bold uppercase">Sin registros</p>
                    </div>
                ) : (
                    logsRecientes.map((log) => {
                        return (
                            <div key={log.id} className="flex gap-4 bg-[#151515] p-3 rounded-xl border border-white/5">
                                <div className="pt-1">
                                    <div className={`w-2 h-2 rounded-full ${log.accion.includes('ELIMINAR') || log.accion.includes('RECHAZAR') ? 'bg-red-500' :
                                            log.accion.includes('EDITAR') ? 'bg-orange-500' :
                                                log.accion.includes('CREAR') || log.accion.includes('APROBAR') ? 'bg-green-500' :
                                                    'bg-blue-500'
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="text-white font-bold text-xs truncate">{log.administrador_id}</p>
                                        <p className="text-[rgba(255,255,255,0.5)] text-[9px] font-black uppercase whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] leading-tight mt-1 line-clamp-2">
                                        <strong className="text-white/70">{log.accion}</strong> - {log.detalle}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default UltimaAuditoria;

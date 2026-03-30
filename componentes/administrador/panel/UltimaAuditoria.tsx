import React from 'react';
import { History, User, Activity, Clock } from 'lucide-react';

interface AuditLog {
    id: string;
    accion: string;
    detalle: string;
    administrador_id: string;
    created_at: string;
}

interface UltimaAuditoriaProps {
    logsAuditoria: AuditLog[];
}

const UltimaAuditoria = ({ logsAuditoria }: UltimaAuditoriaProps) => {
    return (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/[0.02] rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]">
                        <History size={24} className="text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">Actividad Reciente</h3>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Auditoría de Acciones</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">
                        {logsAuditoria.length} Registros
                    </span>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {logsAuditoria.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                        <Activity size={32} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Sin actividad registrada</p>
                    </div>
                ) : (
                    logsAuditoria.map((log) => (
                        <div 
                            key={log.id} 
                            className="group flex items-start gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[var(--accent)]/30 rounded-2xl transition-all duration-300"
                        >
                            <div className="mt-1 p-2 bg-white/5 rounded-lg group-hover:bg-[var(--accent)]/20 group-hover:text-[var(--accent)] transition-colors">
                                <User size={14} className="opacity-60" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-black text-[var(--accent)] uppercase tracking-wider truncate">
                                        {log.accion}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-white/20 font-medium whitespace-nowrap">
                                        <Clock size={10} />
                                        {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <p className="text-sm text-white/70 font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                                    {log.detalle}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                        Admin: {log.administrador_id}
                                    </span>
                                    <span className="text-[9px] font-medium text-white/10 italic">
                                        {new Date(log.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UltimaAuditoria;

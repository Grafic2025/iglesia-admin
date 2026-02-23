'use client'
import React from 'react';
import { History, Shield, User, Activity } from 'lucide-react';

interface AuditoriaViewProps {
    logs: any[];
}

const AuditoriaView = ({ logs }: AuditoriaViewProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <History className="text-[#A8D500]" /> AUDITORÍA DE ACCIONES
                    </h2>
                    <p className="text-[#888] text-sm italic">Registro de seguridad y trazabilidad de cambios en el sistema</p>
                </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-3xl border border-[#333] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-[#151515] text-[#555] font-black uppercase tracking-widest border-b border-[#333]">
                            <th className="p-5">Fecha y Hora</th>
                            <th className="p-5">Usuario/Admin</th>
                            <th className="p-5">Acción</th>
                            <th className="p-5">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-[#555] italic">No hay registros de auditoría aún.</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#252525] transition-all group">
                                    <td className="p-5 text-white font-medium">
                                        {new Date(log.created_at).toLocaleString('es-AR')}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-[#A8D50015] rounded-lg">
                                                <User size={14} className="text-[#A8D500]" />
                                            </div>
                                            <span className="text-[#888] font-bold">{log.admin_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.accion.includes('ELIMINAR') ? 'bg-red-500/10 text-red-500' :
                                                log.accion.includes('EDITAR') ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {log.accion}
                                        </span>
                                    </td>
                                    <td className="p-5 text-[#888] text-xs">
                                        {log.detalle}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
                <Shield className="text-yellow-500 shrink-0" size={20} />
                <p className="text-yellow-200/50 text-[10px] leading-relaxed uppercase font-bold tracking-wider">
                    ESTE REGISTRO ES INMUTABLE Y SIRVE PARA GARANTIZAR QUE TODAS LAS MODIFICACIONES TENGAN UN RESPONSABLE ASIGNADO.
                </p>
            </div>
        </div>
    );
};

export default AuditoriaView;

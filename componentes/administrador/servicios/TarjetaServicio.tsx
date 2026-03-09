import React from 'react';
import { Calendar, Trash2, Music, Users2, Plus, Save, MessageSquare } from 'lucide-react';

interface TarjetaServicioProps {
    service: any;
    onEdit: (service: any) => void;
    onDelete: (id: string) => void;
    onNotify: (service: any) => void;
    onToggleChat: (service: any) => void;
    onExport: (service: any) => void;
    searchQuery?: string;
}

const TarjetaServicio: React.FC<TarjetaServicioProps> = ({ service, onEdit, onDelete, onNotify, onToggleChat, onExport, searchQuery }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all group relative text-left">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#A8D50010] rounded-lg">
                    <Calendar size={20} className="text-[#A8D500]" />
                </div>
                <button onClick={() => onDelete(service.id)} className="text-red-600 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/10 rounded">
                    <Trash2 size={16} />
                </button>
            </div>
            <h3 className="text-white font-black text-lg uppercase">
                {new Date(service.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h3>
            <p className="text-[#A8D500] font-bold text-xs mb-3">{service.horario}</p>

            <div className="flex gap-4 mt-4 border-t border-[#333] pt-4">
                <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                    <Music size={12} /> {service.orden_canciones?.length || 0} CANCIONES
                </div>
                <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                    <Users2 size={12} /> {service.equipo_ids?.length || 0} PERSONAS
                </div>
            </div>

            {searchQuery && (() => {
                const lowerQ = searchQuery.toLowerCase();
                const matches: string[] = [];
                service.equipo_ids?.forEach((m: any) => {
                    if ((m.nombre && m.nombre.toLowerCase().includes(lowerQ)) || (m.rol && m.rol.toLowerCase().includes(lowerQ))) {
                        matches.push(`${m.nombre || 'Alguien'} \x1b(${m.rol || 'Sin rol'}\x1b)`);
                    }
                });
                service.plan_detallado?.forEach((r: any) => {
                    if (r.responsable && r.responsable.toLowerCase().includes(lowerQ)) {
                        matches.push(`${r.responsable} \x1b(${r.item || 'Item'}\x1b)`);
                    }
                });
                if (matches.length > 0) {
                    return (
                        <div className="mt-3 p-2 bg-[#A8D500]/10 rounded-lg border border-[#A8D500]/20">
                            <p className="text-[#A8D500] text-[10px] font-bold mb-1 uppercase">Resultado de búsqueda:</p>
                            {matches.map((m, i) => (
                                <p key={i} className="text-[#eee] text-[10px] mb-0.5">• {m.replace(/\x1b/g, '')}</p>
                            ))}
                        </div>
                    );
                }
                return null;
            })()}

            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => onEdit(service)}
                    className="flex-1 py-2 bg-[#252525] text-white text-[10px] font-bold rounded-lg border border-[#333] hover:bg-[#A8D500] hover:text-black transition-all uppercase"
                >
                    <Plus size={12} className="inline mr-1" /> Editar
                </button>
                <button
                    onClick={() => onNotify(service)}
                    className="p-2 bg-[#A8D500]/10 text-[#A8D500] rounded-lg border border-[#A8D500]/20 hover:bg-[#A8D500] hover:text-black transition-all"
                    title="Notificar Equipo"
                >
                    <Users2 size={14} />
                </button>
                <button
                    onClick={() => onToggleChat(service)}
                    className={`p-2 rounded-lg border transition-all ${service.chat_activo ? 'bg-[#A8D500] text-black border-[#A8D500]' : 'bg-transparent text-[#888] border-[#333] hover:border-[#A8D500] hover:text-[#A8D500]'}`}
                    title={service.chat_activo ? "Cerrar Chat" : "Abrir Chat"}
                >
                    <MessageSquare size={14} />
                </button>
                <button
                    onClick={() => onExport(service)}
                    className="p-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg border border-[#3B82F6]/20 hover:bg-[#3B82F6] hover:text-white transition-all"
                    title="Exportar CSV"
                >
                    <Save size={14} />
                </button>
            </div>
        </div>
    );
};

export default TarjetaServicio;


import React from 'react';
import { Calendar, Trash2, Music, Users2, Plus, Save } from 'lucide-react';

interface ServiceCardProps {
    service: any;
    onEdit: (service: any) => void;
    onDelete: (id: string) => void;
    onNotify: (service: any) => void;
    onExport: (service: any) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete, onNotify, onExport }) => {
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

export default ServiceCard;

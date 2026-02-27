import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

interface ServiceQuickInfoProps {
    lastServiceDate: any;
    nextSunday: Date;
}

const ServiceQuickInfo: React.FC<ServiceQuickInfoProps> = ({ lastServiceDate, nextSunday }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                <div className="p-3 bg-[#A8D50015] rounded-xl">
                    <CalendarDays size={24} className="text-[#A8D500]" />
                </div>
                <div>
                    <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest">Último Servicio con Asistencia</p>
                    {lastServiceDate ? (
                        <p className="text-white font-bold text-lg">
                            {lastServiceDate.dia} — <span className="text-[#A8D500]">{lastServiceDate.total} personas</span>
                        </p>
                    ) : (
                        <p className="text-[#555] text-sm italic">Sin datos recientes</p>
                    )}
                </div>
            </div>
            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                <div className="p-3 bg-[#00D9FF15] rounded-xl">
                    <Clock size={24} className="text-[#00D9FF]" />
                </div>
                <div>
                    <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest">Próximo Domingo</p>
                    <p className="text-white font-bold text-lg">
                        {nextSunday.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceQuickInfo;

import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

interface ServiceQuickInfoProps {
    lastServiceDate: any;
    nextSundayString: string;
}

const ServiceQuickInfo: React.FC<ServiceQuickInfoProps> = ({ lastServiceDate, nextSundayString }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                <div className="p-3 bg-[var(--accent)15] rounded-xl">
                    <CalendarDays size={24} className="text-[var(--accent)]" />
                </div>
                <div>
                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase tracking-widest">Último Servicio con Asistencia</p>
                    {lastServiceDate ? (
                        <p className="text-white font-bold text-lg">
                            {lastServiceDate.dia} — <span className="text-[var(--accent)]">{lastServiceDate.total} personas</span>
                        </p>
                    ) : (
                        <p className="text-[rgba(255,255,255,0.5)] text-sm italic">Sin datos recientes</p>
                    )}
                </div>
            </div>
            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center gap-4">
                <div className="p-3 bg-[#00D9FF15] rounded-xl">
                    <Clock size={24} className="text-[#00D9FF]" />
                </div>
                <div>
                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase tracking-widest">Próximo Domingo</p>
                    <p className="text-white font-bold text-lg min-h-[28px]">
                        {nextSundayString}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceQuickInfo;


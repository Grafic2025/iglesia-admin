import React from 'react';
import { Calendar, MessageCircle, Phone } from 'lucide-react';

interface AlertCardProps {
    m: any;
    onContact: (m: any) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ m, onContact }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#333] hover:border-red-500/50 transition-all group text-left">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center font-black text-2xl overflow-hidden">
                    {m.foto_url ? <img src={m.foto_url} className="w-full h-full object-cover" alt="" /> : (m.nombre?.[0] || '?')}
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg leading-tight">{m.nombre || 'Sin'} {m.apellido || 'Nombre'}</h3>
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-tighter">Ausencia: +30 DÍAS</p>
                </div>
            </div>

            <div className="bg-[#151515] p-3 rounded-xl border border-[#222] mb-4">
                <div className="flex items-center justify-between text-[10px] uppercase font-black text-[#555]">
                    <span>Última vez visto</span>
                    <span>Zona</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-[#555]" /> {m.ultimoRegistro ? m.ultimoRegistro.toLocaleDateString() : 'Sin registros previos'}</span>
                    <span className="font-bold">{m.zona || 'S/D'}</span>
                </div>
            </div>

            <div className="flex gap-2">
                {m.celular && (
                    <button
                        onClick={() => onContact(m)}
                        className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all px-2"
                    >
                        <MessageCircle size={18} /> WHATSAPP
                    </button>
                )}
                <button className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Phone size={18} />
                </button>
            </div>
        </div>
    );
};

export default AlertCard;

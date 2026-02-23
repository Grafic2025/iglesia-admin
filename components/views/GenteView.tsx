'use client'
import React from 'react';
import { UserPlus, Phone, CheckCircle, Clock } from 'lucide-react';

interface GenteViewProps {
    miembros: any[];
    hoyArg: string;
}

const GenteView = ({ miembros, hoyArg }: GenteViewProps) => {
    // Filter members created in the last 7 days
    const sieteDiasAgo = new Date();
    sieteDiasAgo.setDate(sieteDiasAgo.getDate() - 7);

    const nuevos = miembros.filter(m => new Date(m.created_at) > sieteDiasAgo)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" /> IDS People: Seguimiento
                    </h2>
                    <p className="text-[#888] text-sm italic">Personas que se sumaron en los últimos 7 días</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {nuevos.length === 0 && (
                    <div className="bg-[#1E1E1E] p-10 rounded-2xl border border-[#333] text-center">
                        <span className="text-[#555] italic">No hay registros nuevos esta semana.</span>
                    </div>
                )}

                {nuevos.map((m) => (
                    <div key={m.id} className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center justify-between hover:border-[#00D9FF50] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#00D9FF15] rounded-full flex items-center justify-center text-[#00D9FF] font-bold text-xl">
                                {m.nombre[0]}
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">{m.nombre} {m.apellido}</div>
                                <div className="flex items-center gap-3 text-xs text-[#888] mt-1">
                                    <span className="flex items-center gap-1"><Clock size={12} /> Se unió el {new Date(m.created_at).toLocaleDateString()}</span>
                                    <span className="bg-[#333] px-2 py-0.5 rounded text-[#00D9FF] font-bold">NUEVO</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => window.open(`https://wa.me/${m.celular || ''}`, '_blank')}
                                className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                            >
                                <Phone size={16} /> CONTACTAR
                            </button>
                            <button className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#444] transition-all">
                                <CheckCircle size={16} /> MARCADO
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenteView;

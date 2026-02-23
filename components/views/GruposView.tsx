'use client'
import React from 'react';
import { Home, MapPin, Users, Plus, ChevronRight, MessageCircle } from 'lucide-react';

const GruposView = ({ supabase }: { supabase: any }) => {
    const grupos = [
        { id: 1, name: 'Nexo Palermo', leader: 'Gaby y Eli', members: 12, day: 'Jueves 20:00', type: 'Mixto' },
        { id: 2, name: 'Nexo Belgrano', leader: 'Santi y Mery', members: 8, day: 'Miércoles 19:30', type: 'Jóvenes' },
        { id: 3, name: 'Nexo Caballito', leader: 'Fer y Clau', members: 15, day: 'Martes 20:00', type: 'Matrimonios' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Home className="text-[#A8D500]" /> GRUPOS NEXO
                    </h2>
                    <p className="text-[#888] text-sm italic">Comunidades en casas y grupos de vida</p>
                </div>
                <button className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95">
                    <Plus size={18} /> NUEVO GRUPO
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {grupos.map(group => (
                    <div key={group.id} className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center justify-between hover:border-[#A8D50050] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-[#252525] rounded-2xl flex items-center justify-center text-2xl border border-[#333]">
                                🏡
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg">{group.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[#888] text-xs flex items-center gap-1"><Users size={12} /> Líderes: <span className="text-white">{group.leader}</span></span>
                                    <span className="text-[#888] text-xs flex items-center gap-1"><MapPin size={12} /> {group.type}</span>
                                    <span className="text-[#A8D500] text-xs font-bold">{group.day}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                                <p className="text-white font-bold text-lg">{group.members}</p>
                                <p className="text-[#555] text-[10px] font-bold uppercase tracking-widest">Miembros</p>
                            </div>
                            <button className="p-2.5 bg-[#252525] text-[#A8D500] rounded-xl hover:bg-[#A8D500] hover:text-black transition-all">
                                <MessageCircle size={18} />
                            </button>
                            <button className="p-2.5 bg-[#252525] text-white rounded-xl hover:bg-[#333] transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] mt-8">
                <h3 className="text-white font-bold mb-4">Métricas de Grupos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#151515] p-5 rounded-xl border border-[#222] text-center">
                        <p className="text-[#888] text-xs font-bold uppercase mb-2">Total Grupos</p>
                        <p className="text-white text-3xl font-black">14</p>
                    </div>
                    <div className="bg-[#151515] p-5 rounded-xl border border-[#222] text-center">
                        <p className="text-[#888] text-xs font-bold uppercase mb-2">Personas en Grupos</p>
                        <p className="text-[#A8D500] text-3xl font-black">168</p>
                    </div>
                    <div className="bg-[#151515] p-5 rounded-xl border border-[#222] text-center">
                        <p className="text-[#888] text-xs font-bold uppercase mb-2">% de la Iglesia</p>
                        <p className="text-white text-3xl font-black">64%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GruposView;

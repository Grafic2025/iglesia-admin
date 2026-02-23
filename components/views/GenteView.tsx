'use client'
import React, { useState } from 'react';
import { UserPlus, Phone, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GenteViewProps {
    miembros: any[];
    hoyArg: string;
    fetchMiembros: () => Promise<void>;
}

const GenteView = ({ miembros, hoyArg, fetchMiembros }: GenteViewProps) => {
    const [search, setSearch] = useState('');

    // Filter members based on search
    const filteredMiembros = miembros.filter(m =>
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(search.toLowerCase())
    );

    const toggleServerStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: !currentStatus })
            .eq('id', id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            await fetchMiembros();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="text-[#00D9FF]" /> Base de Datos de Miembros
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestioná toda la gente de la iglesia y sus permisos</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o apellido..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00D9FF] transition-all"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredMiembros.length === 0 && (
                    <div className="bg-[#1E1E1E] p-10 rounded-2xl border border-[#333] text-center">
                        <span className="text-[#555] italic">No se encontraron miembros con ese nombre.</span>
                    </div>
                )}

                {filteredMiembros.map((m) => {
                    const sieteDiasAgo = new Date();
                    sieteDiasAgo.setDate(sieteDiasAgo.getDate() - 7);
                    const esNuevo = new Date(m.created_at) > sieteDiasAgo;

                    return (
                        <div key={m.id} className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333] flex items-center justify-between hover:border-[#00D9FF50] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${m.es_servidor ? 'bg-[#A8D50020] text-[#A8D500]' : 'bg-[#00D9FF15] text-[#00D9FF]'} rounded-full flex items-center justify-center font-bold text-xl overflow-hidden`}>
                                    {m.foto_url ? (
                                        <img src={m.foto_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        m.nombre[0]
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-white font-bold text-lg">{m.nombre} {m.apellido}</div>
                                        {m.es_servidor && (
                                            <span title="Servidor Activo">
                                                <ShieldCheck size={16} className="text-[#A8D500]" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#888] mt-1">
                                        <span className="flex items-center gap-1">📍 Se unió el {new Date(m.created_at).toLocaleDateString()}</span>
                                        {esNuevo && <span className="bg-[#00D9FF20] px-2 py-0.5 rounded text-[#00D9FF] font-bold">NUEVO</span>}
                                        {m.es_servidor && <span className="bg-[#A8D50020] px-2 py-0.5 rounded text-[#A8D500] font-bold">SERVIDOR</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {m.celular && (
                                    <button
                                        onClick={() => window.open(`https://wa.me/${m.celular.replace(/\D/g, '')}`, '_blank')}
                                        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all"
                                    >
                                        <Phone size={16} /> WHATSAPP
                                    </button>
                                )}
                                <button
                                    onClick={() => toggleServerStatus(m.id, m.es_servidor)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${m.es_servidor
                                        ? 'bg-[#A8D500] text-black shadow-[0_0_15px_rgba(168,213,0,0.3)]'
                                        : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-white'
                                        }`}
                                >
                                    <UserCircle size={16} />
                                    {m.es_servidor ? 'ES SERVIDOR' : 'HACER SERVIDOR'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GenteView;

import React from 'react';
import { Gift, User } from 'lucide-react';
import { Miembro } from '../../../libreria/tipos';

interface ProximosCumpleanosProps {
    cumpleanos: Miembro[];
}

const ProximosCumpleanos = ({ cumpleanos }: ProximosCumpleanosProps) => {
    return (
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#FFB400]/10 rounded-xl">
                    <Gift size={20} className="text-[#FFB400]" />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-widest text-sm">PRÓXIMOS CUMPLEAÑOS</h3>
                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] uppercase font-bold">Esta semana</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {cumpleanos.length === 0 ? (
                    <div className="h-full flex items-center justify-center flex-col text-center opacity-50 p-4">
                        <Gift size={32} className="text-[rgba(255,255,255,0.5)] mb-2" />
                        <p className="text-[rgba(255,255,255,0.7)] text-xs font-bold uppercase">No hay cumpleaños cercanos</p>
                    </div>
                ) : (
                    cumpleanos.map((m, i) => {
                        const esHoy = false; // We can evaluate this

                        // Parse birthday string safely avoiding timezone drift
                        let fechaStr = '';
                        if (m.fecha_nacimiento) {
                            const [yyyy, mm, dd] = m.fecha_nacimiento.split('-');
                            fechaStr = `${dd}/${mm}`;
                        }

                        return (
                            <div key={m.id} className="group relative flex items-center gap-4 bg-[#151515] p-3 rounded-xl border border-white/5 hover:border-[#FFB400]/30 transition-all">
                                <div className="absolute -left-1.5 w-1 h-0 bg-[#FFB400] rounded-r-full transition-all group-hover:h-1/2 top-1/2 -translate-y-1/2"></div>
                                <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#333] flex items-center justify-center overflow-hidden shrink-0">
                                    {m.foto_perfil || m.foto_url ? (
                                        <img src={m.foto_perfil || m.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-[rgba(255,255,255,0.5)]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{m.nombre} {m.apellido}</p>
                                    <p className="text-[10px] text-accent uppercase font-black tracking-wider">
                                        {fechaStr}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default ProximosCumpleanos;

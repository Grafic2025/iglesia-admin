import React from 'react';
import { Droplets, Info } from 'lucide-react';

interface SidebarSectionsProps {
    bautismos: any[];
    ayuda: any[];
}

const SidebarSections: React.FC<SidebarSectionsProps> = ({ bautismos, ayuda }) => {
    return (
        <div className="space-y-6">
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-[#00D9FF] text-lg font-bold flex items-center gap-2 mb-6">
                    <Droplets size={20} /> Bautismos
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {bautismos.length === 0 && <p className="text-[#555] text-center py-4 italic">Sin solicitudes nuevas</p>}
                    {bautismos.map((b) => (
                        <div key={b.id} className="bg-[#252525] p-4 rounded-xl border border-[#333] text-left">
                            <div className="text-white font-bold">{b.miembros?.nombre} {b.miembros?.apellido}</div>
                            <div className="flex gap-4 mt-2">
                                <div className="text-[10px] text-[#888]">Edad: <span className="text-white">{b.edad}</span></div>
                                <div className="text-[10px] text-[#888]">Grupo: <span className="text-white">{b.pertenece_grupo}</span></div>
                            </div>
                            <div className="text-[10px] text-[#00D9FF] mt-1 font-bold">Cel: {b.celular}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-red-500 text-lg font-bold flex items-center gap-2 mb-6">
                    <Info size={20} /> Pedidos de Ayuda
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {ayuda.length === 0 && <p className="text-[#555] text-center py-4 italic">Todo en orden</p>}
                    {ayuda.map((a) => (
                        <div key={a.id} className="bg-[#252525] p-4 rounded-xl border border-[#333] text-left">
                            <div className="text-white font-bold">{a.miembros?.nombre} {a.miembros?.apellido}</div>
                            <div className="text-[#aaa] text-xs mt-2 italic">"{a.mensaje}"</div>
                            <div className="text-[10px] text-red-500 mt-2 font-bold">Cel: {a.celular}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SidebarSections;

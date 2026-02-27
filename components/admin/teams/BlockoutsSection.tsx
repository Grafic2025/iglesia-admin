import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface BlockoutsSectionProps {
    blockouts: any[];
}

const BlockoutsSection: React.FC<BlockoutsSectionProps> = ({ blockouts }) => {
    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#FFB400]" /> BLOQUEOS (Indisponibilidad)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {blockouts.length === 0 ? (
                    <p className="text-[#555] italic text-sm p-3">No hay bloqueos registrados próximamente.</p>
                ) : (
                    blockouts.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-xl border border-red-500/20">
                            <div>
                                <p className="text-white font-bold text-sm">{b.name}</p>
                                <p className="text-red-400 text-[10px] font-bold uppercase">{b.reason}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#888] text-xs">{b.date}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BlockoutsSection;

import React from 'react';
import { Users } from 'lucide-react';

interface EstadisticasAlertaProps {
    count: number;
}

const EstadisticasAlerta: React.FC<EstadisticasAlertaProps> = ({ count }) => {
    return (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="bg-red-500 p-3 rounded-xl text-white">
                <Users size={24} />
            </div>
            <div>
                <p className="text-white font-bold text-lg">{count} Miembros en Riesgo</p>
                <p className="text-red-400 text-xs font-medium">Se recomienda realizar un seginterfazmiento telefónico o presencial.</p>
            </div>
        </div>
    );
};

export default EstadisticasAlerta;


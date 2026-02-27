import React from 'react';
import { Users2, ShieldAlert, Trash2, Plus } from 'lucide-react';

interface TeamCardProps {
    team: any;
    onSelect: (team: any) => void;
    onToggleBlock: (team: any, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelect, onToggleBlock, onDelete }) => {
    return (
        <div
            onClick={() => onSelect(team)}
            className={`bg-[#1E1E1E] p-6 rounded-2xl border ${team.bloqueado ? 'border-red-500/50 grayscale' : 'border-[#333]'} hover:border-[#A8D50050] transition-all cursor-pointer group relative`}
        >
            <div className="absolute top-4 right-4 flex gap-1">
                <button
                    onClick={(e) => onToggleBlock(team, e)}
                    className={`p-2 rounded-lg transition-all ${team.bloqueado ? 'bg-red-500 text-white' : 'text-[#555] hover:bg-[#333]'}`}
                    title={team.bloqueado ? "Desbloquear equipo" : "Bloquear equipo (Mantenimiento/Baja)"}
                >
                    <ShieldAlert size={14} />
                </button>
                <button
                    onClick={(e) => onDelete(team.id, e)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Eliminar equipo"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="text-4xl mb-4">{team.icono || '👥'}</div>
            <h4 className="text-white font-bold text-lg flex items-center gap-2">
                {team.nombre}
                {team.bloqueado && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">BLOQUEADO</span>}
            </h4>
            <p className="text-[#888] text-sm mb-4">{team.members} Voluntarios</p>
            <div className="text-[#A8D500] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {team.bloqueado ? 'EQUIPO EN MANTENIMIENTO' : 'VER VOLUNTARIOS'} <Plus size={12} />
            </div>
        </div>
    );
};

export default TeamCard;

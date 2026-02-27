import React from 'react';

interface MemberRewardsProps {
    premiosPendientes: any;
    premiosEntregados: any[];
    marcarComoEntregado: (id: string, nivel: number, nombre: string) => void;
}

const MemberRewards: React.FC<MemberRewardsProps> = ({ premiosPendientes, premiosEntregados, marcarComoEntregado }) => {
    const rewardLevels = [
        { level: 30, title: 'Entrada a Retiro (30+ asistencias)', icon: '🎟️', color: '#9333EA', key: 'nivel30' },
        { level: 20, title: 'Libro Cristiano (20-29 asistencias)', icon: '📚', color: '#3B82F6', key: 'nivel20' },
        { level: 10, title: 'Café Gratis (10-19 asistencias)', icon: '☕', color: '#FFB400', key: 'nivel10' },
        { level: 5, title: 'Sticker IDS (5-9 asistencias)', icon: '⭐', color: '#A8D500', key: 'nivel5' },
    ];

    const hasAnyRewards = rewardLevels.some(rl => premiosPendientes[rl.key]?.length > 0);

    if (!hasAnyRewards) return null;

    return (
        <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] mb-6">
            <h3 className="text-[#9333EA] text-lg font-bold mb-2">🎁 Premios Pendientes</h3>
            <p className="text-[#888] text-sm mb-6">Metas alcanzadas en los últimos 30 días</p>

            <div className="space-y-6">
                {rewardLevels.map((rl) => (
                    premiosPendientes[rl.key]?.length > 0 && (
                        <div key={rl.key}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{rl.icon}</span>
                                <h4 className="text-white font-medium">{rl.title}</h4>
                                <span className="bg-[#333] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                    {premiosPendientes[rl.key].length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-left">
                                {premiosPendientes[rl.key].map((m: any) => {
                                    const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === rl.level);
                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${yaEntregado ? 'bg-[#151515] border-[#222]' : 'bg-[#252525] border-[#333]'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`${yaEntregado ? 'text-[#555]' : 'text-white'} text-sm font-medium`}>
                                                    {m.nombre} {m.apellido}
                                                </span>
                                                <span className="text-[10px] font-bold" style={{ color: rl.color }}>🔥 {m.racha}</span>
                                            </div>
                                            {yaEntregado ? (
                                                <span className="text-[#A8D500]">✅</span>
                                            ) : (
                                                <button
                                                    onClick={() => marcarComoEntregado(m.id, rl.level, `${m.nombre} ${m.apellido}`)}
                                                    className="text-[10px] uppercase font-bold px-2 py-1 rounded-md transition-all active:scale-95"
                                                    style={{ backgroundColor: rl.color, color: rl.level === 30 || rl.level === 20 ? '#fff' : '#000' }}
                                                >
                                                    Entregar
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default MemberRewards;

'use client'
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FinanzasView = ({ supabase }: { supabase: any }) => {
    const transactions = [
        { id: 1, type: 'ingreso', desc: 'Diezmos y Ofrendas (MercadoPago)', amount: 45000, date: 'Hoy' },
        { id: 2, type: 'ingreso', desc: 'Diezmos y Ofrendas (Transferencia)', amount: 120000, date: 'Hoy' },
        { id: 3, type: 'egreso', desc: 'Pago Electricidad (Sede)', amount: 15400, date: 'Ayer' },
        { id: 4, type: 'egreso', desc: 'Mantenimiento Sonido', amount: 8000, date: 'Hace 2 días' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-[#A8D500]" /> FINANZAS
                    </h2>
                    <p className="text-[#888] text-sm italic">Gestión de ingresos, egresos y presupuesto</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-[#252525] text-[#888] font-bold px-4 py-2.5 rounded-xl border border-[#333] flex items-center gap-2 hover:border-[#A8D500] hover:text-white transition-all">
                        <Download size={18} /> EXPORTAR
                    </button>
                    <button className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95">
                        <Plus size={18} /> CARGAR MOVIMIENTO
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333]">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp size={20} className="text-[#A8D500]" />
                        <span className="text-[#A8D500] text-[10px] font-bold bg-[#A8D50010] px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                    <p className="text-[#888] text-xs font-bold uppercase">Ingresos Mes</p>
                    <p className="text-white text-2xl font-black mt-1">$450.200</p>
                </div>
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333]">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown size={20} className="text-red-500" />
                        <span className="text-red-500 text-[10px] font-bold bg-red-500/10 px-2 py-0.5 rounded-full">-5%</span>
                    </div>
                    <p className="text-[#888] text-xs font-bold uppercase">Egresos Mes</p>
                    <p className="text-white text-2xl font-black mt-1">$120.450</p>
                </div>
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333]">
                    <div className="flex items-center justify-between mb-2">
                        <Target size={20} className="text-[#3B82F6]" />
                    </div>
                    <p className="text-[#888] text-xs font-bold uppercase">Saldo Neto</p>
                    <p className="text-[#3B82F6] text-2xl font-black mt-1">$329.750</p>
                </div>
                <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-[#333]">
                    <p className="text-[#888] text-xs font-bold uppercase mb-4">Meta Mensual</p>
                    <div className="h-2 bg-[#252525] rounded-full overflow-hidden mb-2 border border-[#333]">
                        <div className="h-full bg-[#A8D500]" style={{ width: '75%' }} />
                    </div>
                    <p className="text-white text-[10px] font-bold">75.0% alcanzado</p>
                </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 bg-[#252525] border-b border-[#333]">
                    <h3 className="text-white font-bold text-sm">Últimos Movimientos</h3>
                </div>
                <div className="divide-y divide-[#252525]">
                    {transactions.map(t => (
                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-[#222] transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'ingreso' ? 'bg-[#A8D50010] text-[#A8D500]' : 'bg-red-500/10 text-red-500'}`}>
                                    {t.type === 'ingreso' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{t.desc}</p>
                                    <p className="text-[#555] text-xs">{t.date}</p>
                                </div>
                            </div>
                            <p className={`font-black text-lg ${t.type === 'ingreso' ? 'text-[#A8D500]' : 'text-white'}`}>
                                {t.type === 'ingreso' ? '+' : '-'} ${t.amount.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinanzasView;

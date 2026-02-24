'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Phone, Users, Calendar, Search, ChevronRight, MessageCircle } from 'lucide-react';

interface AlertasViewProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

const AlertasView = ({ supabase, registrarAuditoria }: AlertasViewProps) => {
    const [loading, setLoading] = useState(true);
    const [miembros, setMiembros] = useState<any[]>([]);
    const [asistencias, setAsistencias] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get last 4 Sundays approx
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30); // 30 days ago

            const [mRes, aRes] = await Promise.all([
                supabase.from('miembros').select('*').eq('activo', true),
                supabase.from('asistencias').select('miembro_id, fecha').gte('fecha', cutoff.toISOString().split('T')[0])
            ]);

            setMiembros(mRes.data || []);
            setAsistencias(aRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const alertas = useMemo(() => {
        return miembros.map(m => {
            const susAsistencias = asistencias.filter(a => a.miembro_id === m.id);
            // Count Sundays missed (simplified: if they have 0 asistencias in last 30 days)
            const faltasConsecutivas = susAsistencias.length === 0;

            // Calculate last seen
            const times = susAsistencias.map(a => new Date(a.fecha).getTime()).filter(t => !isNaN(t));
            const lastSeen = times.length > 0
                ? new Date(Math.max(...times))
                : null;

            return {
                ...m,
                alerta: faltasConsecutivas,
                ultimoRegistro: lastSeen
            };
        }).filter(m => {
            const fullName = `${m.nombre || ''} ${m.apellido || ''}`.toLowerCase();
            const matchSearch = !search || fullName.includes(search.toLowerCase());
            return m.alerta && matchSearch;
        });
    }, [miembros, asistencias, search]);

    if (loading) return <div className="text-white p-10 text-center">Calculando informes de retención...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> ALERTAS PASTORALES
                    </h2>
                    <p className="text-[#888] text-sm italic">Miembros que no han asistido en los últimos 30 días</p>
                </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-red-500 p-3 rounded-xl text-white">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-white font-bold text-lg">{alertas.length} Miembros en Riesgo</p>
                    <p className="text-red-400 text-xs font-medium">Se recomienda realizar un seguimiento telefónico o presencial.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                <input
                    type="text"
                    placeholder="Buscar entre los miembros en alerta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#333] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-500 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertas.length === 0 && (
                    <div className="col-span-2 text-center py-20 bg-[#1E1E1E] rounded-3xl border border-[#333]">
                        <p className="text-[#555] italic">¡Excelente! No hay miembros con ausencias prolongadas detectadas.</p>
                    </div>
                )}
                {alertas.map(m => (
                    <div key={m.id} className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#333] hover:border-red-500/50 transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center font-black text-2xl overflow-hidden">
                                {m.foto_url ? <img src={m.foto_url} className="w-full h-full object-cover" /> : (m.nombre?.[0] || '?')}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg leading-tight">{m.nombre || 'Sin'} {m.apellido || 'Nombre'}</h3>
                                <p className="text-red-400 text-[10px] font-black uppercase tracking-tighter">Ausencia: +30 DÍAS</p>
                            </div>
                        </div>

                        <div className="bg-[#151515] p-3 rounded-xl border border-[#222] mb-4">
                            <div className="flex items-center justify-between text-[10px] uppercase font-black text-[#555]">
                                <span>Última vez visto</span>
                                <span>Zona</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-white mt-1">
                                <span className="flex items-center gap-1"><Calendar size={12} className="text-[#555]" /> {m.ultimoRegistro ? m.ultimoRegistro.toLocaleDateString() : 'Sin registros previos'}</span>
                                <span className="font-bold">{m.zona || 'S/D'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {m.celular && (
                                <button
                                    onClick={() => {
                                        window.open(`https://wa.me/${(m.celular || '').replace(/\D/g, '')}?text=Hola%20${m.nombre || ''},%20te%20escribimos%20de%20la%20Iglesia%20del%20Salvador,%20esperamos%20que%20estés%20bien!%20Te%20extrañamos%20por%20acá.`, '_blank');
                                        if (registrarAuditoria) registrarAuditoria('SEGUIMIENTO PASTORAL', `Se inició contacto con ${m.nombre} ${m.apellido}`);
                                    }}
                                    className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                >
                                    <MessageCircle size={18} /> WHATSAPP
                                </button>
                            )}
                            <button className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                <Phone size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertasView;

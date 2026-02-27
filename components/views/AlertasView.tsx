'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Search } from 'lucide-react';

// Modular Components
import AlertCard from '../admin/alerts/AlertCard';
import AlertStats from '../admin/alerts/AlertStats';

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
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);

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

    const handleContact = (m: any) => {
        const phone = (m.celular || '').replace(/\D/g, '');
        const text = `Hola ${m.nombre || ''}, te escribimos de la Iglesia del Salvador, esperamos que estés bien! Te extrañamos por acá.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
        if (registrarAuditoria) registrarAuditoria('SEGUIMIENTO PASTORAL', `Se inició contacto con ${m.nombre} ${m.apellido}`);
    };

    const alertas = useMemo(() => {
        return miembros.map(m => {
            const susAsistencias = asistencias.filter(a => a.miembro_id === m.id);
            const faltasConsecutivas = susAsistencias.length === 0;
            const times = susAsistencias.map(a => new Date(a.fecha).getTime()).filter(t => !isNaN(t));
            const lastSeen = times.length > 0 ? new Date(Math.max(...times)) : null;

            return { ...m, alerta: faltasConsecutivas, ultimoRegistro: lastSeen };
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

            <AlertStats count={alertas.length} />

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
                    <AlertCard key={m.id} m={m} onContact={handleContact} />
                ))}
            </div>
        </div>
    );
};

export default AlertasView;

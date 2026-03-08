import { useState, useEffect, useMemo } from 'react';

interface UseAlertasProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function useAlertas({ supabase, registrarAuditoria }: UseAlertasProps) {
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

    return {
        loading,
        search,
        setSearch,
        alertas,
        handleContact,
        fetchData
    };
}

import { useState } from 'react';

interface UseAgendaConfigProps {
    supabase: any;
    horariosDisponibles: any[];
    fetchHorarios: () => Promise<void>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function useAgendaConfig({ supabase, horariosDisponibles, fetchHorarios, registrarAuditoria }: UseAgendaConfigProps) {
    const [newHorario, setNewHorario] = useState('');

    const handleAdd = async () => {
        if (!newHorario) return;
        if (horariosDisponibles.includes(newHorario)) return alert("Este horario ya existe");

        const updated = [...horariosDisponibles, newHorario].sort();
        const { error } = await supabase
            .from('configuracion')
            .upsert({ clave: 'horarios_reunion', valor: updated }, { onConflict: 'clave' });

        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) registrarAuditoria('AGREGAR HORARIO', `Se añadió ${newHorario}`);
            setNewHorario('');
            fetchHorarios();
        }
    };

    const handleRemove = async (h: string) => {
        if (!confirm(`¿Eliminar el horario ${h}? Esto no borrará asistencias pasadas, pero ya no aparecerá como opción.`)) return;

        const updated = horariosDisponibles.filter(item => item !== h);
        const { error } = await supabase
            .from('configuracion')
            .upsert({ clave: 'horarios_reunion', valor: updated }, { onConflict: 'clave' });

        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) registrarAuditoria('ELIMINAR HORARIO', `Se quitó ${h}`);
            fetchHorarios();
        }
    };

    return {
        newHorario,
        setNewHorario,
        handleAdd,
        handleRemove
    };
}

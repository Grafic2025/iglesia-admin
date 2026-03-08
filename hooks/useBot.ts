import { useState, useEffect } from 'react';

interface UseBotProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function useBot({ supabase, registrarAuditoria }: UseBotProps) {
    const [aprendizaje, setAprendizaje] = useState<any[]>([]);
    const [cerebro, setCerebro] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'aprendizaje' | 'cerebro'>('aprendizaje');

    const [showModal, setShowModal] = useState(false);
    const [currentKnowledge, setCurrentKnowledge] = useState<any>(null);
    const [palabrasClave, setPalabrasClave] = useState('');
    const [respuesta, setRespuesta] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const { data: a } = await supabase.from('ids_bot_aprendizaje').select('*').order('fecha', { ascending: false });
        const { data: c } = await supabase.from('ids_bot_cerebro').select('*');
        setAprendizaje(a || []);
        setCerebro(c || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveKnowledge = async () => {
        if (!palabrasClave || !respuesta) return;

        const payload = {
            palabras_clave: palabrasClave,
            respuesta
        };

        let err;
        if (currentKnowledge?.id) {
            const { error } = await supabase.from('ids_bot_cerebro').update(payload).eq('id', currentKnowledge.id);
            err = error;
        } else {
            const { error } = await supabase.from('ids_bot_cerebro').insert([payload]);
            err = error;
            if (currentKnowledge?.fromAprendizajeId) {
                await supabase.from('ids_bot_aprendizaje').delete().eq('id', currentKnowledge.fromAprendizajeId);
            }
        }

        if (err) alert("Error: " + err.message);
        else {
            if (registrarAuditoria) registrarAuditoria(currentKnowledge?.id ? 'EDITAR CEREBRO BOT' : 'AGREGAR CEREBRO BOT', palabrasClave);
            setShowModal(false);
            fetchData();
        }
    };

    const deleteAprendizaje = async (id: string) => {
        if (!confirm('¿Borrar esta pregunta?')) return;
        await supabase.from('ids_bot_aprendizaje').delete().eq('id', id);
        fetchData();
    };

    const deleteCerebro = async (id: string) => {
        if (!confirm('¿Eliminar este conocimiento?')) return;
        await supabase.from('ids_bot_cerebro').delete().eq('id', id);
        fetchData();
    };

    const openEnseñar = (pregunta: any) => {
        setCurrentKnowledge({ fromAprendizajeId: pregunta.id });
        setPalabrasClave(pregunta.pregunta);
        setRespuesta('');
        setShowModal(true);
    };

    return {
        aprendizaje,
        cerebro,
        loading,
        activeTab,
        setActiveTab,
        showModal,
        setShowModal,
        currentKnowledge,
        setCurrentKnowledge,
        palabrasClave,
        setPalabrasClave,
        respuesta,
        setRespuesta,
        fetchData,
        handleSaveKnowledge,
        deleteAprendizaje,
        deleteCerebro,
        openEnseñar
    };
}

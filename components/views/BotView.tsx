'use client'
import React, { useState, useEffect } from 'react';
import { Bot, Brain, Search, Trash2, Plus, ArrowRight, MessageSquare, Sparkles, History, CheckCircle2, Clock } from 'lucide-react';

interface BotViewProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

const BotView = ({ supabase, registrarAuditoria }: BotViewProps) => {
    const [aprendizaje, setAprendizaje] = useState<any[]>([]);
    const [cerebro, setCerebro] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'aprendizaje' | 'cerebro'>('aprendizaje');

    // Form para agregar/editar conocimiento
    const [showModal, setShowModal] = useState(false);
    const [currentKnowledge, setCurrentKnowledge] = useState<any>(null);
    const [palabrasClave, setPalabrasClave] = useState('');
    const [respuesta, setRespuesta] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: a } = await supabase.from('ids_bot_aprendizaje').select('*').order('fecha', { ascending: false });
        const { data: c } = await supabase.from('ids_bot_cerebro').select('*');
        setAprendizaje(a || []);
        setCerebro(c || []);
        setLoading(false);
    };

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
            // Si viene de una pregunta de aprendizaje, podríamos borrarla
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full min-h-full pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-[#A8D50015] rounded-xl"><Bot className="text-[#A8D500]" size={28} /></div>
                        IDS BOT: Área de Entrenamiento
                    </h2>
                    <p className="text-[#888] text-sm mt-1">Gestiona el cerebro y el aprendizaje de la Inteligencia Del Salvador.</p>
                </div>

                <div className="flex bg-[#1E1E1E] p-1.5 rounded-2xl border border-[#333]">
                    <button
                        onClick={() => setActiveTab('aprendizaje')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'aprendizaje' ? 'bg-[#A8D500] text-black shadow-lg shadow-[#A8D50015]' : 'text-[#888] hover:text-white'}`}
                    >
                        <Sparkles size={14} /> LO QUE NO SÉ ({aprendizaje.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('cerebro')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'cerebro' ? 'bg-[#A8D500] text-black shadow-lg shadow-[#A8D50015]' : 'text-[#888] hover:text-white'}`}
                    >
                        <Brain size={14} /> MI CEREBRO ({cerebro.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-[#555] animate-pulse">Cargando datos del bot...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'aprendizaje' ? (
                        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#333] shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-white text-xl font-bold flex items-center gap-3">
                                    <History className="text-[#A8D500]" size={22} /> Consultas pendientes de aprendizaje
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {aprendizaje.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-[#252525] rounded-3xl">
                                        <p className="text-[#444] italic">El bot ha respondido todo correctamente hasta ahora.</p>
                                    </div>
                                ) : (
                                    aprendizaje.map((a) => (
                                        <div key={a.id} className="bg-[#151515] p-5 rounded-2xl border border-[#252525] hover:border-[#A8D50050] transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-lg italic">"{a.pregunta}"</p>
                                                    <p className="text-[#555] text-[10px] font-black uppercase mt-1 flex items-center gap-1.5">
                                                        <Clock size={10} /> {new Date(a.fecha).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openEnseñar(a)}
                                                    className="bg-[#A8D500] text-black px-5 py-2.5 rounded-xl font-black text-[10px] hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-[#A8D50015]"
                                                >
                                                    ENSEÑAR <ArrowRight size={14} />
                                                </button>
                                                <button onClick={() => deleteAprendizaje(a.id)} className="p-2.5 text-[#444] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#333] shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-white text-xl font-bold flex items-center gap-3">
                                    <CheckCircle2 className="text-[#A8D500]" size={22} /> Conocimiento adquirido
                                </h3>
                                <button
                                    onClick={() => { setCurrentKnowledge(null); setPalabrasClave(''); setRespuesta(''); setShowModal(true); }}
                                    className="bg-[#252525] text-white px-5 py-2.5 rounded-xl font-black text-[10px] border border-[#333] hover:bg-[#A8D500] hover:text-black transition-all"
                                >
                                    + AGREGAR MANUALMENTE
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cerebro.map((c) => (
                                    <div key={c.id} className="bg-[#151515] p-6 rounded-2xl border border-[#252525] hover:border-[#A8D50030] transition-all relative group">
                                        <div className="mb-4">
                                            <label className="text-[9px] font-black text-[#A8D500] uppercase tracking-widest block mb-1">Palabras Clave</label>
                                            <p className="text-white font-bold">{c.palabras_clave}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-[#666] uppercase tracking-widest block mb-1">Respuesta del Bot</label>
                                            <p className="text-[#AAA] text-sm leading-relaxed">{c.respuesta}</p>
                                        </div>
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setCurrentKnowledge(c); setPalabrasClave(c.palabras_clave); setRespuesta(c.respuesta); setShowModal(true); }}
                                                className="p-2 bg-[#252525] rounded-lg text-blue-400 hover:bg-blue-400/10 transition-all"
                                            >
                                                <History size={16} />
                                            </button>
                                            <button onClick={() => deleteCerebro(c.id)} className="p-2 bg-[#252525] rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-2xl rounded-[32px] border border-[#333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-[#A8D500] p-6 flex items-center gap-4">
                            <div className="bg-black/10 p-2.5 rounded-2xl"><Sparkles className="text-black" size={24} /></div>
                            <div>
                                <h3 className="text-black font-black text-xl tracking-tight">
                                    {currentKnowledge?.id ? 'Editar Conocimiento' : 'Enseñar Nueva Respuesta'}
                                </h3>
                                <p className="text-black/60 text-xs font-bold uppercase tracking-widest">IDS Bot Intelligence</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[#888] text-[10px] font-black uppercase tracking-widest mb-2 block">Palabras Clave (¿Qué preguntará el usuario?)</label>
                                <input
                                    value={palabrasClave}
                                    onChange={e => setPalabrasClave(e.target.value)}
                                    placeholder="Ej: horario reunion, cuando empieza..."
                                    className="w-full bg-[#222] border border-[#333] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#A8D500] transition-all"
                                />
                                <p className="text-[#555] text-[10px] mt-2 italic font-medium">El bot buscará coincidencias entre estas palabras y lo que escriba el usuario.</p>
                            </div>

                            <div>
                                <label className="text-[#888] text-[10px] font-black uppercase tracking-widest mb-2 block">Respuesta del Bot</label>
                                <textarea
                                    value={respuesta}
                                    onChange={e => setRespuesta(e.target.value)}
                                    placeholder="Escribe aquí la respuesta que dará el bot..."
                                    rows={5}
                                    className="w-full bg-[#222] border border-[#333] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#A8D500] transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-[#252525] text-white font-black text-xs rounded-2xl border border-[#333] hover:bg-[#333] transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleSaveKnowledge}
                                    className="flex-3 py-4 bg-[#A8D500] text-black font-black text-xs rounded-2xl shadow-xl shadow-[#A8D50020] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    GUARDAR CONOCIMIENTO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BotView;

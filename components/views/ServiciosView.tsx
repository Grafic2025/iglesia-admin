'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Save, Trash2, GripVertical } from 'lucide-react';

interface Row {
    id: string;
    tiempo: string;
    actividad: string;
    responsable: string;
}

const ServiciosView = ({ supabase }: { supabase: any }) => {
    const [rows, setRows] = useState<Row[]>([]);
    const [notasTecnicas, setNotasTecnicas] = useState('');
    const [versiculoLema, setVersiculoLema] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            const { data, error } = await supabase
                .from('servicios_plan')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const plan = data[0];
                setRows(plan.items || []);
                setNotasTecnicas(plan.notas_multimedia || '');
                setVersiculoLema(plan.versiculo_lema || '');
            } else {
                setRows([
                    { id: '1', tiempo: '10 min', actividad: 'Alabanza y Adoración', responsable: 'Banda' },
                    { id: '2', tiempo: '5 min', actividad: 'Avisos y Bienvenida', responsable: 'Pastores' },
                    { id: '3', tiempo: '35 min', actividad: 'Predicación', responsable: 'Pastor' },
                ]);
            }
            setLoading(false);
        };
        fetchPlan();
    }, [supabase]);

    const handleSave = async () => {
        const { error } = await supabase.from('servicios_plan').insert([{
            items: rows,
            notas_multimedia: notasTecnicas,
            versiculo_lema: versiculoLema,
            horario: '11:00 HS'
        }]);
        if (error) alert("Error al guardar planilla: " + error.message);
        else alert("✅ Plan de servicio guardado correctamente");
    };

    const addRow = () => {
        const newId = (rows.length + 1).toString();
        setRows([...rows, { id: newId, tiempo: '', actividad: '', responsable: '' }]);
    };

    const removeRow = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: string, field: keyof Row, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    if (loading) return <div className="text-[#A8D500] p-10 text-center animate-pulse font-bold">CARGANDO PLAN...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-[#A8D500]" /> IDS Services
                    </h2>
                    <p className="text-[#888] text-sm italic">Planificación del Culto "Minuto a Minuto"</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Save size={18} /> GUARDAR PLAN
                </button>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl border border-[#333] overflow-hidden">
                <div className="p-4 bg-[#252525] border-b border-[#333] flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Próximo Domingo - 11:00 HS</span>
                    <div className="flex gap-4">
                        <div className="text-[10px] text-[#888] flex items-center gap-1">
                            <Clock size={12} /> Duración Total estimada: <span className="text-[#A8D500] font-bold">1h 15m</span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[#888] text-xs uppercase tracking-widest border-b border-[#333]">
                                <th className="pb-4 w-10"></th>
                                <th className="pb-4 px-4 w-32">Tiempo</th>
                                <th className="pb-4 px-4">Actividad / Momento</th>
                                <th className="pb-4 px-4">Responsable</th>
                                <th className="pb-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252525]">
                            {rows.map((row) => (
                                <tr key={row.id} className="group hover:bg-[#222]">
                                    <td className="py-4 text-[#333] group-hover:text-[#555] cursor-grab">
                                        <GripVertical size={20} />
                                    </td>
                                    <td className="py-4 px-4">
                                        <input
                                            value={row.tiempo}
                                            onChange={(e) => updateRow(row.id, 'tiempo', e.target.value)}
                                            placeholder="Ej: 10 min"
                                            className="w-full bg-transparent border-none text-white outline-none focus:text-[#A8D500] font-medium"
                                        />
                                    </td>
                                    <td className="py-4 px-4">
                                        <input
                                            value={row.actividad}
                                            onChange={(e) => updateRow(row.id, 'actividad', e.target.value)}
                                            placeholder="Describa el momento..."
                                            className="w-full bg-transparent border-none text-white outline-none focus:text-[#A8D500]"
                                        />
                                    </td>
                                    <td className="py-4 px-4">
                                        <input
                                            value={row.responsable}
                                            onChange={(e) => updateRow(row.id, 'responsable', e.target.value)}
                                            placeholder="Líder / Equipo"
                                            className="w-full bg-transparent border-none text-white outline-none focus:text-[#A8D500]"
                                        />
                                    </td>
                                    <td className="py-4">
                                        <button onClick={() => removeRow(row.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={addRow}
                        className="mt-6 w-full py-3 border-2 border-dashed border-[#333] rounded-xl text-[#888] flex items-center justify-center gap-2 hover:border-[#A8D500] hover:text-[#A8D500] transition-all"
                    >
                        <Plus size={20} /> Agregar Fila
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 italic">Notas Técnicas / Multimedia</h4>
                    <textarea
                        value={notasTecnicas}
                        onChange={(e) => setNotasTecnicas(e.target.value)}
                        placeholder="Luces rojas en la adoración, video de bienvenida listo..."
                        className="w-full bg-[#252525] border border-[#333] rounded-xl p-4 text-white text-sm h-32 outline-none focus:border-[#A8D500] resize-none"
                    />
                </div>
                <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333]">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 italic">Versículo Lema / Idea Central</h4>
                    <textarea
                        value={versiculoLema}
                        onChange={(e) => setVersiculoLema(e.target.value)}
                        placeholder="Ej: Salmos 100:4 - Entrad por sus puertas con acción de gracias..."
                        className="w-full bg-[#252525] border border-[#333] rounded-xl p-4 text-white text-sm h-32 outline-none focus:border-[#A8D500] resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ServiciosView;

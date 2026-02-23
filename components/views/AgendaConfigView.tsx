'use client'
import React, { useState } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

interface AgendaConfigViewProps {
    supabase: any;
    horariosDisponibles: any[];
    fetchHorarios: () => Promise<void>;
}

const AgendaConfigView = ({ supabase, horariosDisponibles, fetchHorarios }: AgendaConfigViewProps) => {
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
        else fetchHorarios();
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-[#333]">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#A8D50015] rounded-2xl">
                        <Clock className="text-[#A8D500]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold">Horarios de Reunión</h2>
                        <p className="text-[#888] text-sm">Configura los turnos disponibles para asistencia y cronogramas</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            type="time"
                            value={newHorario}
                            onChange={(e) => setNewHorario(e.target.value)}
                            className="flex-1 bg-[#252525] border border-[#333] rounded-2xl px-6 py-4 text-white outline-none focus:border-[#A8D500] transition-all [color-scheme:dark]"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-[#A8D500] text-black font-black px-8 py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={20} /> AGREGAR
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-8">
                        {horariosDisponibles.sort().map((h) => (
                            <div key={h} className="group flex items-center justify-between p-4 bg-[#252525] rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-[#A8D500]"></div>
                                    <span className="text-white font-bold text-lg">{h} HS</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(h)}
                                    className="p-2 text-[#555] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
                    <AlertCircle className="text-blue-400 shrink-0" size={20} />
                    <p className="text-blue-200/70 text-xs leading-relaxed">
                        Los cambios realizados aquí se verán reflejados automáticamente en la aplicación móvil y en los selectores de asistencia del panel.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgendaConfigView;

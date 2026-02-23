'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Save, Trash2, GripVertical, Music, Users2, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface DetailedRow {
    id: string;
    tiempo: string;
    actividad: string;
    responsable: string;
}

const ServiciosView = ({ supabase }: { supabase: any }) => {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [allSongs, setAllSongs] = useState<any[]>([]);
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [allMembers, setAllMembers] = useState<any[]>([]);

    // Form states
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [horario, setHorario] = useState('11:00 HS');
    const [notas, setNotas] = useState('');
    const [detailedRows, setDetailedRows] = useState<DetailedRow[]>([
        { id: '1', tiempo: '10 min', actividad: 'Alabanza', responsable: 'Banda' },
        { id: '2', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor' }
    ]);
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
    const [assignedStaff, setAssignedStaff] = useState<any[]>([]); // {miembro_id, rol, nombre}

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showSongPicker, setShowSongPicker] = useState(false);
    const [showStaffPicker, setShowStaffPicker] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                { data: scheds },
                { data: songs },
                { data: teams },
                { data: members }
            ] = await Promise.all([
                supabase.from('cronogramas').select('*').order('fecha', { ascending: false }),
                supabase.from('canciones').select('*').order('titulo', { ascending: true }),
                supabase.from('equipos').select('*'),
                supabase.from('miembros').select('*').eq('es_servidor', true)
            ]);

            setSchedules(scheds || []);
            setAllSongs(songs || []);
            setAllTeams(teams || []);
            setAllMembers(members || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [supabase]);

    const handleOpenModal = (sched: any = null) => {
        if (sched) {
            setSelectedSchedule(sched);
            setFecha(sched.fecha);
            setHorario(sched.horario);
            setNotas(sched.notas_generales || '');
            setDetailedRows(sched.plan_detallado || []);
            setSelectedSongIds(sched.orden_canciones || []);
            setAssignedStaff(sched.equipo_ids || []);
        } else {
            setSelectedSchedule(null);
            setFecha(new Date().toISOString().split('T')[0]);
            setHorario('11:00 HS');
            setNotas('');
            setDetailedRows([
                { id: '1', tiempo: '10 min', actividad: 'Alabanza', responsable: 'Banda' },
                { id: '2', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor' }
            ]);
            setSelectedSongIds([]);
            setAssignedStaff([]);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        const payload = {
            fecha,
            horario,
            notas_generales: notas,
            plan_detallado: detailedRows,
            orden_canciones: selectedSongIds,
            equipo_ids: assignedStaff
        };

        let res;
        if (selectedSchedule) {
            res = await supabase.from('cronogramas').update(payload).eq('id', selectedSchedule.id);
        } else {
            res = await supabase.from('cronogramas').insert([payload]);
        }

        if (res.error) alert("Error: " + res.error.message);
        else {
            setShowModal(false);
            fetchData();
        }
    };

    const deleteSchedule = async (id: string) => {
        if (!confirm("¿Eliminar este cronograma?")) return;
        await supabase.from('cronogramas').delete().eq('id', id);
        fetchData();
    };

    const addDetailedRow = () => {
        setDetailedRows([...detailedRows, { id: Math.random().toString(), tiempo: '', actividad: '', responsable: '' }]);
    };

    const toggleSong = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const assignStaff = (m: any) => {
        if (assignedStaff.some(s => s.miembro_id === m.id)) {
            setAssignedStaff(prev => prev.filter(s => s.miembro_id !== m.id));
        } else {
            const rol = prompt(`¿Qué rol tendrá ${m.nombre}?`, "Servidor") || "Servidor";
            setAssignedStaff([...assignedStaff, { miembro_id: m.id, nombre: `${m.nombre} ${m.apellido}`, rol }]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-[#A8D500]" /> PLANIFICACIÓN (CRONOGRAMAS)
                    </h2>
                    <p className="text-[#888] text-sm italic">Organiza los cultos, equipos y canciones del domingo</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#A8D500] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(168,213,0,0.4)] transition-all active:scale-95"
                >
                    <Plus size={18} /> CREAR CRONOGRAMA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map(s => (
                    <div key={s.id} className="bg-[#1E1E1E] p-6 rounded-2xl border border-[#333] hover:border-[#A8D50050] transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#A8D50010] rounded-lg">
                                <Calendar size={20} className="text-[#A8D500]" />
                            </div>
                            <button onClick={() => deleteSchedule(s.id)} className="text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="text-white font-black text-lg uppercase">{new Date(s.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
                        <p className="text-[#A8D500] font-bold text-xs mb-3">{s.horario}</p>

                        <div className="flex gap-4 mt-4 border-t border-[#333] pt-4">
                            <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                                <Music size={12} /> {s.orden_canciones?.length || 0} CANCIONES
                            </div>
                            <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                                <Users2 size={12} /> {s.equipo_ids?.length || 0} PERSONAS
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenModal(s)}
                            className="w-full mt-4 py-2 bg-[#252525] text-white text-xs font-bold rounded-lg border border-[#333] hover:bg-[#A8D500] hover:text-black hover:border-transparent transition-all"
                        >
                            EDITAR PLAN
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL: Editor de Cronograma */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#151515] w-full max-w-5xl h-[90vh] rounded-3xl border border-[#333] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#1A1A1A]">
                            <div className="flex items-center gap-4">
                                <h3 className="text-white font-bold text-xl uppercase tracking-widest">
                                    {selectedSchedule ? 'Editando Plan' : 'Nuevo Cronograma'}
                                </h3>
                                <div className="flex gap-2">
                                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="bg-[#222] border border-[#333] rounded-lg px-3 py-1 text-white text-xs" />
                                    <input type="text" value={horario} onChange={e => setHorario(e.target.value)} className="bg-[#222] border border-[#333] rounded-lg px-3 py-1 text-white text-xs w-24" />
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-[#888] hover:text-white"><X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Columna Izquierda: Orden del Culto */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                                        <Clock size={14} /> Minuto a Minuto (Detailed Plan)
                                    </h4>
                                    <div className="bg-[#1A1A1A] rounded-2xl border border-[#333] overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-[#222] text-[#555] font-black uppercase tracking-widest border-b border-[#333]">
                                                    <th className="p-3 text-left w-20">Tiempo</th>
                                                    <th className="p-3 text-left">Actividad</th>
                                                    <th className="p-3 text-left">Resp.</th>
                                                    <th className="p-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#222]">
                                                {detailedRows.map(row => (
                                                    <tr key={row.id} className="group">
                                                        <td className="p-2"><input value={row.tiempo} onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, tiempo: e.target.value } : r))} className="w-full bg-transparent text-white outline-none" placeholder="10m" /></td>
                                                        <td className="p-2"><input value={row.actividad} onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, actividad: e.target.value } : r))} className="w-full bg-transparent text-white outline-none" placeholder="Descripción..." /></td>
                                                        <td className="p-2"><input value={row.responsable} onChange={e => setDetailedRows(detailedRows.map(r => r.id === row.id ? { ...r, responsable: e.target.value } : r))} className="w-full bg-transparent text-white outline-none" placeholder="Banda" /></td>
                                                        <td className="p-2 text-right"><button onClick={() => setDetailedRows(detailedRows.filter(r => r.id !== row.id))} className="text-red-900 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <button onClick={addDetailedRow} className="w-full p-3 text-[#555] hover:text-[#A8D500] hover:bg-[#A8D50010] transition-all text-[10px] font-bold uppercase">+ Agregar Momento</button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                                        <Music size={14} /> Canciones Asignadas
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedSongIds.map((id, idx) => {
                                            const s = allSongs.find(song => song.id === id);
                                            return s ? (
                                                <div key={id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[#555] font-black">{idx + 1}</span>
                                                        <div>
                                                            <p className="text-white font-bold text-sm">{s.titulo}</p>
                                                            <p className="text-[#555] text-[10px]">{s.artista} • {s.tono}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => toggleSong(id)} className="text-[#555] hover:text-red-500"><X size={14} /></button>
                                                </div>
                                            ) : null;
                                        })}
                                        <button
                                            onClick={() => setShowSongPicker(true)}
                                            className="p-4 border-2 border-dashed border-[#333] rounded-xl text-[#555] hover:border-[#A8D500] hover:text-[#A8D500] transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                        >
                                            <Plus size={16} /> SELECCIONAR CANCIONES
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Equipo y Notas */}
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                                        <Users2 size={14} /> Equipo / Staff
                                    </h4>
                                    <div className="space-y-2">
                                        {assignedStaff.map(s => (
                                            <div key={s.miembro_id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
                                                <div>
                                                    <p className="text-white font-bold text-sm">{s.nombre}</p>
                                                    <p className="text-[#A8D500] text-[10px] font-black uppercase">{s.rol}</p>
                                                </div>
                                                <button onClick={() => assignStaff({ id: s.miembro_id })} className="text-[#555] hover:text-red-500"><X size={14} /></button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setShowStaffPicker(true)}
                                            className="w-full p-4 border-2 border-dashed border-[#333] rounded-xl text-[#555] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                        >
                                            <Plus size={16} /> ASIGNAR PERSONA
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Notas del Director</h4>
                                    <textarea
                                        value={notas}
                                        onChange={e => setNotas(e.target.value)}
                                        placeholder="Indicaciones generales para el equipo..."
                                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 text-white text-sm h-32 outline-none focus:border-[#A8D500] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#333] bg-[#1A1A1A] flex justify-between gap-4">
                            <button onClick={() => setShowModal(false)} className="px-8 py-3 bg-[#252525] text-white font-bold rounded-xl border border-[#333]">CANCELAR</button>
                            <button onClick={handleSave} className="px-10 py-3 bg-[#A8D500] text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(168,213,0,0.5)] transition-all flex items-center gap-2 uppercase tracking-widest"><Save size={18} /> Guardar Planificación</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PICKER: Songs */}
            {showSongPicker && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold uppercase tracking-widest">Seleccionar Canciones</h3>
                            <button onClick={() => setShowSongPicker(false)} className="text-[#888]"><X /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                            {allSongs.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSong(s.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedSongIds.includes(s.id) ? 'bg-[#A8D500] border-transparent text-black' : 'bg-[#222] border-[#333] text-white hover:border-[#A8D500]'}`}
                                >
                                    <div className="text-left font-bold">{s.titulo} <span className="text-[10px] opacity-70 block uppercase font-black">{s.artista} • {s.tono}</span></div>
                                    {selectedSongIds.includes(s.id) && <CheckCircle2 size={20} />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowSongPicker(false)} className="mt-6 w-full py-4 bg-[#A8D500] text-black font-black rounded-2xl uppercase tracking-widest">Listo</button>
                    </div>
                </div>
            )}

            {/* PICKER: Staff */}
            {showStaffPicker && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold uppercase tracking-widest">Asignar Equipo</h3>
                            <button onClick={() => setShowStaffPicker(false)} className="text-[#888]"><X /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                            {allMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => assignStaff(m)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${assignedStaff.some(s => s.miembro_id === m.id) ? 'bg-[#3B82F6] border-transparent text-white font-bold' : 'bg-[#222] border-[#333] text-white hover:border-[#3B82F6]'}`}
                                >
                                    <div className="text-left font-bold">{m.nombre} {m.apellido}</div>
                                    {assignedStaff.some(s => s.miembro_id === m.id) && <CheckCircle2 size={20} />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowStaffPicker(false)} className="mt-6 w-full py-4 bg-[#3B82F6] text-white font-black rounded-2xl uppercase tracking-widest">Listo</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiciosView;

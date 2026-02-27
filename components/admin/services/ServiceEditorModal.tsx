import React from 'react';
import { X, Clock, CheckCircle2, Save, Users2, Music, Plus } from 'lucide-react';
import PlanTable from './PlanTable';
import StaffSection from './StaffSection';

interface ServiceEditorModalProps {
    selectedSchedule: any;
    fecha: string;
    setFecha: (s: string) => void;
    horario: string;
    setHorario: (s: string) => void;
    notas: string;
    setNotas: (s: string) => void;
    detailedRows: any[];
    setDetailedRows: (rows: any[]) => void;
    selectedSongIds: string[];
    allSongs: any[];
    assignedStaff: any[];
    setAssignedStaff: (staff: any[]) => void;
    allMembers: any[];
    roleCategories: any[];
    notificarAlGuardar: boolean;
    setNotificarAlGuardar: (b: boolean) => void;
    onClose: () => void;
    onSave: () => void;
    onShowSongPicker: () => void;
    onShowStaffPicker: () => void;
    onShowTemplatePicker: () => void;
    onToggleSong: (id: string) => void;
}

const ServiceEditorModal: React.FC<ServiceEditorModalProps> = ({
    selectedSchedule,
    fecha, setFecha,
    horario, setHorario,
    notas, setNotas,
    detailedRows, setDetailedRows,
    selectedSongIds,
    allSongs,
    assignedStaff, setAssignedStaff,
    allMembers,
    roleCategories,
    notificarAlGuardar, setNotificarAlGuardar,
    onClose,
    onSave,
    onShowSongPicker,
    onShowStaffPicker,
    onShowTemplatePicker,
    onToggleSong
}) => {
    const HORARIOS_DISPONIBLES = ['9:00 HS', '11:00 HS', '20:00 HS'];

    const addDetailedRow = () => {
        setDetailedRows([...detailedRows, { id: Math.random().toString(), tiempo: '', actividad: '', responsable: '' }]);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#151515] w-full max-w-5xl h-[90vh] rounded-3xl border border-[#333] shadow-2xl overflow-hidden flex flex-col text-left">
                <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#1A1A1A]">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-bold text-xl uppercase tracking-widest">
                            {selectedSchedule ? 'Editando Plan' : 'Nuevo Cronograma'}
                        </h3>
                        <div className="flex gap-3 ml-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-[#555] font-black uppercase mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={e => setFecha(e.target.value)}
                                    className="bg-[#222] border border-[#333] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#A8D500] transition-all cursor-pointer [color-scheme:dark]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-[#555] font-black uppercase mb-1">Horario(s)</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {HORARIOS_DISPONIBLES.map(h => {
                                        const selected = horario.split(', ').filter(Boolean).includes(h);
                                        return (
                                            <button
                                                key={h}
                                                onClick={() => {
                                                    const current = horario ? horario.split(', ').filter(Boolean) : [];
                                                    const updated = selected ? current.filter(x => x !== h) : [...current, h];
                                                    setHorario(updated.join(', '));
                                                }}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selected
                                                    ? 'bg-[#A8D500] text-black border-transparent shadow-[0_0_10px_rgba(168,213,0,0.3)]'
                                                    : 'bg-[#222] text-[#888] border-[#333] hover:border-[#A8D50050]'
                                                    }`}
                                            >
                                                {h}
                                            </button>
                                        );
                                    })}
                                    <span className="text-[#333] text-xs mx-1">|</span>
                                    <input
                                        type="time"
                                        id="custom-time-input"
                                        className="bg-[#222] border border-[#333] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#A8D500] transition-all w-28 cursor-pointer [color-scheme:dark]"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('custom-time-input') as HTMLInputElement;
                                            if (input?.value) {
                                                const formatted = input.value + ' HS';
                                                const current = horario ? horario.split(', ').filter(Boolean) : [];
                                                if (!current.includes(formatted)) {
                                                    setHorario([...current, formatted].join(', '));
                                                }
                                                input.value = '';
                                            }
                                        }}
                                        className="bg-[#333] text-[#A8D500] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#A8D500] hover:text-black transition-all border border-[#444]"
                                    >
                                        + Agregar
                                    </button>
                                </div>
                                {horario && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {horario.split(', ').filter(Boolean).map(h => (
                                            <span key={h} className="flex items-center gap-1 bg-[#A8D50015] text-[#A8D500] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#A8D50030]">
                                                🕐 {h}
                                                <button
                                                    onClick={() => {
                                                        const updated = horario.split(', ').filter(Boolean).filter(x => x !== h);
                                                        setHorario(updated.join(', '));
                                                    }}
                                                    className="text-[#A8D500] hover:text-red-400 ml-1"
                                                >×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#888] hover:text-white"><X /></button>
                </div>

                {!selectedSchedule && assignedStaff.length === 0 && (
                    <div className="bg-[#A8D50010] p-4 flex items-center justify-between border-b border-[#A8D50020]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#A8D500] text-black p-2 rounded-lg"><CheckCircle2 size={16} /></div>
                            <p className="text-[#A8D500] text-xs font-bold uppercase tracking-widest">¿Quieres cargar una estructura predefinida?</p>
                        </div>
                        <button
                            onClick={onShowTemplatePicker}
                            className="bg-[#A8D500] text-black px-4 py-1.5 rounded-lg text-[10px] font-black hover:scale-105 transition-all"
                        >
                            USAR PLANTILLA
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar">
                    {/* Columna Izquierda: Orden del Culto */}
                    <div className="lg:col-span-2 space-y-8">
                        <PlanTable
                            detailedRows={detailedRows}
                            setDetailedRows={setDetailedRows}
                            addDetailedRow={addDetailedRow}
                        />

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
                                            <button onClick={() => onToggleSong(id)} className="text-[#555] hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ) : null;
                                })}
                                <button
                                    onClick={onShowSongPicker}
                                    className="p-4 border-2 border-dashed border-[#333] rounded-xl text-[#555] hover:border-[#A8D500] hover:text-[#A8D500] transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                >
                                    <Plus size={16} /> SELECCIONAR CANCIONES
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Equipo y Notas */}
                    <div className="space-y-8">
                        <StaffSection
                            assignedStaff={assignedStaff}
                            setAssignedStaff={setAssignedStaff}
                            roleCategories={roleCategories}
                            allMembers={allMembers}
                            onAddStaff={onShowStaffPicker}
                        />

                        <div>
                            <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Notas del Director</h4>
                            <textarea
                                value={notas}
                                onChange={e => setNotas(e.target.value)}
                                placeholder="Indicaciones generales para el equipo..."
                                className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 text-white text-sm h-24 outline-none focus:border-[#A8D500] resize-none mb-4"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[#333] bg-[#1A1A1A] flex justify-between gap-4">
                    <button onClick={onClose} className="px-6 py-3 bg-[#252525] text-white font-bold rounded-xl border border-[#333] text-xs">CANCELAR</button>
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 text-white text-xs font-bold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notificarAlGuardar}
                                onChange={e => setNotificarAlGuardar(e.target.checked)}
                                className="w-4 h-4 accent-[#A8D500]"
                            />
                            NOTIFICAR AL GUARDAR
                        </label>
                        <button onClick={onSave} className="px-10 py-3 bg-[#A8D500] text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(168,213,0,0.5)] transition-all flex items-center gap-2 uppercase tracking-widest text-sm"><Save size={18} /> Guardar Plan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceEditorModal;

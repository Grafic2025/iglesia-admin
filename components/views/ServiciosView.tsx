'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Save, Trash2, GripVertical, Music, Users2, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface DetailedRow {
    id: string;
    tiempo: string;
    actividad: string;
    responsable: string;
}

// ── VISTA DE ADMINISTRACIÓN: GESTIÓN DE SERVICIOS ────────────────────────────
// Este componente permite a los admin crear y editar cronogramas de cultos,
// asignar equipos por categorías, seleccionar canciones y notificar al staff.
const ServiciosView = ({ supabase, enviarNotificacionIndividual, registrarAuditoria }: {
    supabase: any,
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<void>,
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>
}) => {
    // Estados de datos generales
    // ── ESTADOS DE DATOS (CONEXIÓN CON BASE DE DATOS) ──
    const [loading, setLoading] = useState(true);           // Controla si se muestra el spinner de carga
    const [schedules, setSchedules] = useState<any[]>([]);  // Guarda todos los cronogramas (cultos) creados
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null); // El cronograma que se está editando ahora
    const [allSongs, setAllSongs] = useState<any[]>([]);    // Lista de todas las canciones disponibles en la DB
    const [allTeams, setAllTeams] = useState<any[]>([]);    // Lista de equipos (banda, sonido, etc.) definidos
    const [allMembers, setAllMembers] = useState<any[]>([]); // Lista de todas las personas que son servidores
    const [allBlockouts, setAllBlockouts] = useState<any[]>([]); // Días que cada persona marcó como "no puedo servir"

    // ── ESTADOS DEL FORMULARIO DE EDICIÓN ──
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha del culto (YYYY-MM-DD)
    const [horario, setHorario] = useState('11:00 HS');     // Hora del culto
    const [notas, setNotas] = useState('');                 // Notas privadas que solo los directores ven
    const [bosquejo, setBosquejo] = useState('');           // Plan general (ej: anuncios, bienvenida) que ven todos

    // Lista de filas del plan detallado (ej: "10 min - Alabanza - Banda")
    const [detailedRows, setDetailedRows] = useState<DetailedRow[]>([
        { id: '1', tiempo: '10 min', actividad: 'Alabanza', responsable: 'Banda' },
        { id: '2', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor' }
    ]);

    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]); // Los IDs de las canciones elegidas para este día
    const [assignedStaff, setAssignedStaff] = useState<any[]>([]); // Los servidores elegidos con sus roles respectivos

    // ── ESTADOS DE INTERFAZ (UI) ──
    const [showModal, setShowModal] = useState(false);      // Controla el modal principal de edición
    const [showSongPicker, setShowSongPicker] = useState(false); // Modal para elegir canciones del catálogo
    const [showStaffPicker, setShowStaffPicker] = useState(false); // Modal para elegir personas de la lista
    const [pendingMember, setPendingMember] = useState<any>(null); // Miembro seleccionado que aún no tiene rol asignado
    const [pendingRol, setPendingRol] = useState('Servidor'); // Rol temporal que se le va a poner a la persona
    const [showTemplatePicker, setShowTemplatePicker] = useState(false); // Modal para elegir una estructura pre-armada

    const ROLE_CATEGORIES = [
        {
            name: "Audio",
            roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio"]
        },
        {
            name: "Banda",
            roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano"]
        },
        {
            name: "Medios",
            roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM"]
        },
        {
            name: "Voces",
            roles: ["Soprano", "Tenor", "Worship Leader"]
        },
        {
            name: "General",
            roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"]
        }
    ];

    const SERVICE_TEMPLATES = [
        {
            name: "Culto General",
            plan: [
                { id: '1', tiempo: '10 min', actividad: 'Oración Inicial', responsable: 'Pastor' },
                { id: '2', tiempo: '20 min', actividad: 'Alabanza (3-4 canciones)', responsable: 'Banda/Gpo Alabanza' },
                { id: '3', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor/Invitado' },
                { id: '4', tiempo: '5 min', actividad: 'Ofrendas / Anuncios', responsable: 'Ujieres' },
                { id: '5', tiempo: '10 min', actividad: 'Ministración / Cierre', responsable: 'Banda' }
            ],
            staffRoles: ['Director/Pastor', 'Worship Leader', 'Soprano', 'Tenor', 'Batería', 'Bajo', 'Guitarra Eléctrica 1', 'Piano', 'Sonidista', 'Slides TV']
        },
        {
            name: "Culto de Jóvenes",
            plan: [
                { id: '1', tiempo: '15 min', actividad: 'Dinámica / Bienvenida', responsable: 'Líder Jóvenes' },
                { id: '2', tiempo: '30 min', actividad: 'Adoración fuerte', responsable: 'Banda Jóvenes' },
                { id: '3', tiempo: '40 min', actividad: 'Charla / Word', responsable: 'Líder' },
                { id: '4', tiempo: '20 min', actividad: 'After / Compartir', responsable: 'Todos' }
            ],
            staffRoles: ['Líder Jóvenes', 'Directora Musical', 'Batería', 'Sonidista', 'Pantalla LED', 'YouTube CM']
        },
        {
            name: "Santa Cena",
            plan: [
                { id: '1', tiempo: '30 min', actividad: 'Adoración', responsable: 'Banda' },
                { id: '2', tiempo: '20 min', actividad: 'Mensaje Santa Cena', responsable: 'Pastor' },
                { id: '3', tiempo: '15 min', actividad: 'Reparto de Elementos', responsable: 'Diáconos' },
                { id: '4', tiempo: '10 min', actividad: 'Acción de Gracias', responsable: 'Pastor' }
            ],
            staffRoles: ['Director/Pastor', 'Worship Leader', 'Piano', 'Guitarra Acústica', 'Sonidista', 'Ujier']
        }
    ];

    // Función para cargar todos los datos necesarios desde Supabase
    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                { data: scheds },
                { data: songs },
                { data: teams },
                { data: members },
                { data: blocks }
            ] = await Promise.all([
                supabase.from('cronogramas').select('*').order('fecha', { ascending: false }),
                supabase.from('canciones').select('*').order('titulo', { ascending: true }),
                supabase.from('equipos').select('*'),
                supabase.from('miembros').select('*').eq('es_servidor', true),
                supabase.from('bloqueos_servidores').select('*')
            ]);

            setSchedules(scheds || []);
            setAllSongs(songs || []);
            setAllTeams(teams || []);
            setAllMembers(members || []);
            setAllBlockouts(blocks || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [supabase]);

    // Abre el modal para crear un nuevo cronograma o editar uno existente
    const handleOpenModal = (sched: any = null) => {
        if (sched) {
            // Si hay un objeto 'sched', estamos editando: precargamos los estados con sus valores
            setSelectedSchedule(sched);
            setFecha(sched.fecha);
            setHorario(sched.horario);
            setNotas(sched.notas_generales || '');
            setBosquejo(sched.bosquejo || '');
            setDetailedRows(sched.plan_detallado || []);
            setSelectedSongIds(sched.orden_canciones || []);
            setAssignedStaff(sched.equipo_ids || []);
        } else {
            // Si no hay objeto, estamos creando: reseteamos los estados a valores por defecto
            setSelectedSchedule(null);
            setFecha(new Date().toISOString().split('T')[0]);
            setHorario('11:00 HS');
            setNotas('');
            setBosquejo('');
            setDetailedRows([
                { id: '1', tiempo: '10 min', actividad: 'Alabanza', responsable: 'Banda' },
                { id: '2', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor' }
            ]);
            setSelectedSongIds([]);
            setAssignedStaff([]);
        }
        setShowModal(true);
    };

    // Guardar los cambios en el cronograma (Inserción o Actualización)
    const handleSave = async () => {
        const payload = {
            fecha,
            horario,
            notas_generales: notas,
            bosquejo: bosquejo,
            plan_detallado: detailedRows,
            orden_canciones: selectedSongIds,
            equipo_ids: assignedStaff
        };

        let res;
        if (selectedSchedule) {
            res = await supabase.from('cronogramas').update(payload).eq('id', selectedSchedule.id);
            if (registrarAuditoria) await registrarAuditoria('EDITAR CRONOGRAMA', `Se modificó el plan del día ${fecha} (${horario})`);
        } else {
            res = await supabase.from('cronogramas').insert([payload]);
            if (registrarAuditoria) await registrarAuditoria('CREAR CRONOGRAMA', `Nuevo plan creado para el día ${fecha} (${horario})`);
        }

        if (res.error) alert("Error: " + res.error.message);
        else {
            setShowModal(false);
            fetchData();
        }
    };

    // Envío manual de recordatorios mediante notificaciones push
    const notificarEquipoManual = async (sched: any) => {
        if (!sched?.equipo_ids?.length) return alert("No hay equipo asignado.");
        if (!confirm("Se enviarán notificaciones push a los miembros pendientes. ¿Continuar?")) return;

        let enviados = 0;
        const fechaFormat = new Date(sched.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

        for (const staff of sched.equipo_ids) {
            if (staff.estado === 'pendiente' || !staff.estado) {
                const miembro = allMembers.find(m => m.id === staff.miembro_id);
                if (miembro?.token_notificacion && enviarNotificacionIndividual) {
                    await enviarNotificacionIndividual(
                        miembro.token_notificacion,
                        miembro.nombre,
                        `🙌 Recordatorio: Has sido seleccionado para ${staff.rol} el día ${fechaFormat} (${sched.horario}).`
                    );
                    enviados++;
                }
            }
        }
        alert(`Se enviaron ${enviados} notificaciones.`);
        if (registrarAuditoria) await registrarAuditoria('NOTIFICAR EQUIPO', `Se enviaron recordatorios para el servicio del ${sched.fecha}`);
    };

    // Función para exportar el plan a un archivo CSV descargable
    const exportarCSV = (sched: any) => {
        let content = "TIEMPO;ACTIVIDAD;RESPONSABLE\n";
        sched.plan_detallado?.forEach((row: any) => {
            content += `${row.tiempo};${row.actividad};${row.responsable}\n`;
        });

        content += "\nCANCIONES\n";
        sched.orden_canciones?.forEach((id: string, idx: number) => {
            const s = allSongs.find(song => song.id === id);
            if (s) content += `${idx + 1};${s.titulo};${s.artista}\n`;
        });

        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Plan_Servicio_${sched.fecha}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Elimina un cronograma permanente de la base de datos tras confirmar
    const deleteSchedule = async (id: string) => {
        if (!confirm("¿Eliminar este cronograma?")) return;
        await supabase.from('cronogramas').delete().eq('id', id);
        fetchData(); // Actualiza la lista principal
    };

    // Añade una fila vacía al plan detallado (minuto a minuto)
    const addDetailedRow = () => {
        setDetailedRows([...detailedRows, { id: Math.random().toString(), tiempo: '', actividad: '', responsable: '' }]);
    };

    // Activa o desactiva una canción de la lista de seleccionadas
    const toggleSong = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    // Asignación de Miembros (con chequeo de conflictos y bloqueos)
    const assignStaff = (m: any) => {
        if (assignedStaff.some(s => s.miembro_id === m.id)) {
            setAssignedStaff(prev => prev.filter(s => s.miembro_id !== m.id));
            return;
        }

        // 1. Chequeo de superposición de horarios (si ya sirve en otro culto el mismo día)
        const overlap = schedules.find(s =>
            s.fecha === fecha &&
            s.id !== selectedSchedule?.id &&
            s.equipo_ids?.some((e: any) => e.miembro_id === m.id)
        );

        if (overlap) {
            if (!confirm(`🚨 CONFLICTO DE HORARIO: ${m.nombre} ya está asignado al servicio de las ${overlap.horario} este mismo día.\n\n¿Quieres asignarlo también a este horario?`)) {
                return;
            }
        }

        // 2. Chequeo de bloqueos del servidor (Garantiza respetar su tiempo libre)
        const bloqueo = allBlockouts.find(b => b.miembro_id === m.id && fecha >= b.fecha_inicio && fecha <= b.fecha_fin);
        if (bloqueo) {
            if (!confirm(`⚠️ ALERTA: ${m.nombre} marcó este día como NO DISPONIBLE.\nMotivo: ${bloqueo.motivo || 'No especificado'}\n\n¿Deseas asignarlo de todas formas?`)) {
                return;
            }
        }
        setPendingMember(m);
        setPendingRol('Servidor');
    };

    // Procesa la asignación final de un rol a un miembro una vez seleccionado en el modal
    const confirmAssignRol = () => {
        if (!pendingMember) return;
        setAssignedStaff([...assignedStaff, {
            miembro_id: pendingMember.id,
            nombre: `${pendingMember.nombre} ${pendingMember.apellido}`,
            rol: pendingRol || 'Servidor',
            estado: 'pendiente' // Estado inicial hasta que el servidor acepte en su app
        }]);
        setPendingMember(null);
        setPendingRol('Servidor');
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
                        <h3 className="text-white font-black text-lg uppercase">{new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
                        <p className="text-[#A8D500] font-bold text-xs mb-3">{s.horario}</p>

                        <div className="flex gap-4 mt-4 border-t border-[#333] pt-4">
                            <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                                <Music size={12} /> {s.orden_canciones?.length || 0} CANCIONES
                            </div>
                            <div className="flex items-center gap-1 text-[#888] text-[10px] font-bold">
                                <Users2 size={12} /> {s.equipo_ids?.length || 0} PERSONAS
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleOpenModal(s)}
                                className="flex-1 py-2 bg-[#252525] text-white text-[10px] font-bold rounded-lg border border-[#333] hover:bg-[#A8D500] hover:text-black transition-all uppercase"
                            >
                                <Plus size={12} className="inline mr-1" /> Editar
                            </button>
                            <button
                                onClick={() => notificarEquipoManual(s)}
                                className="p-2 bg-[#A8D500]/10 text-[#A8D500] rounded-lg border border-[#A8D500]/20 hover:bg-[#A8D500] hover:text-black transition-all"
                                title="Notificar Equipo"
                            >
                                <Users2 size={14} />
                            </button>
                            <button
                                onClick={() => exportarCSV(s)}
                                className="p-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg border border-[#3B82F6]/20 hover:bg-[#3B82F6] hover:text-white transition-all"
                                title="Exportar CSV"
                            >
                                <Save size={14} />
                            </button>
                        </div>
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
                                        <label className="text-[10px] text-[#555] font-black uppercase mb-1">Horario</label>
                                        <input
                                            type="time"
                                            value={horario}
                                            onChange={e => setHorario(e.target.value)}
                                            className="bg-[#222] border border-[#333] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#A8D500] transition-all w-36 cursor-pointer [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-[#888] hover:text-white"><X /></button>
                        </div>

                        {!selectedSchedule && assignedStaff.length === 0 && (
                            <div className="bg-[#A8D50010] p-4 flex items-center justify-between border-b border-[#A8D50020]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#A8D500] text-black p-2 rounded-lg"><CheckCircle2 size={16} /></div>
                                    <p className="text-[#A8D500] text-xs font-bold uppercase tracking-widest">¿Quieres cargar una estructura predefinida?</p>
                                </div>
                                <button
                                    onClick={() => setShowTemplatePicker(true)}
                                    className="bg-[#A8D500] text-black px-4 py-1.5 rounded-lg text-[10px] font-black hover:scale-105 transition-all"
                                >
                                    USAR PLANTILLA
                                </button>
                            </div>
                        )}

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
                                            <div key={s.miembro_id} className="flex flex-col p-3 bg-[#1A1A1A] rounded-xl border border-[#333] gap-2">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right mr-3">
                                                            <p className="text-white font-bold text-sm">{s.nombre}</p>
                                                            <p className="text-[#A8D500] text-[10px] font-black uppercase">{s.rol}</p>
                                                        </div>
                                                        <div className={`p-1 rounded-full ${s.estado === 'confirmado' ? 'bg-green-500/20 text-green-500' :
                                                            s.estado === 'rechazado' ? 'bg-red-500/20 text-red-500' :
                                                                'bg-yellow-500/20 text-yellow-500'
                                                            }`}>
                                                            {s.estado === 'confirmado' ? <CheckCircle2 size={12} /> :
                                                                s.estado === 'rechazado' ? <X size={12} /> :
                                                                    <Clock size={12} />}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setAssignedStaff(assignedStaff.filter(item => item.miembro_id !== s.miembro_id))} className="text-[#555] hover:text-red-500 p-1"><X size={14} /></button>
                                                </div>
                                                {s.estado === 'rechazado' && s.motivo && (
                                                    <div className="bg-red-500/5 border-l-2 border-red-500 p-2 mt-1">
                                                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Motivo del rechazo:</p>
                                                        <p className="text-white text-xs italic">"{s.motivo}"</p>
                                                    </div>
                                                )}
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
                                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 text-white text-sm h-24 outline-none focus:border-[#A8D500] resize-none mb-4"
                                    />

                                    <h4 className="text-[#A8D500] text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Bosquejo del Mensaje (Público)</h4>
                                    <textarea
                                        value={bosquejo}
                                        onChange={e => setBosquejo(e.target.value)}
                                        placeholder="Versículos clave y puntos del sermón para que los miembros tomen notas..."
                                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 text-[#888] text-sm h-40 outline-none focus:border-[#A8D500] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#333] bg-[#1A1A1A] flex justify-between gap-4">
                            <div className="flex gap-2">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-[#252525] text-white font-bold rounded-xl border border-[#333] text-xs">CANCELAR</button>
                                {selectedSchedule && (
                                    <button
                                        onClick={() => exportarCSV(selectedSchedule)}
                                        className="px-6 py-3 bg-[#3B82F610] text-[#3B82F6] border border-[#3B82F633] font-bold rounded-xl hover:bg-[#3B82F6] hover:text-white transition-all text-xs flex items-center gap-2"
                                    >
                                        <Save size={14} /> EXPORTAR CSV
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {selectedSchedule && (
                                    <button
                                        onClick={() => notificarEquipoManual(selectedSchedule)}
                                        className="px-6 py-3 bg-[#A8D50010] text-[#A8D500] border border-[#A8D50033] font-bold rounded-xl hover:bg-[#A8D500] hover:text-black transition-all text-xs flex items-center gap-2"
                                    >
                                        <Users2 size={14} /> NOTIFICAR EQUIPO
                                    </button>
                                )}
                                <button onClick={handleSave} className="px-10 py-3 bg-[#A8D500] text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(168,213,0,0.5)] transition-all flex items-center gap-2 uppercase tracking-widest text-sm"><Save size={18} /> Guardar Plan</button>
                            </div>
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
                                    {(() => {
                                        const b = allBlockouts.find(b => b.miembro_id === m.id && fecha >= b.fecha_inicio && fecha <= b.fecha_fin);
                                        return (
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="text-left font-bold">{m.nombre} {m.apellido}</div>
                                                {b && <span className="text-[9px] bg-red-500 font-bold text-white px-2 py-0.5 rounded-full uppercase">No disponible: {b.motivo || 'Motivo no especificado'}</span>}
                                            </div>
                                        );
                                    })()}
                                    {assignedStaff.some(s => s.miembro_id === m.id) && <CheckCircle2 size={20} />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowStaffPicker(false)} className="mt-6 w-full py-4 bg-[#3B82F6] text-white font-black rounded-2xl uppercase tracking-widest">Listo</button>
                    </div>
                </div>
            )}

            {/* MODAL: Asignar Rol */}
            {pendingMember && (
                <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-sm rounded-3xl border border-[#333] p-6 shadow-2xl">
                        <h3 className="text-white font-bold text-lg mb-2">Asignar Rol</h3>
                        <p className="text-[#888] text-sm mb-5">¿Qué rol tendrá <span className="text-white font-bold">{pendingMember.nombre}</span>?</p>
                        <input
                            type="text"
                            value={pendingRol}
                            onChange={e => setPendingRol(e.target.value)}
                            placeholder="Ej: Guitarra, Batería, Sonido..."
                            className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500] mb-3"
                            autoFocus
                        />
                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {ROLE_CATEGORIES.map(cat => (
                                <div key={cat.name}>
                                    <p className="text-[10px] text-[#A8D500] font-black uppercase mb-2 tracking-wider">{cat.name}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {cat.roles.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setPendingRol(r)}
                                                className={`text-[10px] px-3 py-2 rounded-xl border font-bold transition-all ${pendingRol === r ? 'bg-[#A8D500] text-black border-transparent' : 'bg-[#222] text-[#888] border-[#333] hover:border-[#A8D50050]'
                                                    }`}
                                            >{r}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingMember(null)}
                                className="flex-1 py-3 bg-[#222] text-white font-bold rounded-xl border border-[#333]"
                            >CANCELAR</button>
                            <button
                                onClick={confirmAssignRol}
                                className="flex-1 py-3 bg-[#A8D500] text-black font-black rounded-xl"
                            >CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Plantillas */}
            {showTemplatePicker && (
                <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-xl uppercase tracking-widest">Seleccionar Plantilla</h3>
                            <button onClick={() => setShowTemplatePicker(false)} className="text-[#888]"><X /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {SERVICE_TEMPLATES.map(t => (
                                <button
                                    key={t.name}
                                    onClick={() => {
                                        setDetailedRows(t.plan);
                                        // Optional: prefill roles as empty slots if needed
                                        setShowTemplatePicker(false);
                                    }}
                                    className="bg-[#222] border border-[#333] p-6 rounded-2xl text-left hover:border-[#A8D500] transition-all group"
                                >
                                    <h4 className="text-white font-black text-lg group-hover:text-[#A8D500]">{t.name}</h4>
                                    <p className="text-[#555] text-xs mt-1">{t.plan.length} momentos definidos • {t.staffRoles.join(', ')}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowTemplatePicker(false)}
                            className="mt-8 w-full py-4 bg-[#222] text-[#555] font-bold rounded-2xl border border-[#333] uppercase text-xs"
                        >CANCELAR</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiciosView;

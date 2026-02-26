'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Save, Trash2, GripVertical, Music, Users2, X, ChevronRight, CheckCircle2, Search } from 'lucide-react';

interface DetailedRow {
    id: string;
    tiempo: string;
    actividad: string;
    responsable: string;
}

// ── VISTA DE ADMINISTRACIÓN: GESTIÓN DE SERVICIOS ────────────────────────────
// Este componente permite a los admin crear y editar cronogramas de cultos,
// asignar equipos por categorías, seleccionar canciones y notificar al staff.
/**
 * Componente de Vista para la Gestión de Servicios (Planes de Culto).
 * Permite a los administradores:
 * - Crear cronogramas detallados minuto a minuto.
 * - Asignar equipos por categorías (Banda, Audio, Medios, etc.).
 * - Seleccionar canciones del catálogo.
 * - Gestionar conflictos de horarios y bloqueos de servidores.
 * - Notificar al staff mediante notificaciones push.
 * - Exportar planes a CSV.
 */
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
    const [allMemberTeams, setAllMemberTeams] = useState<any[]>([]); // Roles pre-asignados en la sección Equipos

    // ── ESTADOS DEL FORMULARIO DE EDICIÓN ──
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha del culto (YYYY-MM-DD)
    const [horario, setHorario] = useState('');     // Hora(s) del culto (puede ser múltiple: '9:00 HS, 11:00 HS')
    const HORARIOS_DISPONIBLES = ['9:00 HS', '11:00 HS', '20:00 HS'];
    const [notas, setNotas] = useState('');                 // Notas privadas que solo los directores ven

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
    const [staffSearch, setStaffSearch] = useState('');     // Término de búsqueda para filtrar la lista de miembros
    const [songSearch, setSongSearch] = useState('');       // Término de búsqueda para filtrar la lista de canciones
    const [pendingMember, setPendingMember] = useState<any>(null); // Miembro seleccionado que aún no tiene rol asignado
    const [pendingRol, setPendingRol] = useState('Servidor'); // Rol temporal que se le va a poner a la persona
    const [showTemplatePicker, setShowTemplatePicker] = useState(false); // Modal para elegir una estructura pre-armada

    const ROLE_CATEGORIES = [
        {
            name: "Audio",
            roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"]
        },
        {
            name: "Banda",
            roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano", "Teclados", "Guitarra"]
        },
        {
            name: "Medios",
            roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"]
        },
        {
            name: "Voces",
            roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"]
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

    /**
     * Recupera todos los datos iniciales necesarios para la vista:
     * - Próximos cronogramas.
     * - Catálogo completo de canciones.
     * - Lista de servidores (miembros).
     * - Bloqueos de servidores y pre-asignaciones a equipos.
     */
    const fetchData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [
                { data: scheds },
                { data: songs },
                { data: teams },
                { data: members },
                { data: blocks },
                { data: memberTeams }
            ] = await Promise.all([
                supabase.from('cronogramas').select('*').gte('fecha', today).order('fecha', { ascending: true }),
                supabase.from('canciones').select('*').order('titulo', { ascending: true }),
                supabase.from('equipos').select('*'),
                supabase.from('miembros').select('*').eq('es_servidor', true),
                supabase.from('bloqueos_servidores').select('*'),
                supabase.from('miembros_equipos').select('*')
            ]);

            setSchedules(scheds || []);
            setAllSongs(songs || []);
            setAllTeams(teams || []);
            setAllMembers(members || []);
            setAllBlockouts(blocks || []);
            setAllMemberTeams(memberTeams || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [supabase]);

    /**
     * Prepara el formulario para crear un nuevo cronograma o editar uno existente.
     * Si recibe un objeto `sched`, precarga los campos con sus datos actuales.
     * 
     * @param sched Opcional objeto del cronograma a editar.
     */
    const handleOpenModal = (sched: any = null) => {
        if (sched) {
            // Si hay un objeto 'sched', estamos editando: precargamos los estados con sus valores
            setSelectedSchedule(sched);
            setFecha(sched.fecha);
            setHorario(sched.horario);
            setNotas(sched.notas_generales || '');
            setDetailedRows(sched.plan_detallado || []);
            setSelectedSongIds(sched.orden_canciones || []);
            setAssignedStaff(sched.equipo_ids || []);
        } else {
            // Si no hay objeto, estamos creando: reseteamos los estados a valores por defecto
            setSelectedSchedule(null);
            setFecha('');
            setHorario('');
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

    const [notificarAlGuardar, setNotificarAlGuardar] = useState(false);

    /**
     * Guarda los cambios del cronograma en la base de datos (Insert o Update).
     * Preserva los estados de confirmación existentes de los miembros si se trata de una edición.
     * Opcionalmente envía notificaciones al guardar.
     */
    const handleSave = async () => {
        // Validaciones básicas de campos obligatorios
        if (!fecha) return alert("⚠️ Debes seleccionar una fecha para el servicio.");
        if (!horario) return alert("⚠️ Debes indicar el horario del servicio.");

        let finalStaff = [...assignedStaff];

        // ── LÓGICA DE PRESERVACIÓN DE ESTADO ──
        // Si estamos editando, traemos el estado más reciente de la DB para no pisar
        // las confirmaciones/rechazos que hayan hecho los miembros mientras el admin editaba.
        if (selectedSchedule) {
            const { data: latest } = await supabase
                .from('cronogramas')
                .select('equipo_ids')
                .eq('id', selectedSchedule.id)
                .single();

            if (latest?.equipo_ids) {
                finalStaff = assignedStaff.map(staff => {
                    const dbStaff = latest.equipo_ids.find((d: any) => d.miembro_id === staff.miembro_id);
                    if (dbStaff) {
                        // Preservamos el estado y motivo de la base de datos
                        return { ...staff, estado: dbStaff.estado, motivo: dbStaff.motivo };
                    }
                    return staff;
                });
            }
        }

        const payload = {
            fecha,
            horario,
            notas_generales: notas,
            plan_detallado: detailedRows,
            orden_canciones: selectedSongIds,
            equipo_ids: finalStaff
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
            if (notificarAlGuardar) {
                await notificarEquipoManual({ ...payload, id: selectedSchedule?.id }, true);
            }
            setShowModal(false);
            fetchData();
        }
    };

    /**
     * Envía notificaciones push de recordatorio a todos los miembros del equipo que aún tengan
     * su invitación en estado 'pendiente'.
     * 
     * @param sched El objeto del cronograma.
     * @param skipConfirm Si es true, omite la ventana de confirmación del navegador.
     */
    const notificarEquipoManual = async (sched: any, skipConfirm: boolean = false) => {
        if (!sched?.equipo_ids?.length) return alert("No hay equipo asignado.");
        if (!skipConfirm && !confirm("Se enviarán notificaciones push a los miembros pendientes. ¿Continuar?")) return;

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

    /**
     * Genera un archivo CSV con el plan detallado y las canciones, y lo descarga en el navegador.
     * 
     * @param sched El objeto del cronograma a exportar.
     */
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

    /**
     * Elimina permanentemente un cronograma de la base de datos.
     * 
     * @param id ID del cronograma a eliminar.
     */
    const deleteSchedule = async (id: string) => {
        if (!confirm("¿Eliminar este cronograma?")) return;
        await supabase.from('cronogramas').delete().eq('id', id);
        fetchData(); // Actualiza la lista principal
    };

    /**
     * Agrega una fila vacía a la tabla de planificación minuto a minuto.
     */
    const addDetailedRow = () => {
        setDetailedRows([...detailedRows, { id: Math.random().toString(), tiempo: '', actividad: '', responsable: '' }]);
    };

    /**
     * Agrega o quita una canción de la lista de canciones seleccionadas para el servicio.
     * 
     * @param id ID de la canción.
     */
    const toggleSong = (id: string) => {
        setSelectedSongIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    /**
     * Asigna un miembro al staff del servicio.
     * Verifica conflictos de horario con otros cultos el mismo día y bloqueos de disponibilidad.
     * 
     * @param m Objeto del miembro a asignar.
     */
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
        // Intentar detectar automáticamente el rol que tiene asignado en "Equipos"
        const assignedRole = allMemberTeams.find(mt => mt.miembro_id === m.id)?.rol;
        setPendingRol(assignedRole || 'Servidor');
    };

    /**
     * Confirma la asignación de un rol específico a un miembro previamente seleccionado.
     */
    const confirmAssignRol = () => {
        if (!pendingMember) return;
        setAssignedStaff([...assignedStaff, {
            miembro_id: pendingMember.id,
            nombre: `${pendingMember.nombre} ${pendingMember.apellido}`,
            foto_url: pendingMember.foto_url,
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
                            <button onClick={() => deleteSchedule(s.id)} className="text-red-600 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/10 rounded">
                                <Trash2 size={16} color="red" />
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
                                        <label className="text-[10px] text-[#555] font-black uppercase mb-1">Horario(s)</label>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {HORARIOS_DISPONIBLES.map(h => {
                                                const selected = horario.split(', ').filter(Boolean).includes(h);
                                                return (
                                                    <button
                                                        key={h}
                                                        onClick={() => {
                                                            const current = horario ? horario.split(', ').filter(Boolean) : [];
                                                            const updated = selected
                                                                ? current.filter(x => x !== h)
                                                                : [...current, h];
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
                                    <div className="space-y-6">
                                        {(() => {
                                            const getRoleCategory = (rol: string) => {
                                                for (const cat of ROLE_CATEGORIES) {
                                                    if (cat.roles.some(r => rol.includes(r))) return cat.name.toUpperCase();
                                                }
                                                return "GENERAL";
                                            };

                                            const categories = ["VOCES", "BANDA", "AUDIO", "MEDIOS", "GENERAL"];

                                            return categories.map(catName => {
                                                // Agrupamos y separamos roles por categoría
                                                const membersInCat = assignedStaff.reduce((acc: any[], s: any) => {
                                                    const roles = (s.rol || 'Servidor').split(', ').filter(Boolean);
                                                    roles.forEach((r: string) => {
                                                        if (getRoleCategory(r) === catName) {
                                                            acc.push({ ...s, specificRol: r });
                                                        }
                                                    });
                                                    return acc;
                                                }, []);

                                                if (membersInCat.length === 0) return null;

                                                return (
                                                    <div key={catName} className="space-y-3">
                                                        <h5 className="text-[10px] text-[#A8D500] font-black uppercase tracking-widest flex items-center gap-2">
                                                            {catName}
                                                            <div className="h-px bg-[#A8D50020] flex-1"></div>
                                                        </h5>
                                                        <div className="space-y-2">
                                                            {membersInCat.map((s, idx) => (
                                                                <div key={`${s.miembro_id}-${s.specificRol}`} className="flex flex-col p-3 bg-[#1A1A1A] rounded-xl border border-[#333] gap-2 group/item">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] overflow-hidden flex items-center justify-center">
                                                                                {(() => {
                                                                                    const m = allMembers.find(mem => mem.id === s.miembro_id);
                                                                                    const foto = m?.foto_url || s.foto_url;
                                                                                    return foto ? (
                                                                                        <img src={foto} className="w-full h-full object-cover" alt="" />
                                                                                    ) : (
                                                                                        <span className="text-[10px] text-[#555] font-black">{s.nombre?.[0]}</span>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-left">
                                                                                <p className="text-white font-bold text-sm line-clamp-1">{s.nombre}</p>
                                                                                <p className="text-[#A8D500] text-[10px] font-black uppercase">{s.specificRol}</p>
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
                                                                        <button
                                                                            onClick={() => setAssignedStaff(assignedStaff.filter(item => item.miembro_id !== s.miembro_id))}
                                                                            className="text-[#555] hover:text-red-500 p-1"
                                                                            title="Eliminar de todo el plan"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                    {s.estado === 'rechazado' && s.motivo && (
                                                                        <div className="bg-red-500/5 border-l-2 border-red-500 p-2 mt-1">
                                                                            <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Motivo del rechazo:</p>
                                                                            <p className="text-white text-xs italic">"{s.motivo}"</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold uppercase tracking-widest">Seleccionar Canciones</h3>
                            <button onClick={() => { setShowSongPicker(false); setSongSearch(''); }} className="text-[#888]"><X /></button>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar canción por título o artista..."
                                value={songSearch}
                                onChange={e => setSongSearch(e.target.value)}
                                className="w-full bg-[#222] border border-[#333] rounded-2xl py-3 pl-11 pr-4 text-white text-xs outline-none focus:border-[#A8D500] transition-all"
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                            {allSongs.filter(s =>
                                s.titulo.toLowerCase().includes(songSearch.toLowerCase()) ||
                                s.artista.toLowerCase().includes(songSearch.toLowerCase())
                            ).map(s => (
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
                        <button onClick={() => { setShowSongPicker(false); setSongSearch(''); }} className="mt-6 w-full py-4 bg-[#A8D500] text-black font-black rounded-2xl uppercase tracking-widest">Listo</button>
                    </div>
                </div>
            )}

            {/* PICKER: Staff */}
            {showStaffPicker && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-[#333] p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold uppercase tracking-widest">Asignar Equipo</h3>
                            <button onClick={() => { setShowStaffPicker(false); setStaffSearch(''); }} className="text-[#888]"><X /></button>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar servidor por nombre..."
                                value={staffSearch}
                                onChange={e => setStaffSearch(e.target.value)}
                                className="w-full bg-[#222] border border-[#333] rounded-2xl py-3 pl-11 pr-4 text-white text-xs outline-none focus:border-[#3B82F6] transition-all"
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                            {allMembers.filter(m =>
                                `${m.nombre} ${m.apellido}`.toLowerCase().includes(staffSearch.toLowerCase())
                            ).map(m => (
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
                        <button onClick={() => { setShowStaffPicker(false); setStaffSearch(''); }} className="mt-6 w-full py-4 bg-[#3B82F6] text-white font-black rounded-2xl uppercase tracking-widest">Listo</button>
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
                                        {cat.roles.map(r => {
                                            const roles = pendingRol.split(', ').filter(Boolean);
                                            const isSelected = roles.includes(r);
                                            return (
                                                <button
                                                    key={r}
                                                    onClick={() => {
                                                        if (isSelected) setPendingRol(roles.filter(x => x !== r).join(', '));
                                                        else setPendingRol([...roles, r].join(', '));
                                                    }}
                                                    className={`text-[10px] px-3 py-2 rounded-xl border font-bold transition-all ${isSelected
                                                        ? 'bg-[#A8D500] text-black border-transparent shadow-[0_0_10px_rgba(168,213,0,0.3)]'
                                                        : 'bg-[#222] text-[#888] border-[#333] hover:border-[#A8D50050]'
                                                        }`}
                                                >
                                                    {r}
                                                </button>
                                            );
                                        })}
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

'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';

// Modular Components
import ServiceCard from '../admin/services/ServiceCard';
import ServiceEditorModal from '../admin/services/ServiceEditorModal';
import SongPickerModal from '../admin/services/SongPickerModal';
import StaffPickerModal from '../admin/services/StaffPickerModal';
import TemplatePickerModal from '../admin/services/TemplatePickerModal';

const ROLE_CATEGORIES = [
    { name: "Audio", roles: ["Operador de Monitoreo", "Sonidista", "Streaming Audio", "Sonido"] },
    { name: "Banda", roles: ["Guitarra Acústica", "Bajo", "Directora Musical", "Batería", "Guitarra Eléctrica 1", "Guitarra Eléctrica 2", "Piano", "Teclados", "Guitarra"] },
    { name: "Medios", roles: ["Edición Multicámara", "Filmación", "Fotografía", "Slides TV", "Pantalla LED", "Livestreaming", "Luces", "YouTube CM", "Proyección"] },
    { name: "Voces", roles: ["Soprano", "Tenor", "Worship Leader", "Voz", "Vocal 1", "Vocal 2"] },
    { name: "General", roles: ["Servidor", "Ujier", "Bienvenida", "Director/Pastor"] }
];

const ServiciosView = ({ supabase, enviarNotificacionIndividual, registrarAuditoria }: {
    supabase: any,
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<void>,
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>
}) => {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [allSongs, setAllSongs] = useState<any[]>([]);
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [allMembers, setAllMembers] = useState<any[]>([]);
    const [allBlockouts, setAllBlockouts] = useState<any[]>([]);
    const [allMemberTeams, setAllMemberTeams] = useState<any[]>([]);

    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [horario, setHorario] = useState('');
    const [notas, setNotas] = useState('');
    const [detailedRows, setDetailedRows] = useState<any[]>([
        { id: '1', tiempo: '10 min', actividad: 'Alabanza', responsable: 'Banda' },
        { id: '2', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor' }
    ]);
    const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
    const [assignedStaff, setAssignedStaff] = useState<any[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [showSongPicker, setShowSongPicker] = useState(false);
    const [showStaffPicker, setShowStaffPicker] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [songSearch, setSongSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');
    const [notificarAlGuardar, setNotificarAlGuardar] = useState(false);

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

    const handleSave = async () => {
        if (!fecha) return alert("⚠️ Debes seleccionar una fecha para el servicio.");
        if (!horario) return alert("⚠️ Debes indicar el horario del servicio.");

        let finalStaff = [...assignedStaff];

        if (selectedSchedule) {
            const { data: latest } = await supabase.from('cronogramas').select('equipo_ids').eq('id', selectedSchedule.id).single();
            if (latest?.equipo_ids) {
                finalStaff = assignedStaff.map(staff => {
                    const dbStaff = latest.equipo_ids.find((d: any) => d.miembro_id === staff.miembro_id);
                    if (dbStaff) return { ...staff, estado: dbStaff.estado, motivo: dbStaff.motivo };
                    return staff;
                });
            }
        }

        const payload = {
            fecha, horario,
            notas_generales: notas,
            plan_detallado: detailedRows,
            orden_canciones: selectedSongIds,
            equipo_ids: finalStaff
        };

        const res = selectedSchedule
            ? await supabase.from('cronogramas').update(payload).eq('id', selectedSchedule.id)
            : await supabase.from('cronogramas').insert([payload]);

        if (res.error) alert("Error: " + res.error.message);
        else {
            if (notificarAlGuardar) await notificarEquipoManual({ ...payload, id: selectedSchedule?.id }, true);
            setShowModal(false);
            fetchData();
            if (registrarAuditoria) await registrarAuditoria(selectedSchedule ? 'EDITAR CRONOGRAMA' : 'CREAR CRONOGRAMA', `Plan ${fecha} (${horario})`);
        }
    };

    const notificarEquipoManual = async (sched: any, skipConfirm: boolean = false) => {
        if (!sched?.equipo_ids?.length) return alert("No hay equipo asignado.");
        if (!skipConfirm && !confirm("Se enviarán notificaciones push a los miembros pendientes. ¿Continuar?")) return;

        let enviados = 0;
        for (const staff of sched.equipo_ids) {
            if (staff.estado === 'pendiente' || !staff.estado) {
                const miembro = allMembers.find(m => m.id === staff.miembro_id);
                if (miembro?.token_notificacion && enviarNotificacionIndividual) {
                    await enviarNotificacionIndividual(miembro.token_notificacion, miembro.nombre, `🙌 Recordatorio: Has sido seleccionado para ${staff.rol} el día ${new Date(sched.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} (${sched.horario}).`);
                    enviados++;
                }
            }
        }
        if (!skipConfirm) alert(`Se enviaron ${enviados} notificaciones.`);
    };

    const deleteSchedule = async (id: string) => {
        if (!confirm("¿Eliminar este cronograma?")) return;
        await supabase.from('cronogramas').delete().eq('id', id);
        fetchData();
    };

    const exportarCSV = (sched: any) => {
        let content = "TIEMPO;ACTIVIDAD;RESPONSABLE\n";
        sched.plan_detallado?.forEach((row: any) => content += `${row.tiempo};${row.actividad};${row.responsable}\n`);
        content += "\nCANCIONES\n";
        sched.orden_canciones?.forEach((id: string, idx: number) => {
            const s = allSongs.find(song => song.id === id);
            if (s) content += `${idx + 1};${s.titulo};${s.artista}\n`;
        });
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Plan_Servicio_${sched.fecha}.csv`;
        link.click();
    };

    const toggleSong = (id: string) => {
        setSelectedSongIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const assignStaff = (m: any) => {
        if (assignedStaff.some(s => s.miembro_id === m.id)) {
            setAssignedStaff(prev => prev.filter(s => s.miembro_id !== m.id));
            return;
        }

        const overlap = schedules.find(s => s.fecha === fecha && s.id !== selectedSchedule?.id && s.equipo_ids?.some((e: any) => e.miembro_id === m.id));
        if (overlap && !confirm(`🚨 CONFLICTO: ${m.nombre} ya está en las ${overlap.horario}. ¿Asignar igual?`)) return;

        const bloqueo = allBlockouts.find(b => b.miembro_id === m.id && fecha >= b.fecha_inicio && fecha <= b.fecha_fin);
        if (bloqueo && !confirm(`⚠️ BLOQUEO: ${m.nombre} marcó NO DISPONIBLE (${bloqueo.motivo}). ¿Asignar igual?`)) return;

        const preRol = allMemberTeams.find(mt => mt.miembro_id === m.id)?.rol;
        setAssignedStaff([...assignedStaff, {
            miembro_id: m.id,
            nombre: `${m.nombre} ${m.apellido}`,
            foto_url: m.foto_url,
            rol: preRol || 'Servidor',
            estado: 'pendiente'
        }]);
    };

    const handleSelectTemplate = (template: any) => {
        setDetailedRows(template.plan);
        setShowTemplatePicker(false);
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
                    <ServiceCard
                        key={s.id}
                        service={s}
                        onEdit={handleOpenModal}
                        onDelete={deleteSchedule}
                        onNotify={notificarEquipoManual}
                        onExport={exportarCSV}
                    />
                ))}
            </div>

            {showModal && (
                <ServiceEditorModal
                    selectedSchedule={selectedSchedule}
                    fecha={fecha} setFecha={setFecha}
                    horario={horario} setHorario={setHorario}
                    notas={notas} setNotas={setNotas}
                    detailedRows={detailedRows} setDetailedRows={setDetailedRows}
                    selectedSongIds={selectedSongIds}
                    allSongs={allSongs}
                    assignedStaff={assignedStaff} setAssignedStaff={setAssignedStaff}
                    allMembers={allMembers}
                    roleCategories={ROLE_CATEGORIES}
                    notificarAlGuardar={notificarAlGuardar} setNotificarAlGuardar={setNotificarAlGuardar}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    onShowSongPicker={() => setShowSongPicker(true)}
                    onShowStaffPicker={() => setShowStaffPicker(true)}
                    onShowTemplatePicker={() => setShowTemplatePicker(true)}
                    onToggleSong={toggleSong}
                />
            )}

            {showSongPicker && (
                <SongPickerModal
                    allSongs={allSongs}
                    selectedSongIds={selectedSongIds}
                    songSearch={songSearch}
                    setSongSearch={setSongSearch}
                    toggleSong={toggleSong}
                    onClose={() => setShowSongPicker(false)}
                />
            )}

            {showStaffPicker && (
                <StaffPickerModal
                    allMembers={allMembers}
                    assignedStaff={assignedStaff}
                    staffSearch={staffSearch}
                    setStaffSearch={setStaffSearch}
                    assignStaff={assignStaff}
                    onClose={() => setShowStaffPicker(false)}
                />
            )}

            {showTemplatePicker && (
                <TemplatePickerModal
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                />
            )}
        </div>
    );
};

export default ServiciosView;

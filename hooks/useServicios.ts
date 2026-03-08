import { useState, useEffect } from 'react';

interface UseServiciosProps {
    supabase: any;
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function useServicios({ supabase, enviarNotificacionIndividual, registrarAuditoria }: UseServiciosProps) {
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
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            const [
                { data: scheds },
                { data: songs },
                { data: teams },
                { data: members },
                { data: blocks },
                { data: memberTeams }
            ] = await Promise.all([
                supabase.from('cronogramas').select('*').gte('fecha', dateStr).order('fecha', { ascending: true }),
                supabase.from('canciones').select('*').order('titulo', { ascending: true }),
                supabase.from('equipos').select('*'),
                supabase.from('miembros').select('*').eq('es_servidor', true),
                supabase.from('bloqueos_servidores').select('*'),
                supabase.from('miembros_equipos').select('*')
            ]).catch(err => {
                console.warn("Alguna tabla podría faltar:", err);
                return [{}, {}, {}, {}, {}, {}] as any;
            });

            if (scheds) setSchedules(scheds);
            if (songs) setAllSongs(songs);
            if (teams) setAllTeams(teams);
            if (members) setAllMembers(members);
            if (blocks) setAllBlockouts(blocks);
            if (memberTeams) setAllMemberTeams(memberTeams);

        } catch (error) {
            console.error("Error crítico en fetchData:", error);
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

        const esCambioHorario = selectedSchedule && selectedSchedule.horario !== horario;
        const esCambioCanciones = selectedSchedule && JSON.stringify(selectedSchedule.orden_canciones || []) !== JSON.stringify(selectedSongIds || []);
        const esActualizacionCritica = esCambioHorario || esCambioCanciones;

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
            if (notificarAlGuardar) {
                await notificarEquipoManual({ ...payload, id: selectedSchedule?.id }, true, esActualizacionCritica);
            }
            setShowModal(false);
            fetchData();
            if (registrarAuditoria) await registrarAuditoria(selectedSchedule ? 'EDITAR CRONOGRAMA' : 'CREAR CRONOGRAMA', `Plan ${fecha} (${horario})`);
        }
    };

    const notificarEquipoManual = async (sched: any, skipConfirm: boolean = false, esUpdate: boolean = false) => {
        if (!sched?.equipo_ids?.length) return alert("No hay equipo asignado.");
        if (!skipConfirm && !confirm("Se enviarán notificaciones push a los miembros. ¿Continuar?")) return;

        let totalAEnviar = 0;
        const promesas = (sched.equipo_ids || []).map(async (staff: any) => {
            if (!esUpdate && staff.estado === 'confirmado') return null;

            const miembro = allMembers.find(m => m.id === staff.miembro_id);
            if (miembro?.token_notificacion && enviarNotificacionIndividual) {
                totalAEnviar++;
                let msg = `🙌 Estás en el plan de ${staff.rol} para el ${new Date(sched.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} (${sched.horario}).`;

                if (esUpdate) {
                    msg = `⚠️ ACTUALIZACIÓN en el plan de ${staff.rol} (${new Date(sched.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })}): Se actualizó el horario o las canciones. Por favor revisalo.`;
                }

                return enviarNotificacionIndividual(miembro.token_notificacion, miembro.nombre, msg);
            }
            return null;
        });

        const resultados = await Promise.all(promesas);
        if (!skipConfirm) alert(`Se intentó notificar a ${totalAEnviar} miembros. Verifica el historial si algo falló.`);
    };

    const deleteSchedule = async (id: string) => {
        if (!confirm("¿Eliminar este cronograma?")) return;
        await supabase.from('cronogramas').delete().eq('id', id);
        fetchData();
    };

    const toggleChat = async (sched: any) => {
        const nuevoEstado = !sched.chat_activo;
        const { error } = await supabase.from('cronogramas').update({ chat_activo: nuevoEstado }).eq('id', sched.id);

        if (error) {
            alert("Error al cambiar estado del chat: " + error.message);
        } else {
            if (nuevoEstado) {
                const totalAEnviar = (sched.equipo_ids || []).filter((s: any) => s.estado === 'confirmado').length;
                if (totalAEnviar > 0 && confirm(`El chat está activo. ¿Deseas notificar a los ${totalAEnviar} miembros confirmados?`)) {
                    const promesas = (sched.equipo_ids || []).map(async (staff: any) => {
                        if (staff.estado !== 'confirmado') return null;
                        const miembro = allMembers.find(m => m.id === staff.miembro_id);
                        if (miembro?.token_notificacion && enviarNotificacionIndividual) {
                            return enviarNotificacionIndividual(
                                miembro.token_notificacion,
                                miembro.nombre,
                                `💬 ¡Chat Abierto! Ya podés coordinar con tu equipo para el plan del ${new Date(sched.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}.`
                            );
                        }
                    });
                    await Promise.all(promesas);
                }
            }
            fetchData();
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'ABRIR CHAT' : 'CERRAR CHAT', `Plan ${sched.fecha}`);
        }
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

    return {
        loading,
        schedules,
        selectedSchedule,
        allSongs,
        allTeams,
        allMembers,
        allBlockouts,
        allMemberTeams,
        fecha, setFecha,
        horario, setHorario,
        notas, setNotas,
        detailedRows, setDetailedRows,
        selectedSongIds, setSelectedSongIds,
        assignedStaff, setAssignedStaff,
        showModal, setShowModal,
        showSongPicker, setShowSongPicker,
        showStaffPicker, setShowStaffPicker,
        showTemplatePicker, setShowTemplatePicker,
        songSearch, setSongSearch,
        staffSearch, setStaffSearch,
        notificarAlGuardar, setNotificarAlGuardar,
        handleOpenModal,
        handleSave,
        notificarEquipoManual,
        deleteSchedule,
        toggleChat,
        exportarCSV,
        toggleSong,
        assignStaff,
        handleSelectTemplate
    };
}

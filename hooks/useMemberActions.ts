'use client';
import { supabase } from '../lib/supabase';

interface UseMemberActionsProps {
    fetchMiembros: () => Promise<void>;
    fetchAsistencias?: () => Promise<void>;
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function useMemberActions({
    fetchMiembros,
    fetchAsistencias,
    enviarNotificacionIndividual,
    registrarAuditoria
}: UseMemberActionsProps) {

    const toggleServerStatus = async (miembro: any) => {
        const nuevoEstado = !miembro.es_servidor;
        const { error } = await supabase
            .from('miembros')
            .update({ es_servidor: nuevoEstado })
            .eq('id', miembro.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            if (nuevoEstado && miembro.token_notificacion && enviarNotificacionIndividual) {
                await enviarNotificacionIndividual(
                    miembro.token_notificacion,
                    miembro.nombre,
                    `¡Hola ${miembro.nombre}! 🎉 Has sido habilitado como SERVIDOR en Iglesia del Salvador. ¡Gracias por sumarte al equipo! 🙌`
                );
            }
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO SERVIDOR' : 'QUITAR ACCESO SERVIDOR', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
            if (fetchAsistencias) await fetchAsistencias();
        }
    };

    const toggleAdminStatus = async (miembro: any) => {
        const nuevoEstado = !miembro.es_admin;
        const { error } = await supabase
            .from('miembros')
            .update({ es_admin: nuevoEstado })
            .eq('id', miembro.id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            if (nuevoEstado && miembro.token_notificacion && enviarNotificacionIndividual) {
                await enviarNotificacionIndividual(
                    miembro.token_notificacion,
                    miembro.nombre,
                    `¡Hola ${miembro.nombre}! 🛡️ Has sido designado como ADMINISTRADOR en Iglesia del Salvador. Ahora podés ver todos los planes de culto desde tu app.`
                );
            }
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO ADMIN' : 'QUITAR ACCESO ADMIN', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const archiveMember = async (miembro: any) => {
        if (!confirm(`¿Archivar a ${miembro.nombre} ${miembro.apellido}? Ya no aparecerá en la lista principal.`)) return;
        const { error } = await supabase.from('miembros').update({ activo: false }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('ARCHIVAR MIEMBRO', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    const restoreMember = async (miembro: any) => {
        const { error } = await supabase.from('miembros').update({ activo: true }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('RESTAURAR MIEMBRO', `${miembro.nombre} ${miembro.apellido}`);
            await fetchMiembros();
        }
    };

    return {
        toggleServerStatus,
        toggleAdminStatus,
        archiveMember,
        restoreMember
    };
}

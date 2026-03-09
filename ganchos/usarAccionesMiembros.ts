import { supabase } from '../libreria/supabase';
import { Miembro } from '../libreria/tipos';

interface PropiedadesAccionesMiembro {
    obtenerMiembros: () => Promise<void>;
    obtenerAsistencias?: () => Promise<void>;
    enviarNotificacionIndividual?: (token: string, nombre: string, mensaje: string) => Promise<any>;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
}

export function usarAccionesMiembro({
    obtenerMiembros,
    obtenerAsistencias,
    enviarNotificacionIndividual,
    registrarAuditoria
}: PropiedadesAccionesMiembro) {

    const alternarEstadoServidor = async (miembro: Miembro) => {
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
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO SERVIDOR' : 'QUITAR ACCESO SERVIDOR', `${miembro.nombre} ${miembro.apellido || ''}`);
            await obtenerMiembros();
            if (obtenerAsistencias) await obtenerAsistencias();
        }
    };

    const alternarEstadoAdmin = async (miembro: Miembro) => {
        const nuevoEstado = !miembro.es_administrador;
        const { error } = await supabase
            .from('miembros')
            .update({ es_administrador: nuevoEstado })
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
            if (registrarAuditoria) await registrarAuditoria(nuevoEstado ? 'DAR ACCESO ADMIN' : 'QUITAR ACCESO ADMIN', `${miembro.nombre} ${miembro.apellido || ''}`);
            await obtenerMiembros();
        }
    };

    const archivarMiembro = async (miembro: Miembro) => {
        if (!confirm(`¿Archivar a ${miembro.nombre} ${miembro.apellido || ''}? Ya no aparecerá en la lista principal.`)) return;
        const { error } = await supabase.from('miembros').update({ activo: false }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('ARCHIVAR MIEMBRO', `${miembro.nombre} ${miembro.apellido || ''}`);
            await obtenerMiembros();
        }
    };

    const restaurarMiembro = async (miembro: Miembro) => {
        const { error } = await supabase.from('miembros').update({ activo: true }).eq('id', miembro.id);
        if (error) alert("Error: " + error.message);
        else {
            if (registrarAuditoria) await registrarAuditoria('RESTAURAR MIEMBRO', `${miembro.nombre} ${miembro.apellido || ''}`);
            await obtenerMiembros();
        }
    };

    return {
        alternarEstadoServidor,
        alternarEstadoAdmin,
        archivarMiembro,
        restaurarMiembro
    };
}


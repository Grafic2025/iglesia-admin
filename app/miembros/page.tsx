'use client';
import VistaMiembros from '../../componentes/vistas/VistaMiembros';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function AsistenciasPage() {
    const administrador = useContextoAdmin();

    return (
        <VistaMiembros
            busqueda={administrador.busqueda}
            setBusqueda={administrador.establecerBusqueda}
            filtroHorario={administrador.filtroHorario}
            setFiltroHorario={administrador.establecerFiltroHorario}
            datosFiltrados={administrador.datosFiltrados}
            premiosPendientes={administrador.premiosPendientes}
            premiosEntregados={administrador.premiosEntregados}
            marcarComoEntregado={administrador.marcarComoEntregado}
            enviarNotificacionIndividual={administrador.enviarNotificacionIndividual}
            hoyArg={administrador.hoyArg}
            supabase={supabase}
            fetchAsistencias={administrador.obtenerAsistencias}
            fetchMiembros={administrador.obtenerMiembros}
            horariosDisponibles={administrador.horariosDisponibles}
            registrarAuditoria={administrador.registrarAuditoria}
            loading={administrador.asistenciasCargando}
        />
    );
}


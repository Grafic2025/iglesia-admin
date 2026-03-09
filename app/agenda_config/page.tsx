'use client';
import VistaConfigAgenda from '../../componentes/vistas/VistaConfigAgenda';
import { useContextoAdmin } from '../../contextos/ContextoAdmin';
import { supabase } from '../../libreria/supabase';

export default function AgendaConfigPage() {
    const administrador = useContextoAdmin();
    return (
        <VistaConfigAgenda
            supabase={supabase}
            horariosDisponibles={administrador.horariosDisponibles}
            fetchHorarios={administrador.obtenerHorarios}
            registrarAuditoria={administrador.registrarAuditoria}
        />
    );
}


import { useState } from 'react';
import { supabase } from '../libreria/supabase';
import { Asistencia } from '../libreria/tipos';

export const usarExportCSV = () => {
    const [inicioExportacion, establecerInicioExportacion] = useState('');
    const [finExportacion, establecerFinExportacion] = useState('');
    const [mostrarModalExportacion, establecerMostrarModalExportacion] = useState(false);

    const exportarCSVGlobal = (fechaSeleccionada: string, asistencias: Asistencia[]) => {
        const encabezados = "ID,Nombre,Apellido,DNI/ID_Miembro,Reunion,Hora Ingreso,Fecha,Racha Actual\n";
        const filas = asistencias.map(a => `${a.id},${a.miembros?.nombre || ''},${a.miembros?.apellido || ''},${a.miembro_id},${a.horario_reunion},${a.hora_entrada},${a.fecha},${a.racha}`).join("\n");
        const bom = "\uFEFF";
        const blob = new Blob([bom + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Reporte_IDS_${fechaSeleccionada}.csv`;
        enlace.click();
    };

    const exportarCSVRango = async (fechaSeleccionada: string) => {
        const desde = inicioExportacion || fechaSeleccionada;
        const hasta = finExportacion || fechaSeleccionada;

        const { data, error } = await supabase
            .from('asistencias')
            .select('id, miembro_id, horario_reunion, hora_entrada, fecha, miembros(nombre, apellido)')
            .gte('fecha', desde)
            .lte('fecha', hasta)
            .order('fecha', { ascending: true });

        if (error || !data) { alert('Error al obtener datos'); return; }

        const encabezados = "ID,Nombre,Apellido,ID_Miembro,Horario,Hora Entrada,Fecha\n";
        const filas = data.map((a: any) =>
            `${a.id},${a.miembros?.nombre || ''},${a.miembros?.apellido || ''},${a.miembro_id},${a.horario_reunion},${a.hora_entrada},${a.fecha}`
        ).join("\n");
        const bom = "\uFEFF";
        const blob = new Blob([bom + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Reporte_IDS_${desde}_al_${hasta}.csv`;
        enlace.click();
        establecerMostrarModalExportacion(false);
    };

    return {
        inicioExportacion, establecerInicioExportacion,
        finExportacion, establecerFinExportacion,
        mostrarModalExportacion, establecerMostrarModalExportacion,
        exportarCSVGlobal, exportarCSVRango
    };
};


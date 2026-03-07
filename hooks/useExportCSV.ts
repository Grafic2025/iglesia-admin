import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useExportCSV = () => {
    const [exportStart, setExportStart] = useState('');
    const [exportEnd, setExportEnd] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);

    const exportarCSVGlobal = (fechaSeleccionada: string, asistencias: any[]) => {
        const encabezados = "ID,Nombre,Apellido,DNI/ID_Miembro,Reunion,Hora Ingreso,Fecha,Racha Actual\n";
        const filas = asistencias.map(a => `${a.id},${a.miembros?.nombre || ''},${a.miembros?.apellido || ''},${a.miembro_id},${a.horario_reunion},${a.hora_entrada},${a.fecha},${a.racha}`).join("\n");
        const bom = "\uFEFF";
        const blob = new Blob([bom + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Reporte_IDS_${fechaSeleccionada}.csv`;
        link.click();
    };

    const exportarCSVRango = async (fechaSeleccionada: string) => {
        const desde = exportStart || fechaSeleccionada;
        const hasta = exportEnd || fechaSeleccionada;

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
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Reporte_IDS_${desde}_al_${hasta}.csv`;
        link.click();
        setShowExportModal(false);
    };

    return {
        exportStart, setExportStart,
        exportEnd, setExportEnd,
        showExportModal, setShowExportModal,
        exportarCSVGlobal, exportarCSVRango
    };
};

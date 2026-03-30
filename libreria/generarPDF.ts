import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarReporteAsistenciaPDF = (data: any[], fecha: string) => {
    const doc = new jsPDF() as any;

    // Logo / Cabecera (Simulado con texto pro)
    doc.setFillColor(16, 16, 16);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(168, 213, 0); // Verde IDS
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('IDS DIGITAL - REPORTE DE ASISTENCIA', 15, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`FECHA DEL REPORTE: ${fecha}`, 15, 32);

    // Contenido
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Resumen de Miembros Presentes', 15, 55);

    const tablaColumnas = ["Nombre y Apellido", "Horario", "Célula / Equipo"];
    const tablaFilas = data.map(item => [
        `${item.miembros?.nombre} ${item.miembros?.apellido}`,
        item.horario_reunion || 'N/A',
        item.miembros?.celula || 'S/C'
    ]);

    doc.autoTable({
        startY: 65,
        head: [tablaColumnas],
        body: tablaFilas,
        theme: 'striped',
        headStyles: { fillColor: [168, 213, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount} - Generado por IDS Admin Panel`, 15, 285);
    }

    doc.save(`Reporte_Asistencia_${fecha}.pdf`);
};

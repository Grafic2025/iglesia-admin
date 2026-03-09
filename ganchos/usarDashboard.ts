import { useState, useMemo, useEffect } from 'react';

import { Miembro, Asistencia, AsistenciaDiaria, CrecimientoAnual } from '../libreria/tipos';

const RANGOS_CRECIMIENTO = [
    { clave: '3M', etiqueta: '3 meses', meses: 3 },
    { clave: '6M', etiqueta: '6 meses', meses: 6 },
    { clave: '12M', etiqueta: '12 meses', meses: 12 },
];

const COLORES = ['#A8D500', '#00D9FF', '#FFB400', '#9333EA', '#FF4444', '#3B82F6'];

interface PropiedadesDashboard {
    asistencias: Asistencia[];
    asistencias7dias: AsistenciaDiaria[];
    crecimientoAnual: CrecimientoAnual[];
    miembros: Miembro[];
}

export function usarDashboard({
    asistencias,
    asistencias7dias,
    crecimientoAnual,
    miembros = []
}: PropiedadesDashboard) {
    const [rangoCrecimiento, establecerRangoCrecimiento] = useState('12M');

    const datosDemograficos = useMemo(() => {
        const edades = { 'Niños (<13)': 0, 'Adolescentes (13-17)': 0, 'Jóvenes (18-29)': 0, 'Adultos (30-59)': 0, 'Mayores (60+)': 0, 'S/D': 0 };

        miembros.forEach(m => {
            if (m.fecha_nacimiento) {
                const fechaNacimiento = new Date(m.fecha_nacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mesDiferencia = hoy.getMonth() - fechaNacimiento.getMonth();
                if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }

                if (edad < 13) edades['Niños (<13)']++;
                else if (edad < 18) edades['Adolescentes (13-17)']++;
                else if (edad < 30) edades['Jóvenes (18-29)']++;
                else if (edad < 60) edades['Adultos (30-59)']++;
                else edades['Mayores (60+)']++;
            } else {
                edades['S/D']++;
            }
        });

        const graficoEdades = Object.entries(edades).map(([nombre, valor]) => ({ nombre, valor })).filter(d => d.valor > 0);
        return { graficoEdades };
    }, [miembros]);

    const crecimientoFiltrado = useMemo(() => {
        const configRango = RANGOS_CRECIMIENTO.find(r => r.clave === rangoCrecimiento);
        if (!configRango || !crecimientoAnual.length) return crecimientoAnual;
        return crecimientoAnual.slice(-configRango.meses);
    }, [crecimientoAnual, rangoCrecimiento]);

    const ultimosMiembros = useMemo(() => {
        return [...miembros]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 5);
    }, [miembros]);

    const proximosCumpleanos = useMemo(() => {
        const hoy = new Date();
        const hoyMes = hoy.getMonth() + 1; // 1-12
        const hoyDia = hoy.getDate(); // 1-31

        const conCumple = miembros.filter(m => m.fecha_nacimiento);
        const mapCumple = conCumple.map(m => {
            const [y, mStr, dStr] = m.fecha_nacimiento!.split('-');
            const mesNac = parseInt(mStr, 10);
            const diaNac = parseInt(dStr, 10);

            // Calcular diferencia en "días aproximados" en el año actual
            let diffMes = mesNac - hoyMes;
            let diffDia = diaNac - hoyDia;

            // Si el cumpleaños ya pasó este año, sumamos 12 meses para el proxy de ordenamiento
            if (diffMes < 0 || (diffMes === 0 && diffDia < 0)) {
                diffMes += 12;
            }

            // Un peso numérico simple para ordenar por proximidad
            const proxy = diffMes * 31 + diffDia;
            return { miembro: m, proxy, esHoy: diffMes === 0 && diffDia === 0 };
        });

        // Filtrar solo los que cumplen en los próximos 30 días aprox (proxy <= 30) y ordenarlos
        const cercanos = mapCumple
            .filter(item => item.proxy >= 0 && item.proxy <= 31)
            .sort((a, b) => a.proxy - b.proxy)
            .slice(0, 6)
            .map(item => ({ ...item.miembro, proxy: item.proxy }));

        return cercanos;
    }, [miembros]);

    const conteoHoy = (asistencias || []).length;
    const conteoAyer = (asistencias7dias || []).length >= 2 ? asistencias7dias[asistencias7dias.length - 2]?.total || 0 : 0;
    const tendenciaHoy = conteoAyer > 0 ? Math.round(((conteoHoy - conteoAyer) / conteoAyer) * 100) : null;

    const fechaUltimoServicio = (asistencias7dias || []).filter(d => d.total > 0).slice(-1)[0];
    const [proximoDomingoTexto, establecerProximoDomingoTexto] = useState('');

    useEffect(() => {
        const proximoDomingo = new Date();
        proximoDomingo.setDate(proximoDomingo.getDate() + ((7 - proximoDomingo.getDay()) % 7 || 7));
        establecerProximoDomingoTexto(proximoDomingo.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, []);

    return {
        rangoCrecimiento,
        establecerRangoCrecimiento,
        datosDemograficos,
        crecimientoFiltrado,
        conteoHoy,
        tendenciaHoy,
        fechaUltimoServicio,
        proximoDomingoTexto,
        ultimosMiembros,
        proximosCumpleanos,
        RANGOS_CRECIMIENTO,
        COLORES
    };
}


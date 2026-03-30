'use client'
import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import TarjetaEstado from '../TarjetaEstado';

// Componentes Modulares
import GraficoAsistencia from '../administrador/panel/GraficoAsistencia';
import GraficoCrecimiento from '../administrador/panel/GraficoCrecimiento';
import GraficoDemografico from '../administrador/panel/GraficoDemografico';
import InfoRapidaServicio from '../administrador/panel/InfoRapidaServicio';
import ResumenActividad from '../administrador/panel/ResumenActividad';
import UltimosMiembros from '../administrador/panel/UltimosMiembros';
import ProximosCumpleanos from '../administrador/panel/ProximosCumpleanos';
import UltimaAuditoria from '../administrador/panel/UltimaAuditoria';
import RetencionMensual from '../administrador/panel/RetencionMensual';
import TareasPendientes from '../administrador/panel/TareasPendientes';
import RadarAusencias from '../administrador/panel/RadarAusencias';
import TermometroServidores from '../administrador/panel/TermometroServidores';
import { TarjetaEsqueleto, SeccionEsqueleto } from '../diseno/CargandoEsqueleto';
import { generarReporteAsistenciaPDF } from '../../libreria/generarPDF';
import { FileText, Download, TrendingUp } from 'lucide-react';

import { usarDashboard } from '../../ganchos/usarDashboard';

interface VistaPanelProps {
    asistencias: any[];
    asistencias7dias: any[];
    oracionesActivas: number;
    nuevosMes: number;
    crecimientoAnual: any[];
    horariosReunion: any[];
    miembros: any[];
    bautismos: any[];
    ayuda: any[];
    tasaRetencion: number;
    ausentes: any[];
    servidoresQuemados: any[];
    logsAuditoria?: any[];
    loading?: boolean;
    fechaSeleccionada: string;
    establecerFechaSeleccionada: (f: string) => void;
}

const VistaPanel = ({
    asistencias,
    asistencias7dias,
    oracionesActivas,
    nuevosMes,
    crecimientoAnual,
    horariosReunion,
    miembros,
    bautismos,
    ayuda,
    tasaRetencion,
    ausentes,
    servidoresQuemados,
    logsAuditoria = [],
    loading = false,
    fechaSeleccionada,
    establecerFechaSeleccionada
}: VistaPanelProps) => {
    const {
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
    } = usarDashboard({ asistencias, asistencias7dias, crecimientoAnual, miembros });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-[#1a1a1a] border border-white/5 rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TarjetaEsqueleto />
                    <TarjetaEsqueleto />
                    <TarjetaEsqueleto />
                    <TarjetaEsqueleto />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-[#1a1a1a] border border-white/5 rounded-3xl animate-pulse"></div>
                    <div className="h-64 bg-[#1a1a1a] border border-white/5 rounded-3xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <ResumenActividad
                    oracionesActivas={oracionesActivas}
                    nuevosMes={nuevosMes}
                    asistenciaHoy={conteoHoy}
                />
                <button 
                    onClick={() => generarReporteAsistenciaPDF(asistencias, fechaSeleccionada)}
                    className="group bg-white/5 hover:bg-[var(--accent)] text-white hover:text-black border border-white/10 hover:border-transparent px-6 py-3 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center gap-3 shadow-xl"
                >
                    <FileText size={18} className="transition-transform group-hover:scale-110" />
                    Generar Reporte PDF
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <TarjetaEstado
                    label="Total Hoy"
                    value={conteoHoy}
                    color="var(--accent)"
                    isActive={conteoHoy > 0}
                    icon={<LayoutDashboard size={18} />}
                    trend={tendenciaHoy}
                />
                {(horariosReunion || []).map(h => (
                    <TarjetaEstado
                        key={h}
                        label={`${h} HS`}
                        value={(asistencias || []).filter(a => a.horario_reunion === h).length}
                        color="#fff"
                        isActive={(asistencias || []).filter(a => a.horario_reunion === h).length > 0}
                    />
                ))}
                <TarjetaEstado
                    label="Extra"
                    value={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length}
                    color="#FFB400"
                    isActive={(asistencias || []).filter(a => a.horario_reunion === 'Extraoficial').length > 0}
                />
                <TarjetaEstado label="Oraciones" value={oracionesActivas} color="#9333EA" isActive={oracionesActivas > 0} icon="🙏" />
                <TarjetaEstado label="Bautismos" value={bautismos?.length || 0} color="#3B82F6" isActive={(bautismos?.length || 0) > 0} icon="💧" />
                <TarjetaEstado label="Acompañamiento" value={ayuda?.length || 0} color="#EF4444" isActive={(ayuda?.length || 0) > 0} icon="🤝" />
                <TarjetaEstado label="Retención 30D" value={`${tasaRetencion || 0}%`} color="#FFB400" isActive={tasaRetencion > 0} icon="✨" />
                <TarjetaEstado label="Nuevos Mes" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="📈" />
            </div>

            <InfoRapidaServicio
                lastServiceDate={fechaUltimoServicio}
                nextSundayString={proximoDomingoTexto}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GraficoAsistencia 
                    data={asistencias7dias} 
                    onBarClick={(fecha) => establecerFechaSeleccionada(fecha)}
                />

                <GraficoCrecimiento
                    data={crecimientoFiltrado}
                    growthRange={rangoCrecimiento}
                    setGrowthRange={establecerRangoCrecimiento}
                    GROWTH_RANGES={RANGOS_CRECIMIENTO}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <GraficoDemografico
                        data={datosDemograficos.graficoEdades}
                        COLORS={COLORES}
                    />
                </div>
                <div className="lg:col-span-1">
                    <ProximosCumpleanos cumpleanos={proximosCumpleanos} />
                </div>
                <div className="lg:col-span-1">
                    <UltimosMiembros miembros={ultimosMiembros} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <RetencionMensual tasa={tasaRetencion} activos={conteoHoy} total={miembros.length} />
                </div>
                <div className="lg:col-span-1">
                    <TareasPendientes ayuda={ayuda} bautismos={bautismos} />
                </div>
                <div className="lg:col-span-1">
                    <RadarAusencias ausentes={ausentes} />
                </div>
                <div className="lg:col-span-1">
                    <TermometroServidores servidoresQuemados={servidoresQuemados} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <UltimaAuditoria logsAuditoria={logsAuditoria} />
                </div>
            </div>
        </div>
    );
};

export default VistaPanel;


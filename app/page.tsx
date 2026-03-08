'use client'
import React from 'react'
import Sidebar from '../components/Sidebar'
import DashboardView from '../components/views/DashboardView'
import MiembrosView from '../components/views/MiembrosView'
import NotificacionesView from '../components/views/NotificacionesView'
import CMSView from '../components/views/CMSView'
import ServiciosView from '../components/views/ServiciosView'
import GenteView from '../components/views/GenteView'
import EquiposView from '../components/views/EquiposView'
import CancioneroView from '../components/views/CancioneroView'
import AgendaConfigView from '../components/views/AgendaConfigView'
import AuditoriaView from '../components/views/AuditoriaView'
import AlertasView from '../components/views/AlertasView'
import SolicitudesView from '../components/views/SolicitudesView'
import BotView from '../components/views/BotView'
import { LogOut, ShieldAlert } from 'lucide-react'

// Custom Hooks
import { useAdminMaster } from '../hooks/useAdminMaster'

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  miembros: 'Asistencias',
  gente: 'Gente',
  notificaciones: 'Mensajería',
  solicitudes: 'Solicitudes',
  cms: 'Contenido',
  servicios: 'Plan de Culto',
  equipos: 'Equipos / Servir',
  cancionero: 'Cancionero',
  agenda_config: 'Configuración de Agenda',
  auditoria: 'Auditoría',
  alertas: 'Retención (Alertas)',
  bot: 'IDS BOT',
};

/**
 * Componente raíz del Panel de Administración.
 * Maneja la autenticación y la coordinación de datos globales.
 */
export default function AdminDashboard() {
  const {
    authorized,
    password, setPassword,
    activeTab, setActiveTab,
    handleLogin,
    handleLogout,
    loginLocked, lockTimer,

    // Asistencias / Miembros
    miembros, fetchMiembros,
    asistencias, asistencias7dias, fetchAsistencias,
    datosFiltrados,
    busqueda, setBusqueda,
    filtroHorario, setFiltroHorario,
    fechaSeleccionada, setFechaSeleccionada,
    horariosDisponibles, fetchHorarios,

    // CMS / Notificaciones
    noticias, fetchNoticias, syncYouTube, eliminarNoticia,
    logs, fetchLogs, logsError,
    tituloPush, setTituloPush,
    mensajePush, setMensajePush,
    imageUrlPush, setImageUrlPush,
    typePush, setTypePush,
    enviarNotificacion,
    enviando,
    notificacionStatus,
    enviarNotificacionIndividual,

    // CSV
    exportStart, setExportStart,
    exportEnd, setExportEnd,
    showExportModal, setShowExportModal,
    exportarCSV,
    exportarCSVRango,

    // Dashboard Data
    cronogramas, fetchCronogramas,
    premiosPendientes,
    oracionesActivas,
    nuevosMes,
    premiosEntregados,
    bautismos,
    ayuda,
    auditLogs,
    crecimientoAnual,
    hoyArg,
    registrarAuditoria,
    marcarComoEntregado,
  } = useAdminMaster();

  if (!authorized) return (
    <div className="h-screen flex items-center justify-center bg-[#121212] font-sans">
      <div className="bg-[#1e1e1e] p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-8">
          <div className="bg-red-500/10 p-5 rounded-full border border-red-500/20">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">Panel Principal</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 px-1">Contraseña de Acceso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-[#2a2a2a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              disabled={loginLocked}
            />
          </div>
          <button
            type="submit"
            disabled={loginLocked}
            className={`w-full p-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${loginLocked
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
              }`}
          >
            {loginLocked ? `Bloqueado (${lockTimer}s)` : 'Entrar al Panel'}
          </button>
        </form>
        {loginLocked && (
          <p className="mt-4 text-center text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            Demasiados intentos fallidos. Por favor, espere.
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-gray-100 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Superior */}
        <header className="h-20 bg-[#161616] border-b border-white/5 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {TAB_LABELS[activeTab]}
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Iglesia del Salvador • Gestión Rev</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {activeTab === 'miembros' && (
              <div className="flex items-center gap-3 bg-[#1e1e1e] p-1.5 rounded-xl border border-white/5 shadow-inner">
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="bg-transparent text-white px-3 py-1.5 rounded-lg focus:outline-none text-sm font-medium"
                />
                <button
                  onClick={exportarCSV}
                  className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Exportar Hoy
                </button>
                <button
                  onClick={() => {
                    setExportStart(fechaSeleccionada);
                    setExportEnd(fechaSeleccionada);
                    setShowExportModal(true);
                  }}
                  className="bg-[#2a2a2a] hover:bg-[#333] text-gray-300 px-5 py-2 rounded-lg text-sm font-bold transition-all border border-white/5"
                >
                  Rango...
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-white/5"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido de la Vista */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              asistencias={asistencias}
              asistencias7dias={asistencias7dias}
              oracionesActivas={oracionesActivas}
              nuevosMes={nuevosMes}
              crecimientoAnual={crecimientoAnual}
              horariosReunion={horariosDisponibles}
              miembrosTotales={miembros.length}
            />
          )}

          {activeTab === 'miembros' && (
            <MiembrosView
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              filtroHorario={filtroHorario}
              setFiltroHorario={setFiltroHorario}
              datosFiltrados={datosFiltrados}
              premiosPendientes={premiosPendientes}
              premiosEntregados={premiosEntregados}
              marcarComoEntregado={marcarComoEntregado}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
              fecha={hoyArg}
              fetchAsistencias={fetchAsistencias}
              fetchMiembros={fetchMiembros}
              horariosReunion={horariosDisponibles}
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'gente' && (
            <GenteView
              miembros={miembros}
              fechaHoy={hoyArg}
              fetchMiembros={fetchMiembros}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
            />
          )}

          {activeTab === 'notificaciones' && (
            <NotificacionesView
              tituloPush={tituloPush}
              setTituloPush={setTituloPush}
              mensajePush={mensajePush}
              setMensajePush={setMensajePush}
              imageUrlPush={imageUrlPush}
              setImageUrlPush={setImageUrlPush}
              filtroHorario={filtroHorario}
              setFiltroHorario={setFiltroHorario}
              enviarNotificacion={enviarNotificacion}
              enviando={enviando}
              notificacionStatus={notificacionStatus}
              cronogramas={cronogramas}
              horariosReunion={horariosDisponibles}
              fetchCronogramas={fetchCronogramas}
              registrarAuditoria={registrarAuditoria}
              typePush={typePush}
              setTypePush={setTypePush}
            />
          )}

          {activeTab === 'solicitudes' && (
            <SolicitudesView
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'alertas' && (
            <AlertasView
              setActiveTab={setActiveTab}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
            />
          )}

          {activeTab === 'cms' && <CMSView />}
          {activeTab === 'servicios' && (
            <ServiciosView
              horariosReunion={horariosDisponibles}
              fetchHorarios={fetchHorarios}
              registrarAuditoria={registrarAuditoria}
            />
          )}
          {activeTab === 'auditoria' && (
            <AuditoriaView auditLogs={auditLogs} />
          )}
          {activeTab === 'equipos' && (
            <EquiposView registrarAuditoria={registrarAuditoria} />
          )}
          {activeTab === 'cancionero' && <CancioneroView />}
          {activeTab === 'agenda_config' && <AgendaConfigView />}
          {activeTab === 'bot' && <BotView />}
        </div>

        {/* Modal de Exportación por Rango */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                Exportar por Rango
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest px-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={exportStart}
                    onChange={(e) => setExportStart(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest px-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={exportEnd}
                    onChange={(e) => setExportEnd(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all border border-white/5"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      exportarCSVRango(exportStart, exportEnd);
                      setShowExportModal(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                  >
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

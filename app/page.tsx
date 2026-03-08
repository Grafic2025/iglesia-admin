'use client'
import React from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import AdminHeader from '../components/layout/AdminHeader'
import ExportModal from '../components/layout/ExportModal'
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
import { ShieldAlert } from 'lucide-react'
import { TAB_LABELS } from './constants'

// Custom Hooks
import { useAdminMaster } from '../hooks/useAdminMaster'

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
    enviarPushGeneral,
    enviando,
    notificacionStatus,
    enviarNotificacionIndividual,
    eliminarProgramacion,

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
          <p className="text-center mt-6 text-red-500 text-sm font-bold animate-pulse flex items-center justify-center gap-2">
            ⚠️ Demasiados intentos fallidos.
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden font-sans selection:bg-red-500/30">
      {/* Sidebar - Ahora es un componente desacoplado */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Superior Desacoplado */}
        <AdminHeader
          activeTab={activeTab}
          fechaSeleccionada={fechaSeleccionada}
          setFechaSeleccionada={setFechaSeleccionada}
          exportarCSV={exportarCSV}
          setExportStart={setExportStart}
          setExportEnd={setExportEnd}
          setShowExportModal={setShowExportModal}
          handleLogout={handleLogout}
        />

        {/* Notificaciones flotantes */}
        {notificacionStatus.show && (
          <div className={`fixed top-24 right-10 z-[100] p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-500 ${notificacionStatus.error ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}>
            <div className={`w-2 h-2 rounded-full ${notificacionStatus.error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="font-bold text-sm">{notificacionStatus.message}</span>
          </div>
        )}

        {/* Area de Contenido */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              asistencias={asistencias}
              asistencias7dias={asistencias7dias}
              oracionesActivas={oracionesActivas}
              nuevosMes={nuevosMes}
              crecimientoAnual={crecimientoAnual}
              horariosReunion={horariosDisponibles}
              miembros={miembros}
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
              hoyArg={hoyArg}
              supabase={supabase}
              fetchAsistencias={fetchAsistencias}
              fetchMiembros={fetchMiembros}
              horariosDisponibles={horariosDisponibles}
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'gente' && (
            <GenteView
              miembros={miembros}
              hoyArg={hoyArg}
              fetchMiembros={fetchMiembros}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
              registrarAuditoria={registrarAuditoria}
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
              eliminarProgramacion={eliminarProgramacion}
              fetchProgramaciones={fetchCronogramas}
              supabase={supabase}
              logs={logs}
              logsError={logsError}
              horariosDisponibles={horariosDisponibles}
              registrarAuditoria={registrarAuditoria}
              typePush={typePush}
              setTypePush={setTypePush}
            />
          )}

          {activeTab === 'solicitudes' && (
            <SolicitudesView
              bautismos={bautismos}
              ayuda={ayuda}
            />
          )}

          {activeTab === 'alertas' && (
            <AlertasView
              supabase={supabase}
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'cms' && (
            <CMSView
              noticias={noticias}
              syncYouTube={syncYouTube}
              eliminarNoticia={eliminarNoticia}
              supabase={supabase}
              fetchNoticias={fetchNoticias}
              registrarAuditoria={registrarAuditoria}
              enviarPushGeneral={enviarPushGeneral}
            />
          )}
          {activeTab === 'servicios' && (
            <ServiciosView
              supabase={supabase}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
              registrarAuditoria={registrarAuditoria}
            />
          )}
          {activeTab === 'auditoria' && (
            <AuditoriaView logs={auditLogs} />
          )}
          {activeTab === 'equipos' && (
            <EquiposView
              supabase={supabase}
              registrarAuditoria={registrarAuditoria}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
            />
          )}
          {activeTab === 'cancionero' && <CancioneroView supabase={supabase} />}
          {activeTab === 'agenda_config' && (
            <AgendaConfigView
              supabase={supabase}
              horariosDisponibles={horariosDisponibles}
              fetchHorarios={fetchHorarios}
              registrarAuditoria={registrarAuditoria}
            />
          )}
          {activeTab === 'bot' && <BotView supabase={supabase} registrarAuditoria={registrarAuditoria} />}
        </div>

        {/* Modal de Exportación Desacoplado */}
        <ExportModal
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
          exportStart={exportStart}
          setExportStart={setExportStart}
          exportEnd={exportEnd}
          setExportEnd={setExportEnd}
          exportarCSVRango={exportarCSVRango}
          fechaSeleccionada={fechaSeleccionada}
        />
      </main>
    </div>
  )
}

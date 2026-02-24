'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
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
import { LogOut, ShieldAlert } from 'lucide-react'

// Custom Hooks
import { useMiembros } from '../hooks/useMiembros'
import { useAsistencias } from '../hooks/useAsistencias'
import { useNoticias } from '../hooks/useNoticias'
import { useNotificaciones } from '../hooks/useNotificaciones'

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  miembros: 'Asistencias',
  gente: 'Gente',
  notificaciones: 'Mensajería',
  cms: 'Contenido',
  servicios: 'Plan de Culto',
  equipos: 'Equipos / Servir',
  cancionero: 'Cancionero',
  agenda_config: 'Configuración de Agenda',
  auditoria: 'Auditoría',
  alertas: 'Retención (Alertas)',
};

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  // UI States
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }))
  const [tituloPush, setTituloPush] = useState('Iglesia del Salvador')
  const [mensajePush, setMensajePush] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [notificacionStatus, setNotificacionStatus] = useState({ show: false, message: '', error: false })
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [loginLocked, setLoginLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const [exportStart, setExportStart] = useState('')
  const [exportEnd, setExportEnd] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)

  // Custom Hooks Data
  const { miembros, fetchMiembros, toggleServerStatus } = useMiembros();
  const { asistencias, asistencias7dias, fetchAsistencias, fetchAsistencias7dias } = useAsistencias(fechaSeleccionada);
  const { noticias, fetchNoticias, syncYouTube, eliminarNoticia } = useNoticias();
  const { logs, fetchLogs, enviarPushGeneral, error: logsError } = useNotificaciones();

  // Other complex states (to be refactored eventually)
  const [cronogramas, setCronogramas] = useState<any[]>([])
  const [premiosPendientes, setPremiosPendientes] = useState<any>({ nivel5: [], nivel10: [], nivel20: [], nivel30: [] })
  const [oracionesActivas, setOracionesActivas] = useState(0)
  const [nuevosMes, setNuevosMes] = useState(0)
  const [premiosEntregados, setPremiosEntregados] = useState<any[]>([])
  const [bautismos, setBautismos] = useState<any[]>([])
  const [ayuda, setAyuda] = useState<any[]>([])
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [crecimientoAnual, setCrecimientoAnual] = useState<any[]>([])

  const hoyArg = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth')
    if (isAuth === 'true') setAuthorized(true)

    // HTTPS check (only in production)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'https:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, [])

  const fetchCronogramas = useCallback(async () => {
    const { data } = await supabase.from('cronogramas').select('*').order('fecha', { ascending: true }).limit(20);
    if (data) setCronogramas(data);
  }, []);

  const calcularOracionesActivas = useCallback(async () => {
    // Removed .eq('activo', true) as it might not exist, or could be 'activa'
    const { count } = await supabase.from('pedidos_oracion').select('*', { count: 'exact', head: true });
    setOracionesActivas(count || 0);
  }, []);

  const calcularNuevosMes = useCallback(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    // Setting time to 00:00:00 to avoid issues
    monthStart.setHours(0, 0, 0, 0);
    const { count } = await supabase.from('miembros').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString());
    setNuevosMes(count || 0);
  }, []);

  const cargarPremiosEntregados = useCallback(async () => {
    const { data } = await supabase.from('premios_entregados').select('*').order('created_at', { ascending: false });
    if (data) setPremiosEntregados(data);
  }, []);

  const fetchBautismos = useCallback(async () => {
    // Simplified query to troubleshoot 400 error
    const { data } = await supabase.from('solicitudes_bautismo').select('*, miembro_id').order('created_at', { ascending: false });
    if (data) setBautismos(data);
  }, []);

  const fetchAyuda = useCallback(async () => {
    // Simplified query to troubleshoot 400 error
    const { data } = await supabase.from('consultas_ayuda').select('*, miembro_id').order('created_at', { ascending: false });
    if (data) setAyuda(data);
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    const { data } = await supabase.from('auditoria').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setAuditLogs(data);
  }, []);

  const fetchHorarios = useCallback(async () => {
    const { data } = await supabase.from('configuracion').select('*').eq('clave', 'horarios_reunion').maybeSingle();
    if (data) setHorariosDisponibles(data.valor || []);
    else setHorariosDisponibles(['09:00', '11:00', '20:00']);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    // Analytics simplified
  }, []);

  const fetchCrecimientoAnual = useCallback(async () => {
    const dummy = [
      { mes: 'Ene', c: 150 }, { mes: 'Feb', c: 165 }, { mes: 'Mar', c: 180 },
      { mes: 'Abr', c: 195 }, { mes: 'May', c: 210 }, { mes: 'Jun', c: 240 },
      { mes: 'Jul', c: 265 }, { mes: 'Ago', c: 290 }, { mes: 'Sep', c: 310 },
      { mes: 'Oct', c: 340 }, { mes: 'Nov', c: 365 }, { mes: 'Dic', c: 400 }
    ];
    setCrecimientoAnual(dummy);
  }, []);

  // 1. Initial Data Fetch (On Mount / Auth)
  useEffect(() => {
    if (authorized) {
      fetchMiembros();
      fetchCronogramas();
      calcularOracionesActivas();
      calcularNuevosMes();
      cargarPremiosEntregados();
      fetchBautismos();
      fetchAyuda();
      fetchNoticias();
      fetchLogs();
      fetchCrecimientoAnual();
      fetchHorarios();
      fetchAuditLogs();
      fetchAnalytics();
    }
  }, [authorized, fetchMiembros, fetchCronogramas, calcularOracionesActivas, calcularNuevosMes, cargarPremiosEntregados, fetchBautismos, fetchAyuda, fetchNoticias, fetchLogs, fetchCrecimientoAnual, fetchHorarios, fetchAuditLogs, fetchAnalytics]);

  // 2. Date-specific Fetch
  useEffect(() => {
    if (authorized) {
      fetchAsistencias();
      fetchAsistencias7dias();
    }
  }, [authorized, fechaSeleccionada, fetchAsistencias, fetchAsistencias7dias]);

  // 3. Realtime subscriptions
  useEffect(() => {
    if (authorized) {
      const channels = [
        supabase.channel('cambios-asistencias').on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias()).subscribe(),
        supabase.channel('cambios-programas').on('postgres_changes', { event: '*', schema: 'public', table: 'cronogramas' }, () => fetchCronogramas()).subscribe(),
        supabase.channel('cambios-logs').on('postgres_changes', { event: '*', schema: 'public', table: 'notificacion_logs' }, () => fetchLogs()).subscribe()
      ];

      return () => {
        channels.forEach(ch => supabase.removeChannel(ch));
      };
    }
  }, [authorized, fetchAsistencias, fetchCronogramas, fetchLogs, fetchMiembros, fetchNoticias, calcularOracionesActivas]);

  const calcularPremios = useCallback(() => {
    const pend: any = { nivel5: [], nivel10: [], nivel20: [], nivel30: [] };
    miembros.forEach(m => {
      const asist = asistencias.filter(a => a.miembro_id === m.id);
      const racha = asist.length;
      if (racha >= 30) pend.nivel30.push({ ...m, racha });
      else if (racha >= 20) pend.nivel20.push({ ...m, racha });
      else if (racha >= 10) pend.nivel10.push({ ...m, racha });
      else if (racha >= 5) pend.nivel5.push({ ...m, racha });
    });
    setPremiosPendientes(pend);
  }, [miembros, asistencias]);

  useEffect(() => {
    calcularPremios();
  }, [miembros, asistencias, calcularPremios]);

  const registrarAuditoria = async (accion: string, detalle: string) => {
    await supabase.from('auditoria').insert([{ accion, detalle, admin_id: 'admin_general' }]);
    fetchAuditLogs();
  }

  const marcarComoEntregado = async (miembroId: string, nivel: number, nombreCompleto: string) => {
    if (!confirm(`¿Marcar como entregado el premio de nivel ${nivel} para ${nombreCompleto}?`)) return;
    const { error } = await supabase.from('premios_entregados').insert({ miembro_id: miembroId, nivel, entregado_por: 'Admin', notas: '' });
    if (error) alert('Error: ' + error.message);
    else { alert('✅ Premio entregado'); cargarPremiosEntregados(); fetchAsistencias(); }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginLocked) return;
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthorized(true); localStorage.setItem('admin_auth', 'true');
      setLoginAttempts(0);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLoginLocked(true);
        let seconds = 30;
        setLockTimer(seconds);
        const interval = setInterval(() => {
          seconds--;
          setLockTimer(seconds);
          if (seconds <= 0) {
            clearInterval(interval);
            setLoginLocked(false);
            setLoginAttempts(0);
          }
        }, 1000);
        return;
      }
      alert(`Contraseña incorrecta (${newAttempts}/5 intentos)`);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth'); setAuthorized(false); setPassword('');
  }

  const enviarNotificacion = async () => {
    if (!mensajePush) return;
    setEnviando(true);
    const result = await enviarPushGeneral(tituloPush, mensajePush);
    if (result.success) {
      setNotificacionStatus({ show: true, message: '✅ Notificación enviada', error: false });
      setMensajePush('');
    } else {
      setNotificacionStatus({ show: true, message: '❌ Error: ' + result.error, error: true });
    }
    setEnviando(false);
    setTimeout(() => setNotificacionStatus({ show: false, message: '', error: false }), 4000);
  }

  const enviarNotificacionIndividual = async (token: string, nombre: string, mensajeCustom?: string) => {
    const mensaje = mensajeCustom || prompt(`Enviar notificación a ${nombre}:\nEscribe el mensaje:`);
    if (!mensaje) return;
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Iglesia del Salvador', message: mensaje, specificToken: token }),
      });
      if (res.ok) {
        if (!mensajeCustom) alert(`✅ Enviado a ${nombre}`);
        fetchLogs();
      }
      else if (!mensajeCustom) alert(`❌ Error`);
    } catch (e) {
      if (!mensajeCustom) alert(`❌ Error de red`);
    }
  }

  const exportarCSV = () => {
    const encabezados = "ID,Nombre,Apellido,DNI/ID_Miembro,Reunion,Hora Ingreso,Fecha,Racha Actual\n";
    const filas = asistencias.map(a => `${a.id},${a.miembros?.nombre || ''},${a.miembros?.apellido || ''},${a.miembro_id},${a.horario_reunion},${a.hora_entrada},${a.fecha},${a.racha}`).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_IDS_${fechaSeleccionada}.csv`;
    link.click();
  }

  const exportarCSVRango = async () => {
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
  }

  const datosFiltrados = useMemo(() => (asistencias || []).filter(a => {
    const nombre = `${a.miembros?.nombre || ''} ${a.miembros?.apellido || ''}`.toLowerCase();
    const cumpleHorario = filtroHorario === 'Todas' || a.horario_reunion === filtroHorario;
    return nombre.includes((busqueda || '').toLowerCase()) && cumpleHorario;
  }), [asistencias, filtroHorario, busqueda]);

  if (!authorized) return (
    <div className="h-screen flex items-center justify-center bg-[#121212] font-sans">
      <form onSubmit={handleLogin} className="bg-[#1E1E1E] p-10 rounded-[30px] shadow-2xl border border-[#333] text-center w-full max-w-sm">
        <div className="w-20 h-20 bg-[#A8D50015] rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut className="text-[#A8D500] rotate-180" size={32} />
        </div>
        <h2 className="text-[#A8D500] text-2xl font-bold mb-2 uppercase tracking-tight">Acceso Admin</h2>
        <p className="text-[#888] text-sm mb-8">Iglesia del Salvador Digital</p>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 rounded-2xl border border-[#444] bg-[#222] text-white outline-none focus:border-[#A8D500] transition-all"
        />
        {loginLocked && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <ShieldAlert size={20} className="text-red-500 mx-auto mb-1" />
            <p className="text-red-400 text-sm font-bold">Demasiados intentos</p>
            <p className="text-red-300 text-xs">Espera {lockTimer}s para reintentar</p>
          </div>
        )}
        <button type="submit" disabled={loginLocked} className={`w-full p-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 ${loginLocked ? 'bg-[#333] text-[#666] cursor-not-allowed' : 'bg-[#A8D500] hover:bg-[#b0f000] text-black shadow-[0_10px_20px_rgba(168,213,0,0.2)]'}`}>{loginLocked ? `BLOQUEADO (${lockTimer}s)` : 'ENTRAR'}</button>
      </form>
    </div>
  )

  return (
    <div className="flex bg-[#121212] min-h-screen text-white font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto h-screen p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
              {TAB_LABELS[activeTab] || activeTab.replace('_', ' ')}
            </h1>
            <p className="text-[#888] text-sm">Gestión del sistema Iglesia del Salvador</p>
          </div>

          {(activeTab === 'dashboard' || activeTab === 'miembros') && (
            <div className="flex items-center gap-4 bg-[#1E1E1E] p-2 rounded-2xl border border-[#333]">
              <div className="flex flex-col px-3 cursor-pointer" onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input) {
                  try {
                    (input as any).showPicker();
                  } catch (err) {
                    input.focus();
                  }
                }
              }}>
                <label className="text-[9px] text-[#A8D500] font-black uppercase tracking-widest">Consultar Asistencia</label>
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="bg-transparent text-white outline-none text-sm cursor-pointer [color-scheme:dark]"
                />
              </div>
              <div className="w-px h-8 bg-[#333]"></div>
              <button
                onClick={exportarCSV}
                className="bg-white text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#eee] transition-all"
              >
                📥 HOY
              </button>
              <button
                onClick={() => {
                  setExportStart(fechaSeleccionada);
                  setExportEnd(fechaSeleccionada);
                  setShowExportModal(true);
                }}
                className="bg-[#A8D500] text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#b0f000] transition-all"
              >
                📊 RANGO
              </button>
            </div>
          )}
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && (
            <DashboardView
              asistencias={asistencias}
              asistencias7dias={asistencias7dias}
              oracionesActivas={oracionesActivas}
              nuevosMes={nuevosMes}
              crecimientoAnual={crecimientoAnual}
              horariosDisponibles={horariosDisponibles}
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
            />
          )}

          {activeTab === 'gente' && (
            <GenteView
              miembros={miembros}
              hoyArg={hoyArg}
              fetchMiembros={fetchMiembros}
              enviarNotificacionIndividual={enviarNotificacionIndividual}
            />
          )}

          {activeTab === 'notificaciones' && (
            <NotificacionesView
              tituloPush={tituloPush} setTituloPush={setTituloPush}
              mensajePush={mensajePush} setMensajePush={setMensajePush}
              filtroHorario={filtroHorario} setFiltroHorario={setFiltroHorario}
              enviarNotificacion={enviarNotificacion}
              enviando={enviando}
              notificacionStatus={notificacionStatus}
              cronogramas={cronogramas}
              eliminarProgramacion={async (id) => {
                if (confirm('¿Eliminar?')) { await supabase.from('cronogramas').delete().eq('id', id); fetchCronogramas(); }
              }}
              fetchProgramaciones={fetchCronogramas}
              supabase={supabase}
              logs={logs}
              logsError={logsError}
              horariosDisponibles={horariosDisponibles}
            />
          )}

          {activeTab === 'cms' && (
            <CMSView
              noticias={noticias}
              syncYouTube={syncYouTube}
              eliminarNoticia={eliminarNoticia}
              bautismos={bautismos}
              ayuda={ayuda}
              supabase={supabase}
              fetchNoticias={fetchNoticias}
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'servicios' && (
            <ServiciosView supabase={supabase} enviarNotificacionIndividual={enviarNotificacionIndividual} registrarAuditoria={registrarAuditoria} />
          )}

          {activeTab === 'equipos' && (
            <EquiposView supabase={supabase} setActiveTab={setActiveTab} enviarNotificacionIndividual={enviarNotificacionIndividual} />
          )}

          {activeTab === 'cancionero' && (
            <CancioneroView supabase={supabase} />
          )}

          {activeTab === 'agenda_config' && (
            <AgendaConfigView
              supabase={supabase}
              horariosDisponibles={horariosDisponibles}
              fetchHorarios={fetchHorarios}
              registrarAuditoria={registrarAuditoria}
            />
          )}

          {activeTab === 'auditoria' && (
            <AuditoriaView logs={auditLogs} />
          )}

          {activeTab === 'alertas' && (
            <AlertasView supabase={supabase} registrarAuditoria={registrarAuditoria} />
          )}
        </section>
      </main>

      {/* MODAL: Export por rango */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] p-8 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">📊 Exportar por Rango</h3>
            <p className="text-[#888] text-sm mb-6">Selecciona el período de asistencias a exportar</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[#888] text-[10px] font-bold uppercase mb-2 block">Desde</label>
                <input
                  type="date"
                  value={exportStart}
                  onChange={e => setExportStart(e.target.value)}
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500] [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[#888] text-[10px] font-bold uppercase mb-2 block">Hasta</label>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={e => setExportEnd(e.target.value)}
                  className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500] [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: 'Esta semana', days: 7 },
                { label: 'Este mes', days: 30 },
                { label: '3 meses', days: 90 },
                { label: 'Este año', days: 365 },
              ].map(({ label, days }) => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - days);
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setExportStart(start.toLocaleDateString('en-CA'));
                      setExportEnd(end.toLocaleDateString('en-CA'));
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#222] text-[#888] hover:bg-[#333] font-bold transition-all"
                  >{label}</button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 bg-[#222] text-white font-bold rounded-xl border border-[#333]"
              >CANCELAR</button>
              <button
                onClick={exportarCSVRango}
                disabled={!exportStart || !exportEnd}
                className="flex-1 py-3 bg-[#A8D500] text-black font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >📥 DESCARGAR CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

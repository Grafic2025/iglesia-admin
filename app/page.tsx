'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import DashboardView from '../components/views/DashboardView'
import MiembrosView from '../components/views/MiembrosView'
import NotificacionesView from '../components/views/NotificacionesView'
import CMSView from '../components/views/CMSView'
import ServiciosView from '../components/views/ServiciosView'
import GenteView from '../components/views/GenteView'
import EquiposView from '../components/views/EquiposView'
import GruposView from '../components/views/GruposView'
import CancioneroView from '../components/views/CancioneroView'
import { LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  // States from original page.tsx
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [miembros, setMiembros] = useState<any[]>([])
  const [programaciones, setProgramaciones] = useState<any[]>([])
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }))
  const [tituloPush, setTituloPush] = useState('Iglesia del Salvador')
  const [mensajePush, setMensajePush] = useState('')
  const [premiosPendientes, setPremiosPendientes] = useState<any>({ nivel5: [], nivel10: [], nivel20: [], nivel30: [] })
  const [oracionesActivas, setOracionesActivas] = useState(0)
  const [nuevosMes, setNuevosMes] = useState(0)
  const [premiosEntregados, setPremiosEntregados] = useState<any[]>([])
  const [bautismos, setBautismos] = useState<any[]>([])
  const [ayuda, setAyuda] = useState<any[]>([])
  const [enviando, setEnviando] = useState(false)
  const [notificacionStatus, setNotificacionStatus] = useState({ show: false, message: '', error: false })
  const [noticias, setNoticias] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [logsError, setLogsError] = useState<string | null>(null)

  const hoyArg = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth')
    if (isAuth === 'true') setAuthorized(true)
  }, [])

  useEffect(() => {
    if (authorized) {
      fetchAsistencias();
      fetchMiembros();
      fetchProgramaciones();
      calcularPremios();
      calcularOracionesActivas();
      calcularNuevosMes();
      cargarPremiosEntregados();
      fetchBautismos();
      fetchAyuda();
      fetchNoticias();
      fetchLogs();
      syncYouTube();

      const channels = [
        supabase.channel('cambios-asistencias').on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias()).subscribe(),
        supabase.channel('cambios-programas').on('postgres_changes', { event: '*', schema: 'public', table: 'programaciones' }, () => fetchProgramaciones()).subscribe(),
        supabase.channel('cambios-logs').on('postgres_changes', { event: '*', schema: 'public', table: 'notificacion_logs' }, () => fetchLogs()).subscribe()
      ];

      return () => {
        channels.forEach(ch => supabase.removeChannel(ch));
      };
    }
  }, [authorized, fechaSeleccionada])

  // --- LOGIC FUNCTIONS (Retained from original) ---

  const fetchNoticias = async () => {
    const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
    if (data) setNoticias(data);
  }

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.from('notificacion_logs').select('*').order('fecha', { ascending: false }).limit(10);
      if (error) setLogsError(error.message);
      else { setLogs(data || []); setLogsError(null); }
    } catch (e: any) { setLogsError(e.message); }
  }

  const syncYouTube = async (showAlert = false) => {
    try {
      const res = await fetch('/api/youtube-sync');
      const data = await res.json();
      if (data.success) { fetchNoticias(); if (showAlert) alert('✅ YouTube sincronizado'); }
      else if (showAlert) alert('❌ Error sincronizando: ' + data.error);
    } catch (e) { if (showAlert) alert('❌ Error de conexión'); }
  }

  const fetchMiembros = async () => {
    const { data } = await supabase.from('miembros').select('*').order('created_at', { ascending: false });
    if (data) setMiembros(data);
  }

  const fetchAsistencias = async () => {
    const { data } = await supabase
      .from('asistencias')
      .select(`id, miembro_id, horario_reunion, hora_entrada, fecha, miembros (nombre, apellido, created_at, token_notificacion)`)
      .eq('fecha', fechaSeleccionada)
      .order('hora_entrada', { ascending: false });

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const fechaLimite = hace30Dias.toISOString().split('T')[0];

    const { data: historial } = await supabase.from('asistencias').select('miembro_id').gte('fecha', fechaLimite);

    if (data) {
      const listaFinal = data.map(asist => {
        const racha = historial ? historial.filter(h => h.miembro_id === asist.miembro_id).length : 0;
        return { ...asist, racha };
      });
      setAsistencias(listaFinal);
    }
  }

  const fetchProgramaciones = async () => {
    const { data } = await supabase.from('programaciones').select('*').order('hora', { ascending: true });
    if (data) setProgramaciones(data);
  }

  const calcularPremios = async () => {
    try {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const fechaLimite = hace30Dias.toISOString().split('T')[0];
      const { data: miembros } = await supabase.from('miembros').select('id, nombre, apellido');
      if (!miembros) return;
      const { data: todasAsistencias } = await supabase.from('asistencias').select('miembro_id').gte('fecha', fechaLimite);
      const conteoPorMiembro: Record<string, number> = {};
      todasAsistencias?.forEach(a => { conteoPorMiembro[a.miembro_id] = (conteoPorMiembro[a.miembro_id] || 0) + 1; });
      const miembrosConRacha = miembros.map(m => ({ ...m, racha: conteoPorMiembro[m.id] || 0 }));
      setPremiosPendientes({
        nivel5: miembrosConRacha.filter(m => m.racha >= 5 && m.racha < 10),
        nivel10: miembrosConRacha.filter(m => m.racha >= 10 && m.racha < 20),
        nivel20: miembrosConRacha.filter(m => m.racha >= 20 && m.racha < 30),
        nivel30: miembrosConRacha.filter(m => m.racha >= 30)
      });
    } catch (e) { console.error(e); }
  }

  const calcularOracionesActivas = async () => {
    const { data } = await supabase.from('pedidos_oracion').select('contador_oraciones');
    setOracionesActivas(data?.reduce((acc, p) => acc + (p.contador_oraciones || 0), 0) || 0);
  }

  const fetchBautismos = async () => {
    const { data } = await supabase.from('solicitudes_bautismo').select('*, miembros(nombre, apellido)').order('created_at', { ascending: false });
    if (data) setBautismos(data);
  }

  const fetchAyuda = async () => {
    const { data } = await supabase.from('consultas_ayuda').select('*, miembros(nombre, apellido)').order('created_at', { ascending: false });
    if (data) setAyuda(data);
  }

  const calcularNuevosMes = async () => {
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1); primerDiaMes.setHours(0, 0, 0, 0);
    const { data } = await supabase.from('miembros').select('id').gte('created_at', primerDiaMes.toISOString());
    setNuevosMes(data?.length || 0);
  }

  const cargarPremiosEntregados = async () => {
    const { data } = await supabase.from('premios_entregados').select('*');
    if (data) setPremiosEntregados(data);
  }

  const marcarComoEntregado = async (miembroId: string, nivel: number, nombreCompleto: string) => {
    if (!confirm(`¿Marcar como entregado el premio de nivel ${nivel} para ${nombreCompleto}?`)) return;
    const { error } = await supabase.from('premios_entregados').insert({ miembro_id: miembroId, nivel, entregado_por: 'Admin', notas: '' });
    if (error) alert('Error: ' + error.message);
    else { alert('✅ Premio entregado'); cargarPremiosEntregados(); calcularPremios(); }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthorized(true); localStorage.setItem('admin_auth', 'true');
    } else alert('Contraseña incorrecta');
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth'); setAuthorized(false); setPassword('');
  }

  const enviarNotificacion = async () => {
    if (!mensajePush) return;
    setEnviando(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tituloPush, message: mensajePush, horario: filtroHorario }),
      });
      const result = await res.json();
      setNotificacionStatus({ show: true, message: res.ok ? `✅ Enviado a ${result.total} personas` : `❌ Error`, error: !res.ok });
      if (res.ok) fetchLogs();
    } catch (e) { setNotificacionStatus({ show: true, message: `❌ Error de red`, error: true }); }
    setEnviando(false);
    setTimeout(() => setNotificacionStatus({ show: false, message: '', error: false }), 4000);
  }

  const enviarNotificacionIndividual = async (token: string, nombre: string) => {
    const mensaje = prompt(`Enviar notificación a ${nombre}:\nEscribe el mensaje:`);
    if (!mensaje) return;
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Iglesia del Salvador', message: mensaje, specificToken: token }),
      });
      if (res.ok) { alert(`✅ Enviado a ${nombre}`); fetchLogs(); }
      else alert(`❌ Error`);
    } catch (e) { alert(`❌ Error de red`); }
  }

  const eliminarNoticia = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    await supabase.from('noticias').delete().eq('id', id);
    fetchNoticias();
  }

  const editarNoticia = async (n: any) => {
    const nuevoTitulo = prompt("Editar título:", n.titulo);
    if (nuevoTitulo === null) return;
    const nuevaImagen = prompt("Editar URL imagen:", n.imagen_url);
    if (nuevaImagen === null) return;
    // ... logic simplifies here but we keep the prompt UI for now
    const { error } = await supabase.from('noticias').update({ titulo: nuevoTitulo, imagen_url: nuevaImagen }).eq('id', n.id);
    if (error) alert("Error");
    else fetchNoticias();
  }

  const agregarNoticia = async () => {
    const titulo = prompt("Título de la noticia:");
    if (!titulo) return;
    const imagen = prompt("URL de la imagen:", "https://via.placeholder.com/300");
    await supabase.from('noticias').insert([{ titulo, imagen_url: imagen || "https://via.placeholder.com/300", activa: true, es_youtube: false }]);
    fetchNoticias();
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

  const datosFiltrados = asistencias.filter(a => {
    const nombre = `${a.miembros?.nombre} ${a.miembros?.apellido}`.toLowerCase();
    const cumpleHorario = filtroHorario === 'Todas' || a.horario_reunion === filtroHorario;
    return nombre.includes(busqueda.toLowerCase()) && cumpleHorario;
  });

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
        <button type="submit" className="w-full p-4 bg-[#A8D500] hover:bg-[#b0f000] text-black rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_20px_rgba(168,213,0,0.2)]">ENTRAR</button>
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
              {activeTab.replace('_', ' ')}
            </h1>
            <p className="text-[#888] text-sm">Gestión del sistema Iglesia del Salvador</p>
          </div>

          <div className="flex items-center gap-4 bg-[#1E1E1E] p-2 rounded-2xl border border-[#333]">
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-transparent text-white px-3 py-1 outline-none text-sm cursor-pointer"
            />
            <div className="w-px h-8 bg-[#333]"></div>
            <button
              onClick={exportarCSV}
              className="bg-white text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#eee] transition-all"
            >
              📥 EXPORTAR EXCEL
            </button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && (
            <DashboardView
              asistencias={asistencias}
              oracionesActivas={oracionesActivas}
              nuevosMes={nuevosMes}
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
            />
          )}

          {activeTab === 'gente' && (
            <GenteView miembros={miembros} hoyArg={hoyArg} />
          )}

          {activeTab === 'notificaciones' && (
            <NotificacionesView
              tituloPush={tituloPush} setTituloPush={setTituloPush}
              mensajePush={mensajePush} setMensajePush={setMensajePush}
              filtroHorario={filtroHorario} setFiltroHorario={setFiltroHorario}
              enviarNotificacion={enviarNotificacion}
              enviando={enviando}
              notificacionStatus={notificacionStatus}
              programaciones={programaciones}
              eliminarProgramacion={async (id) => {
                if (confirm('¿Eliminar?')) { await supabase.from('programaciones').delete().eq('id', id); fetchProgramaciones(); }
              }}
              fetchProgramaciones={fetchProgramaciones}
              supabase={supabase}
              logs={logs}
              logsError={logsError}
            />
          )}

          {activeTab === 'cms' && (
            <CMSView
              noticias={noticias}
              syncYouTube={syncYouTube}
              editarNoticia={editarNoticia}
              eliminarNoticia={eliminarNoticia}
              agregarNoticia={agregarNoticia}
              bautismos={bautismos}
              ayuda={ayuda}
              supabase={supabase}
            />
          )}

          {activeTab === 'servicios' && (
            <ServiciosView supabase={supabase} />
          )}

          {activeTab === 'equipos' && (
            <EquiposView supabase={supabase} />
          )}

          {activeTab === 'grupos' && (
            <GruposView supabase={supabase} />
          )}

          {activeTab === 'cancionero' && (
            <CancioneroView supabase={supabase} />
          )}
        </section>
      </main>
    </div>
  );
}

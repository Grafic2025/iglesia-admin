'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart as ReLineBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line
} from 'recharts';
import {
  Settings, Bell, Send, Image as ImageIcon, LayoutDashboard, PlusCircle, Trash2, RefreshCw, AlertCircle, BarChart as LucideBarChart, LineChart as LucideLineChart, Edit
} from 'lucide-react';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [asistencias, setAsistencias] = useState<any[]>([])
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
  const [recursos, setRecursos] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const hoyArg = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth')
    if (isAuth === 'true') setAuthorized(true)
  }, [])

  useEffect(() => {
    if (authorized) {
      fetchAsistencias();
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

      const channelAsis = supabase.channel('cambios-asistencias')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias())
        .subscribe();

      const channelProg = supabase.channel('cambios-programas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'programaciones' }, () => fetchProgramaciones())
        .subscribe();

      return () => {
        supabase.removeChannel(channelAsis);
        supabase.removeChannel(channelProg);
      };
    }
  }, [authorized, fechaSeleccionada])

  const fetchNoticias = async () => {
    const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
    if (data) setNoticias(data);
  }

  const fetchLogs = async () => {
    const { data } = await supabase.from('notificacion_logs').select('*').order('fecha', { ascending: false }).limit(10);
    if (data) setLogs(data);
  }

  const syncYouTube = async (showAlert = false) => {
    try {
      const res = await fetch('/api/youtube-sync');
      const data = await res.json();

      if (data.success) {
        fetchNoticias();
        if (showAlert) alert('✅ YouTube sincronizado: ' + data.title);
      } else {
        if (showAlert) alert('❌ Error sincronizando YouTube: ' + data.error);
      }
    } catch (e) {
      if (showAlert) alert('❌ Error de conexión al sincronizar YouTube');
    }
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

    const { data: historial } = await supabase
      .from('asistencias')
      .select('miembro_id')
      .gte('fecha', fechaLimite);

    if (data) {
      const listaFinal = data.map(asist => {
        const racha = historial ? historial.filter(h => h.miembro_id === asist.miembro_id).length : 0;
        return { ...asist, racha };
      });
      setAsistencias(listaFinal);
    }
  }

  const fetchProgramaciones = async () => {
    const { data } = await supabase
      .from('programaciones')
      .select('*')
      .order('hora', { ascending: true });
    if (data) setProgramaciones(data);
  }

  const calcularPremios = async () => {
    try {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const fechaLimite = hace30Dias.toISOString().split('T')[0];

      // 1. Obtener todos los miembros
      const { data: miembros } = await supabase
        .from('miembros')
        .select('id, nombre, apellido');

      if (!miembros) return;

      // 2. Obtener TODAS las asistencias recientes en una sola consulta
      const { data: todasAsistencias } = await supabase
        .from('asistencias')
        .select('miembro_id')
        .gte('fecha', fechaLimite);

      // 3. Contar asistencias por miembro en memoria
      const conteoPorMiembro: Record<string, number> = {};
      todasAsistencias?.forEach(a => {
        conteoPorMiembro[a.miembro_id] = (conteoPorMiembro[a.miembro_id] || 0) + 1;
      });

      // 4. Asignar racha a los miembros
      const miembrosConRacha = miembros.map(m => ({
        ...m,
        racha: conteoPorMiembro[m.id] || 0
      }));

      // Agrupar por niveles de premio
      const nivel5 = miembrosConRacha.filter(m => m.racha >= 5 && m.racha < 10);
      const nivel10 = miembrosConRacha.filter(m => m.racha >= 10 && m.racha < 20);
      const nivel20 = miembrosConRacha.filter(m => m.racha >= 20 && m.racha < 30);
      const nivel30 = miembrosConRacha.filter(m => m.racha >= 30);

      setPremiosPendientes({ nivel5, nivel10, nivel20, nivel30 });
    } catch (e) {
      console.error('Error calculando premios:', e);
    }
  }

  const calcularOracionesActivas = async () => {
    try {
      const { data: pedidos } = await supabase
        .from('pedidos_oracion')
        .select('contador_oraciones');

      const total = pedidos?.reduce((acc, p) =>
        acc + (p.contador_oraciones || 0), 0
      ) || 0;

      setOracionesActivas(total);
    } catch (e) {
      console.error('Error calculando oraciones:', e);
    }
  }

  const fetchBautismos = async () => {
    const { data } = await supabase
      .from('solicitudes_bautismo')
      .select('*, miembros(nombre, apellido)')
      .order('created_at', { ascending: false });
    if (data) setBautismos(data);
  }

  const fetchAyuda = async () => {
    const { data } = await supabase
      .from('consultas_ayuda')
      .select('*, miembros(nombre, apellido)')
      .order('created_at', { ascending: false });
    if (data) setAyuda(data);
  }

  const calcularNuevosMes = async () => {
    try {
      const primerDiaMes = new Date();
      primerDiaMes.setDate(1);
      primerDiaMes.setHours(0, 0, 0, 0);

      const { data: nuevos } = await supabase
        .from('miembros')
        .select('id')
        .gte('created_at', primerDiaMes.toISOString());

      setNuevosMes(nuevos?.length || 0);
    } catch (e) {
      console.error('Error calculando nuevos del mes:', e);
    }
  }

  const cargarPremiosEntregados = async () => {
    try {
      const { data } = await supabase
        .from('premios_entregados')
        .select('*');

      setPremiosEntregados(data || []);
    } catch (e) {
      console.error('Error cargando premios entregados:', e);
    }
  }

  const marcarComoEntregado = async (miembroId: string, nivel: number, nombreCompleto: string) => {
    if (!confirm(`¿Marcar como entregado el premio de nivel ${nivel} para ${nombreCompleto}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('premios_entregados')
        .insert({
          miembro_id: miembroId,
          nivel: nivel,
          entregado_por: 'Admin',
          notas: ''
        });

      if (error) {
        alert('Error al marcar como entregado: ' + error.message);
      } else {
        alert('✅ Premio marcado como entregado');
        cargarPremiosEntregados();
        calcularPremios();
      }
    } catch (e) {
      console.error('Error marcando premio:', e);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthorized(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setAuthorized(false)
    setPassword('')
  }

  const exportarCSV = () => {
    const encabezados = "ID,Nombre,Apellido,DNI/ID_Miembro,Reunion,Hora Ingreso,Fecha,Racha Actual\n";
    const filas = asistencias.map(a =>
      `${a.id},${a.miembros?.nombre || ''},${a.miembros?.apellido || ''},${a.miembro_id},${a.horario_reunion},${a.hora_entrada},${a.fecha},${a.racha}`
    ).join("\n");

    // Add BOM for Excel utf-8 compatibility
    const bom = "\uFEFF";
    const blob = new Blob([bom + encabezados + filas], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    // Filename includes filter details
    const cleanDate = fechaSeleccionada.replace(/\//g, '-');
    link.download = `Reporte_Asistencias_${cleanDate}_${filtroHorario}.csv`;
    link.click();
  }



  const enviarNotificacion = async () => {
    if (!mensajePush) return;
    setEnviando(true);



    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tituloPush,
          message: mensajePush,
          horario: filtroHorario,
        }),
      });
      const result = await res.json();
      setNotificacionStatus({ show: true, message: res.ok ? `✅ Enviado a ${result.total} personas` : `❌ Error`, error: !res.ok });
      if (res.ok) {
        // Nada que limpiar de imágenes
      }
    } catch (e) {
      setNotificacionStatus({ show: true, message: `❌ Error de red`, error: true });
    }
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
        body: JSON.stringify({
          title: 'Iglesia del Salvador',
          message: mensaje,
          specificToken: token,
        }),
      });
      const result = await res.json();
      if (res.ok) alert(`✅ Notificación enviada a ${nombre}`);
      else alert(`❌ Error: ${result.error || 'Desconocido'}`);
    } catch (e) {
      alert(`❌ Error de red`);
    }
  }

  const datosFiltrados = asistencias.filter(a => {
    const nombre = `${a.miembros?.nombre} ${a.miembros?.apellido}`.toLowerCase();
    const cumpleHorario = filtroHorario === 'Todas' || a.horario_reunion === filtroHorario;
    return nombre.includes(busqueda.toLowerCase()) && cumpleHorario;
  });

  if (!authorized) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212' }}>
      <form onSubmit={handleLogin} style={{ background: '#1E1E1E', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333' }}>
        <h2 style={{ color: '#A8D500', marginBottom: '20px' }}>Acceso Admin</h2>
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }} />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#A8D500', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>ENTRAR</button>
      </form>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff', background: '#121212', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: '#A8D500', margin: 0 }}>Iglesia del Salvador</h1>
          <p style={{ color: '#aaa', margin: 0 }}>Gestión de Asistencia</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#333', color: '#fff', border: 'none' }} />
          <button onClick={exportarCSV} style={{ padding: '10px 20px', borderRadius: '10px', background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>📥 Excel</button>
          <button onClick={handleLogout} style={{ padding: '10px 15px', borderRadius: '10px', background: '#ff4444', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SALIR</button>
        </div>
      </div>

      {/* RESUMEN VISUAL (CHARTS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LucideBarChart size={18} /> Tendencia: Últimos 7 Días
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineBarChart data={asistencias.slice(0, 7).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="fecha" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: '#222', border: '1px solid #444' }} />
                <Bar dataKey="racha" fill="#A8D500" radius={[4, 4, 0, 0]} />
              </ReLineBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LucideLineChart size={18} /> Crecimiento de Miembros
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={[{ n: 1, c: 10 }, { n: 2, c: 15 }, { n: 3, c: nuevosMes || 20 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="n" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: '#222', border: '1px solid #444' }} />
                <Line type="monotone" dataKey="c" stroke="#00D9FF" strokeWidth={2} dot={{ fill: '#00D9FF' }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TARJETAS ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <StatCard label="Total Hoy" value={asistencias.length} color="#A8D500" isActive={asistencias.length > 0} icon={<LayoutDashboard size={18} />} />
        <StatCard label="Extra" value={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length} color="#FFB400" isActive={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length > 0} />
        <StatCard label="09:00 HS" value={asistencias.filter(a => a.horario_reunion === '09:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '09:00').length > 0} />
        <StatCard label="11:00 HS" value={asistencias.filter(a => a.horario_reunion === '11:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '11:00').length > 0} />
        <StatCard label="20:00 HS" value={asistencias.filter(a => a.horario_reunion === '20:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '20:00').length > 0} />
        <StatCard label="Oraciones" value={oracionesActivas} color="#9333EA" isActive={oracionesActivas > 0} icon="🙏" />
        <StatCard label="Nuevos" value={nuevosMes} color="#00D9FF" isActive={nuevosMes > 0} icon="👥" />
      </div>

      {/* PANEL DE PREMIOS */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, color: '#9333EA', marginBottom: '8px' }}>🎁 Premios Pendientes de Entrega</h3>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
          Miembros que alcanzaron metas de asistencia (últimos 30 días)
        </p>

        {/* Nivel 30 - Entrada a Retiro */}
        {premiosPendientes.nivel30.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>🎟️</span>
              <h4 style={{ margin: 0, color: '#fff' }}>Entrada a Retiro (30+ asistencias)</h4>
              <span style={{ background: '#9333EA', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                {premiosPendientes.nivel30.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {premiosPendientes.nivel30.map((m: any) => {
                const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === 30);
                return (
                  <div key={m.id} style={{ background: yaEntregado ? '#1a1a1a' : '#252525', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${yaEntregado ? '#555' : '#9333EA'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ color: yaEntregado ? '#888' : '#fff', fontSize: '14px' }}>{m.nombre} {m.apellido}</span>
                      <span style={{ color: '#9333EA', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' }}>🔥 {m.racha}</span>
                    </div>
                    {yaEntregado ? (
                      <span style={{ fontSize: '16px' }}>✅</span>
                    ) : (
                      <button
                        onClick={() => marcarComoEntregado(m.id, 30, `${m.nombre} ${m.apellido}`)}
                        style={{ background: '#9333EA', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nivel 20 - Libro */}
        {premiosPendientes.nivel20.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>📚</span>
              <h4 style={{ margin: 0, color: '#fff' }}>Libro Cristiano (20-29 asistencias)</h4>
              <span style={{ background: '#3B82F6', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                {premiosPendientes.nivel20.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {premiosPendientes.nivel20.map((m: any) => {
                const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === 20);
                return (
                  <div key={m.id} style={{ background: yaEntregado ? '#1a1a1a' : '#252525', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${yaEntregado ? '#555' : '#3B82F6'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ color: yaEntregado ? '#888' : '#fff', fontSize: '14px' }}>{m.nombre} {m.apellido}</span>
                      <span style={{ color: '#3B82F6', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' }}>🔥 {m.racha}</span>
                    </div>
                    {yaEntregado ? (
                      <span style={{ fontSize: '16px' }}>✅</span>
                    ) : (
                      <button
                        onClick={() => marcarComoEntregado(m.id, 20, `${m.nombre} ${m.apellido}`)}
                        style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nivel 10 - Café */}
        {premiosPendientes.nivel10.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>☕</span>
              <h4 style={{ margin: 0, color: '#fff' }}>Café Gratis (10-19 asistencias)</h4>
              <span style={{ background: '#FFB400', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                {premiosPendientes.nivel10.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {premiosPendientes.nivel10.map((m: any) => {
                const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === 10);
                return (
                  <div key={m.id} style={{ background: yaEntregado ? '#1a1a1a' : '#252525', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${yaEntregado ? '#555' : '#FFB400'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ color: yaEntregado ? '#888' : '#fff', fontSize: '14px' }}>{m.nombre} {m.apellido}</span>
                      <span style={{ color: '#FFB400', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' }}>🔥 {m.racha}</span>
                    </div>
                    {yaEntregado ? (
                      <span style={{ fontSize: '16px' }}>✅</span>
                    ) : (
                      <button
                        onClick={() => marcarComoEntregado(m.id, 10, `${m.nombre} ${m.apellido}`)}
                        style={{ background: '#FFB400', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nivel 5 - Sticker */}
        {premiosPendientes.nivel5.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>⭐</span>
              <h4 style={{ margin: 0, color: '#fff' }}>Sticker IDS (5-9 asistencias)</h4>
              <span style={{ background: '#A8D500', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                {premiosPendientes.nivel5.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {premiosPendientes.nivel5.map((m: any) => {
                const yaEntregado = premiosEntregados.some(p => p.miembro_id === m.id && p.nivel === 5);
                return (
                  <div key={m.id} style={{ background: yaEntregado ? '#1a1a1a' : '#252525', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${yaEntregado ? '#555' : '#A8D500'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ color: yaEntregado ? '#888' : '#fff', fontSize: '14px' }}>{m.nombre} {m.apellido}</span>
                      <span style={{ color: '#A8D500', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' }}>🔥 {m.racha}</span>
                    </div>
                    {yaEntregado ? (
                      <span style={{ fontSize: '16px' }}>✅</span>
                    ) : (
                      <button
                        onClick={() => marcarComoEntregado(m.id, 5, `${m.nombre} ${m.apellido}`)}
                        style={{ background: '#A8D500', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {premiosPendientes.nivel5.length === 0 && premiosPendientes.nivel10.length === 0 &&
          premiosPendientes.nivel20.length === 0 && premiosPendientes.nivel30.length === 0 && (
            <p style={{ color: '#555', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              No hay premios pendientes en este momento.
            </p>
          )}
      </div>

      {/* PANEL DE PROGRAMACIÓN */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, color: '#FFB400', marginBottom: '8px' }}>⏰ Programar Avisos y Versículo</h3>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px', lineHeight: '1.5' }}>
          Escribe <b style={{ color: '#fff' }}>VERSICULO</b> para enviar uno automático de la Biblia.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '25px' }}>
          <input
            placeholder="Mensaje o 'VERSICULO'"
            id="prog-msj"
            style={{ flex: 2, minWidth: '200px', padding: '14px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '16px' }}
          />
          <select id="prog-dia" style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '16px' }}>
            <option>Todos los días</option>
            <option>Lunes</option><option>Martes</option><option>Miércoles</option>
            <option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
          </select>
          <input
            type="time"
            id="prog-hora"
            style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '16px' }}
          />
          <button
            onClick={async () => {
              const mensaje = (document.getElementById('prog-msj') as HTMLInputElement).value;
              const dia = (document.getElementById('prog-dia') as HTMLSelectElement).value;
              const hora = (document.getElementById('prog-hora') as HTMLInputElement).value;
              if (!mensaje || !hora) return alert('Completa mensaje y hora');
              const { error } = await supabase.from('programaciones').insert([{ mensaje, dia_semana: dia, hora, activo: true, ultimo_estado: 'Pendiente' }]);
              if (error) alert('Error al programar');
              else {
                alert('¡Programado con éxito!');
                (document.getElementById('prog-msj') as HTMLInputElement).value = '';
                fetchProgramaciones();
              }
            }}
            style={{ padding: '14px 25px', background: '#FFB400', color: '#000', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '16px' }}
          >
            PROGRAMAR
          </button>
        </div>

        {/* LISTA DE PROGRAMACIONES */}
        <div style={{ display: 'grid', gap: '10px' }}>
          {programaciones.length === 0 && <p style={{ color: '#555', fontSize: '14px' }}>No hay envíos programados.</p>}
          {programaciones.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#252525', padding: '12px 18px', borderRadius: '12px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div
                  title={p.ultimo_estado ? `Estado: ${p.ultimo_estado}` : 'Esperando ejecución'}
                  style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: p.ultimo_estado === 'Exitoso' ? '#A8D500' : p.ultimo_estado?.includes('Error') ? '#ff4444' : '#555',
                    boxShadow: p.ultimo_estado === 'Exitoso' ? '0 0 8px #A8D500' : 'none'
                  }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', color: p.mensaje.toUpperCase() === 'VERSICULO' ? '#FFB400' : '#fff' }}>
                    {p.mensaje.toUpperCase() === 'VERSICULO' ? '📖 Versículo Diario' : p.mensaje}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {p.dia_semana} a las {p.hora.substring(0, 5)} hs
                    {p.ultima_ejecucion && (
                      <span style={{ marginLeft: '8px', fontStyle: 'italic', color: '#555' }}>
                        • Envío: {new Date(p.ultima_ejecucion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {p.ultimo_estado && (
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: p.ultimo_estado === 'Exitoso' ? '#A8D500' : '#ff4444', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                    {p.ultimo_estado.toUpperCase()}
                  </span>
                )}
                <button
                  onClick={async () => {
                    if (confirm('¿Eliminar esta programación?')) {
                      await supabase.from('programaciones').delete().eq('id', p.id);
                      fetchProgramaciones();
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '18px', padding: '5px' }}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL DE NOTIFICACIONES Y CMS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#A8D500', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} /> Notificar a: {filtroHorario === 'Todas' ? 'Toda la Iglesia' : `Reunión ${filtroHorario}`}
          </h3>
          <input placeholder="Título del aviso..." value={tituloPush} onChange={(e) => setTituloPush(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '10px' }} />
          <textarea
            placeholder="Escribe el mensaje aquí..."
            value={mensajePush}
            onChange={(e) => setMensajePush(e.target.value)}
            style={{ width: '100%', padding: '15px', height: '100px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '15px', fontSize: '16px', resize: 'vertical' }}
          />
          <button onClick={enviarNotificacion} disabled={enviando} style={{ width: '100%', padding: '15px', background: '#A8D500', color: '#000', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
            {enviando ? 'PROCESANDO...' : 'ENVIAR NOTIFICACIÓN AHORA'}
          </button>
          {notificacionStatus.show && <div style={{ marginTop: '15px', textAlign: 'center', color: notificacionStatus.error ? '#ff4444' : '#A8D500', fontWeight: 'bold' }}>{notificacionStatus.message}</div>}
        </div>

        <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#FFB400', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ImageIcon size={20} /> CMS: Noticias y Banners</div>
            <button onClick={() => syncYouTube(true)} style={{ fontSize: '12px', background: '#ff0000', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={12} /> Sync YouTube
            </button>
          </h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '15px' }}>
            {noticias.length === 0 && <p style={{ color: '#555', fontSize: '12px' }}>No hay contenidos activos.</p>}
            {noticias.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#252525', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                <img src={n.imagen_url} style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{n.titulo}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>{n.es_youtube ? '🔴 YouTube Auto' : '📰 Noticia'}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={async () => {
                      const nuevoTitulo = prompt("Editar título:", n.titulo);
                      if (nuevoTitulo === null) return;

                      const nuevaImagen = prompt("Editar URL imagen:", n.imagen_url);
                      if (nuevaImagen === null) return;

                      // Preguntar por destino
                      let nuevaUrl = n.url;
                      let nuevaScreen = n.screen;

                      const tipoDestino = prompt("¿A dónde lleva esta noticia?\n1. Link Externo (YouTube, Web)\n2. Pantalla Interna de la App\n3. Ninguno\n\nEscribe 1, 2 o 3:", n.url ? "1" : n.screen ? "2" : "3");

                      if (tipoDestino === "1") {
                        nuevaUrl = prompt("Ingresa el Link (URL):", n.url || "https://");
                        nuevaScreen = null;
                      } else if (tipoDestino === "2") {
                        nuevaScreen = prompt("Ingresa nombre EXACTO de pantalla (ej: Agenda, Quiero Ayudar, Quiero Bautizarme, Soy Nuevo, Necesito Oración):", n.screen || "");
                        nuevaUrl = null;
                      } else {
                        nuevaUrl = null;
                        nuevaScreen = null;
                      }

                      const { error } = await supabase.from('noticias').update({
                        titulo: nuevoTitulo || n.titulo,
                        imagen_url: nuevaImagen || n.imagen_url,
                        url: nuevaUrl,
                        screen: nuevaScreen
                      }).eq('id', n.id);

                      if (error) alert("Error al actualizar: " + error.message);
                      else fetchNoticias();
                    }}
                    style={{ color: '#FFB400', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button onClick={() => supabase.from('noticias').delete().eq('id', n.id).then(() => fetchNoticias())} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={async () => {
              const titulo = prompt("Título de la noticia:");
              if (!titulo) return;
              const imagen = prompt("URL de la imagen (dejar vacío para default):", "https://via.placeholder.com/300");

              // Preguntar por destino
              let urlDestino = null;
              let screenDestino = null;

              const tipoDestino = prompt("¿A dónde lleva esta noticia?\n1. Link Externo (YouTube, Web)\n2. Pantalla Interna de la App\n3. Ninguno\n\nEscribe 1, 2 o 3:", "3");

              if (tipoDestino === "1") {
                urlDestino = prompt("Ingresa el Link (URL):", "https://");
              } else if (tipoDestino === "2") {
                screenDestino = prompt("Ingresa nombre EXACTO de pantalla:\n- Agenda\n- Quiero Ayudar\n- Necesito Ayuda\n- Quiero Bautizarme\n- Quiero Capacitarme\n- Soy Nuevo\n- Necesito Oración\n- Sumarme a un Grupo", "Agenda");
              }

              await supabase.from('noticias').insert([{
                titulo: titulo,
                imagen_url: imagen || "https://via.placeholder.com/300",
                activa: true,
                es_youtube: false,
                url: urlDestino,
                screen: screenDestino
              }]);
              fetchNoticias();
            }}
            style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#333', color: '#fff', borderRadius: '10px', border: '1px dashed #555', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}
          >
            <PlusCircle size={14} /> Agregar Noticia Manual
          </button>
        </div>
      </div>

      {/* HISTORIAL DE LOGS */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
          <AlertCircle size={18} /> Historial de Envío (Logs Profesionales)
        </h3>
        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '8px' }}>Fecha</th>
                <th style={{ padding: '8px' }}>Título</th>
                <th style={{ padding: '8px' }}>Destinatarios</th>
                <th style={{ padding: '8px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#555' }}>Sin logs recientes</td></tr>}
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #252525' }}>
                  <td style={{ padding: '8px', color: '#aaa' }}>{new Date(l.fecha).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>{l.titulo}</td>
                  <td style={{ padding: '8px' }}>{l.destinatarios_count} personas</td>
                  <td style={{ padding: '8px', color: l.estado === 'Exitoso' ? '#A8D500' : '#ff4444' }}>{l.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL DE BAUTISMOS Y AYUDA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#00D9FF', marginBottom: '15px' }}>💧 Solicitudes de Bautismo</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {bautismos.length === 0 && <p style={{ color: '#555', fontSize: '14px' }}>No hay solicitudes.</p>}
            {bautismos.map((b) => (
              <div key={b.id} style={{ background: '#252525', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #333' }}>
                <div style={{ fontWeight: 'bold' }}>{b.miembros?.nombre} {b.miembros?.apellido}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Edad: {b.edad} | Cel: {b.celular}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Grupo: {b.pertenece_grupo}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#ff4444', marginBottom: '15px' }}>🆘 Consultas de Ayuda</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {ayuda.length === 0 && <p style={{ color: '#555', fontSize: '14px' }}>No hay consultas.</p>}
            {ayuda.map((a) => (
              <div key={a.id} style={{ background: '#252525', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #333' }}>
                <div style={{ fontWeight: 'bold' }}>{a.miembros?.nombre} {a.miembros?.apellido}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Cel: {a.celular}</div>
                <div style={{ fontSize: '12px', color: '#fff', marginTop: '5px', fontStyle: 'italic' }}>"{a.mensaje}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="🔍 Buscar miembro..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 3, padding: '15px', borderRadius: '12px', background: '#1E1E1E', color: '#fff', border: '1px solid #333' }} />
        <select value={filtroHorario} onChange={(e) => setFiltroHorario(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: '#A8D500', color: '#000', fontWeight: 'bold', border: 'none' }}>
          <option value="Todas">Todos</option>
          <option value="09:00">09:00</option>
          <option value="11:00">11:00</option>
          <option value="20:00">20:00</option>
          <option value="Extraoficial">Extraoficiales</option>
        </select>
      </div>

      {/* TABLA DE ASISTENCIAS */}
      <div style={{ background: '#1E1E1E', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#252525', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Miembro</th>
              <th style={{ padding: '15px' }}>Reunión</th>
              <th style={{ padding: '15px' }}>Entrada</th>
              <th style={{ padding: '15px' }}>Info</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Enviar Mensaje Personal</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((a) => {
              const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid #252525' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold' }}>{a.miembros?.nombre} {a.miembros?.apellido}</div>
                    {esNuevo && <span style={{ fontSize: '10px', background: '#A8D500', color: '#000', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>NUEVO</span>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: a.horario_reunion === 'Extraoficial' ? '#FFB400' : '#333', color: a.horario_reunion === 'Extraoficial' ? '#000' : '#fff' }}>
                      {a.horario_reunion}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#888' }}>{a.hora_entrada}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ color: a.racha >= 4 ? '#A8D500' : '#888', fontWeight: 'bold' }}>
                      {a.racha >= 4 ? '🔥' : '📍'} Racha: {a.racha}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    {a.miembros?.token_notificacion && (
                      <button
                        onClick={() => enviarNotificacionIndividual(a.miembros.token_notificacion, `${a.miembros.nombre} ${a.miembros.apellido}`)}
                        style={{ background: '#333', border: '1px solid #555', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A8D500', margin: '0 auto' }}
                        title="Enviar mensaje personal"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, isActive, icon }: any) {
  return (
    <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center', opacity: isActive ? 1 : 0.3, transition: '0.3s' }}>
      {icon && <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>}
      <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: isActive ? color : '#555' }}>{value}</div>
    </div>
  )
}


'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }))
  const [tituloPush, setTituloPush] = useState('Iglesia del Salvador')
  const [mensajePush, setMensajePush] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [notificacionStatus, setNotificacionStatus] = useState({ show: false, message: '', error: false })

  const hoyArg = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth')
    if (isAuth === 'true') setAuthorized(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Iglesia2026') {
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

  useEffect(() => {
    if (authorized) {
      fetchAsistencias();
      const channel = supabase.channel('cambios').on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias()).subscribe();
      return () => { supabase.removeChannel(channel) };
    }
  }, [authorized, fechaSeleccionada])

  const fetchAsistencias = async () => {
    // 1. Traemos las asistencias del día seleccionado
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        id, 
        miembro_id, 
        horario_reunion, 
        hora_entrada, 
        fecha, 
        miembros (nombre, apellido, created_at)
      `)
      .eq('fecha', fechaSeleccionada)
      .order('hora_entrada', { ascending: false });

    if (error) {
      console.error("Error cargando asistencias:", error);
      return;
    }

    // 2. Para calcular la racha, traemos TODOS los registros de asistencia de los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const fechaLimite = hace30Dias.toISOString().split('T')[0];

    const { data: historial } = await supabase
      .from('asistencias')
      .select('miembro_id')
      .gte('fecha', fechaLimite);

    if (data) {
      const listaFinal = data.map(asist => {
        // Contamos cuántas veces aparece este miembro_id en el historial de 30 días
        const racha = historial ? historial.filter(h => h.miembro_id === asist.miembro_id).length : 0;
        return { ...asist, racha };
      });
      setAsistencias(listaFinal);
    }
  }

  const exportarCSV = () => {
    const encabezados = "Nombre,Apellido,Reunion,Hora Ingreso,Fecha\n";
    const filas = asistencias.map(a => `${a.miembros?.nombre},${a.miembros?.apellido},${a.horario_reunion},${a.hora_entrada},${a.fecha}`).join("\n");
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Asistencias_${fechaSeleccionada}.csv`;
    link.click();
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
    } catch (e) {
      setNotificacionStatus({ show: true, message: `❌ Error de red`, error: true });
    }
    setEnviando(false);
    setTimeout(() => setNotificacionStatus({ show: false, message: '', error: false }), 4000);
  }

  const datosFiltrados = asistencias.filter(a => {
    const nombre = `${a.miembros?.nombre} ${a.miembros?.apellido}`.toLowerCase();
    return nombre.includes(busqueda.toLowerCase()) && (filtroHorario === 'Todas' || a.horario_reunion === filtroHorario);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <StatCard label="Total Hoy" value={asistencias.length} color="#A8D500" isActive={asistencias.length > 0} />
        <StatCard label="09:00 HS" value={asistencias.filter(a => a.horario_reunion === '09:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '09:00').length > 0} />
        <StatCard label="11:00 HS" value={asistencias.filter(a => a.horario_reunion === '11:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '11:00').length > 0} />
        <StatCard label="20:00 HS" value={asistencias.filter(a => a.horario_reunion === '20:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '20:00').length > 0} />
      </div>

      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, color: '#A8D500' }}>📢 Notificar a: {filtroHorario === 'Todas' ? 'Toda la Iglesia' : `Reunión ${filtroHorario}`}</h3>
        <input placeholder="Título" value={tituloPush} onChange={(e) => setTituloPush(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '10px' }} />
        <textarea placeholder="Mensaje..." value={mensajePush} onChange={(e) => setMensajePush(e.target.value)} style={{ width: '100%', padding: '12px', height: '70px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '15px' }} />
        <button onClick={enviarNotificacion} disabled={enviando} style={{ width: '100%', padding: '15px', background: '#A8D500', color: '#000', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>{enviando ? 'PROCESANDO...' : 'ENVIAR NOTIFICACIÓN'}</button>
        {notificacionStatus.show && <div style={{ marginTop: '15px', textAlign: 'center', color: notificacionStatus.error ? '#ff4444' : '#A8D500', fontWeight: 'bold' }}>{notificacionStatus.message}</div>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="🔍 Buscar miembro..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 3, padding: '15px', borderRadius: '12px', background: '#1E1E1E', color: '#fff', border: '1px solid #333' }} />
        <select value={filtroHorario} onChange={(e) => setFiltroHorario(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: '#A8D500', color: '#000', fontWeight: 'bold', border: 'none' }}>
          <option value="Todas">Todos</option>
          <option value="09:00">09:00</option>
          <option value="11:00">11:00</option>
          <option value="20:00">20:00</option>
        </select>
      </div>

      <div style={{ background: '#1E1E1E', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#252525', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Miembro</th>
              <th style={{ padding: '15px' }}>Reunión</th>
              <th style={{ padding: '15px' }}>Info / Racha (30d)</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((a) => {
              const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid #252525' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold' }}>{a.miembros?.nombre} {a.miembros?.apellido}</div>
                    {esNuevo && <span style={{ fontSize: '10px', background: '#A8D500', color: '#000', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>NUEVO</span>}
                  </td>
                  <td style={{ padding: '15px' }}>{a.horario_reunion} - {a.hora_entrada}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ color: a.racha >= 4 ? '#A8D500' : '#888', fontWeight: 'bold' }}>
                      {a.racha >= 4 ? '🔥' : '📍'} Racha: {a.racha}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, isActive }: any) {
  return (
    <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center', opacity: isActive ? 1 : 0.3 }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: isActive ? color : '#555' }}>{value}</div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  const [enviando, setEnviando] = useState(false)
  const [notificacionStatus, setNotificacionStatus] = useState({ show: false, message: '', error: false })

  const hoyArg = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth')
    if (isAuth === 'true') setAuthorized(true)
  }, [])

  useEffect(() => {
    if (authorized) {
      fetchAsistencias();
      fetchProgramaciones();
      const channel = supabase.channel('cambios').on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => fetchAsistencias()).subscribe();
      return () => { supabase.removeChannel(channel) };
    }
  }, [authorized, fechaSeleccionada])

  const fetchAsistencias = async () => {
    const { data } = await supabase
      .from('asistencias')
      .select(`id, miembro_id, horario_reunion, hora_entrada, fecha, miembros (nombre, apellido, created_at)`)
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

      {/* TARJETAS ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <StatCard label="Total Hoy" value={asistencias.length} color="#A8D500" isActive={asistencias.length > 0} />
        <StatCard label="Extra" value={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length} color="#FFB400" isActive={asistencias.filter(a => a.horario_reunion === 'Extraoficial').length > 0} />
        <StatCard label="09:00 HS" value={asistencias.filter(a => a.horario_reunion === '09:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '09:00').length > 0} />
        <StatCard label="11:00 HS" value={asistencias.filter(a => a.horario_reunion === '11:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '11:00').length > 0} />
        <StatCard label="20:00 HS" value={asistencias.filter(a => a.horario_reunion === '20:00').length} color="#fff" isActive={asistencias.filter(a => a.horario_reunion === '20:00').length > 0} />
      </div>

      {/* PANEL DE PROGRAMACIÓN (Avisos y Versículos) */}
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
              if(!mensaje || !hora) return alert('Completa mensaje y hora');
              const { error } = await supabase.from('programaciones').insert([{ mensaje, dia_semana: dia, hora, activo: true }]);
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
  {programaciones.length === 0 && <p style={{color: '#555', fontSize: '14px'}}>No hay envíos programados.</p>}
  {programaciones.map((p) => (
    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#252525', padding: '12px 18px', borderRadius: '12px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* INDICADOR DE ESTADO VISUAL */}
        <div 
          title={p.ultimo_estado ? `Estado: ${p.ultimo_estado}` : 'Esperando ejecución'}
          style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: p.ultimo_estado === 'Exitoso' ? '#A8D500' : p.ultimo_estado?.includes('Error') ? '#ff4444' : '#555',
            boxShadow: p.ultimo_estado === 'Exitoso' ? '0 0 8px #A8D500' : 'none'
          }} 
        />
        
        <div>
          <div style={{ fontWeight: 'bold', color: p.mensaje.toUpperCase() === 'VERSICULO' ? '#FFB400' : '#fff' }}>
            {p.mensaje.toUpperCase() === 'VERSICULO' ? '📖 Versículo Diario' : p.mensaje}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {p.dia_semana} a las {p.hora.substring(0,5)} hs 
            {p.ultima_ejecucion && (
              <span style={{ marginLeft: '8px', fontStyle: 'italic', color: '#555' }}>
                • Envío: {new Date(p.ultima_ejecucion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* TEXTO DE ESTADO (Opcional, para más claridad) */}
        {p.ultimo_estado && (
          <span style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: p.ultimo_estado === 'Exitoso' ? '#A8D500' : '#ff4444',
            background: 'rgba(0,0,0,0.2)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {p.ultimo_estado.toUpperCase()}
          </span>
        )}

        <button 
          onClick={async () => {
            if(confirm('¿Eliminar esta programación?')) {
              await supabase.from('programaciones').delete().eq('id', p.id);
              fetchProgramaciones();
            }
          }}
          style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '18px', padding: '5px' }}
        >
          🗑️
        </button>
      </div>
    </div>
  ))}
</div>

      {/* PANEL DE NOTIFICACIONES MANUALES */}
      <div style={{ background: '#1E1E1E', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ marginTop: 0, color: '#A8D500' }}>📢 Notificar a: {filtroHorario === 'Todas' ? 'Toda la Iglesia' : `Reunión ${filtroHorario}`}</h3>
        <input placeholder="Título" value={tituloPush} onChange={(e) => setTituloPush(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '10px' }} />
        <textarea 
          placeholder="Escribe el mensaje aquí..." 
          value={mensajePush} 
          onChange={(e) => setMensajePush(e.target.value)} 
          style={{ width: '100%', padding: '15px', height: '100px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '15px', fontSize: '16px', resize: 'vertical' }} 
        />
        <button onClick={enviarNotificacion} disabled={enviando} style={{ width: '100%', padding: '15px', background: '#A8D500', color: '#000', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>{enviando ? 'PROCESANDO...' : 'ENVIAR NOTIFICACIÓN AHORA'}</button>
        {notificacionStatus.show && <div style={{ marginTop: '15px', textAlign: 'center', color: notificacionStatus.error ? '#ff4444' : '#A8D500', fontWeight: 'bold' }}>{notificacionStatus.message}</div>}
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
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((a) => {
              const esNuevo = a.miembros?.created_at && new Date(a.miembros.created_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyArg;
              const esExtra = a.horario_reunion === 'Extraoficial';
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid #252525' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold' }}>{a.miembros?.nombre} {a.miembros?.apellido}</div>
                    {esNuevo && <span style={{ fontSize: '10px', background: '#A8D500', color: '#000', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>NUEVO</span>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      fontSize: '12px', padding: '4px 8px', borderRadius: '6px', 
                      background: esExtra ? '#FFB400' : '#333',
                      color: esExtra ? '#000' : '#fff',
                      fontWeight: esExtra ? 'bold' : 'normal'
                    }}>
                      {a.horario_reunion}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#888' }}>{a.hora_entrada}</td>
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
    <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '20px', border: '1px solid #333', textAlign: 'center', opacity: isActive ? 1 : 0.3, transition: '0.3s' }}>
      <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: isActive ? color : '#555' }}>{value}</div>
    </div>
  )
}

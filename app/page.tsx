'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [tituloPush, setTituloPush] = useState('Iglesia del Salvador')
  const [mensajePush, setMensajePush] = useState('')
  const [enviando, setEnviando] = useState(false) // Estado para el botón

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Iglesia2026') setAuthorized(true)
    else alert('Contraseña incorrecta')
  }

  useEffect(() => {
    if (authorized) fetchAsistencias()
  }, [authorized])

  const fetchAsistencias = async () => {
    const { data } = await supabase
      .from('asistencias')
      .select(`
        id,
        miembro_id,
        horario_reunion,
        hora_entrada,
        fecha,
        miembros (nombre, apellido, token_notificacion)
      `)
      .order('fecha', { ascending: false })
    if (data) setAsistencias(data)
  }

  const datosFiltrados = asistencias.filter(item => {
    const cumpleHorario = filtroHorario === 'Todas' || item.horario_reunion === filtroHorario
    const nombreCompleto = `${item.miembros?.nombre} ${item.miembros?.apellido}`.toLowerCase()
    const cumpleBusqueda = nombreCompleto.includes(busqueda.toLowerCase())
    return cumpleHorario && cumpleBusqueda
  })

  // --- FUNCIÓN MAESTRA DE ENVÍO ---
  const enviarNotificaciones = async () => {
    if (!mensajePush.trim()) return alert("Escribe un mensaje antes de enviar.");

    // 1. Extraer tokens únicos de la lista que estamos viendo en pantalla
    const tokens = [...new Set(datosFiltrados
      .map(item => item.miembros?.token_notificacion)
      .filter(token => token && token.startsWith('ExponentPushToken')))];

    if (tokens.length === 0) {
      return alert("No hay dispositivos registrados en este filtro para recibir mensajes.");
    }

    if (!confirm(`¿Enviar este mensaje a ${tokens.length} personas?`)) return;

    setEnviando(true);

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          to: tokens,
          title: tituloPush,
          body: mensajePush,
          sound: 'default',
        }),
      });

      if (response.ok) {
        alert("✅ ¡Notificaciones enviadas con éxito!");
        setMensajePush(''); // Limpia el mensaje
      } else {
        alert("❌ Error al enviar a través de Expo.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión.");
    } finally {
      setEnviando(false);
    }
  };

  if (!authorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: '#f8f9fa', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', textAlign: 'center', border: '1px solid #ddd' }}>
          <h2 style={{ color: '#000' }}>⛪ Acceso Admin</h2>
          <input 
            type="password" 
            placeholder="Contraseña Maestra" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', width: '250px', borderRadius: '6px', border: '1px solid #000', marginBottom: '20px', display: 'block', color: '#000', backgroundColor: '#fff' }}
          />
          <button type="submit" style={{ background: '#0070f3', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <main style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui', backgroundColor: '#ffffff', minHeight: '100vh', color: '#000' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ color: '#000' }}>Panel de Asistencia</h1>
        <button onClick={() => setAuthorized(false)} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar Sesión</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: '#cfe2ff', borderRadius: '10px', border: '1px solid #9ec5fe' }}>
          <h4 style={{ margin: 0, color: '#084298' }}>Total Registrados</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0', color: '#084298' }}>{asistencias.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#d1e7dd', borderRadius: '10px', border: '1px solid #a3cfbb' }}>
          <h4 style={{ margin: 0, color: '#0f5132' }}>Vistos en Filtro</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0', color: '#0f5132' }}>{datosFiltrados.length}</p>
        </div>
      </div>

      <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '2px solid #000', marginBottom: '40px' }}>
        <h3 style={{ color: '#000', marginTop: 0 }}>📢 Enviar Notificación Push</h3>
        <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '15px' }}>
          Destinatarios: <strong style={{ textDecoration: 'underline' }}>
            {filtroHorario === 'Todas' ? 'TODA LA IGLESIA' : `GRUPO ${filtroHorario}`}
          </strong>
        </p>
        <input 
          type="text" 
          value={tituloPush} 
          onChange={(e) => setTituloPush(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #000', backgroundColor: '#fff', color: '#000' }}
        />
        <textarea 
          placeholder="Escribe el mensaje..."
          value={mensajePush}
          onChange={(e) => setMensajePush(e.target.value)}
          style={{ width: '100%', padding: '12px', height: '100px', borderRadius: '6px', border: '1px solid #000', backgroundColor: '#fff', color: '#000', marginBottom: '15px' }}
        />
        <button 
          onClick={enviarNotificaciones}
          disabled={enviando}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: enviando ? '#666' : '#000', 
            color: '#fff', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: enviando ? 'not-allowed' : 'pointer', 
            fontSize: '1rem' 
          }}
        >
          {enviando ? 'ENVIANDO...' : 'ENVIAR AHORA'}
        </button>
      </div>

      <div style={{ marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Buscar fiel..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #000', minWidth: '250px', backgroundColor: '#fff', color: '#000' }}
        />
        <select 
          value={filtroHorario} 
          onChange={(e) => setFiltroHorario(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #000', backgroundColor: '#fff', color: '#000', cursor: 'pointer' }}
        >
          <option value="Todas">Todas las reuniones</option>
          <option value="09:00">09:00 HS</option>
          <option value="11:00">11:00 HS</option>
          <option value="20:00">20:00 HS</option>
          <option value="Extraoficial">Fuera de Horario</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #000' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#000' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Nombre Completo</th>
              <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Horario Reunion</th>
              <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Hora Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((asistencia) => (
              <tr key={asistencia.id} style={{ borderTop: '1px solid #000' }}>
                <td style={{ padding: '15px', color: '#000', fontWeight: '500' }}>
                  {asistencia.miembros?.nombre} {asistencia.miembros?.apellido}
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '4px 10px', background: '#eee', borderRadius: '20px', fontSize: '0.85rem', color: '#000', border: '1px solid #ccc' }}>
                    {asistencia.horario_reunion}
                  </span>
                </td>
                <td style={{ padding: '15px', color: '#000' }}>{asistencia.hora_entrada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

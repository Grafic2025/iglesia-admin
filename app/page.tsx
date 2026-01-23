'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  
  // Estados para notificaciones
  const [title, setTitle] = useState('Iglesia del Salvador')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

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
      .select(`id, horario_reunion, hora_entrada, fecha, miembros (nombre, apellido)`)
      .order('fecha', { ascending: false })
    if (data) setAsistencias(data)
  }

  const sendNotification = async () => {
    if (!message) return alert("Escribe un mensaje")
    setSending(true)
    const res = await fetch('/api/notify', {
      method: 'POST',
      body: JSON.stringify({ title, message, horario: filtroHorario }),
      headers: { 'Content-Type': 'application/json' }
    })
    setSending(false)
    if (res.ok) alert("📢 Notificación enviada")
  }

  const datosFiltrados = asistencias.filter(item => {
    const cumpleHorario = filtroHorario === 'Todas' || item.horario_reunion === filtroHorario
    const nombreCompleto = `${item.miembros?.nombre} ${item.miembros?.apellido}`.toLowerCase()
    return cumpleHorario && nombreCompleto.includes(busqueda.toLowerCase())
  })

  if (!authorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: 'white', borderRadius: '12px', textAlign: 'center', color: '#333' }}>
          <h2 style={{ marginBottom: '20px' }}>⛪ Acceso Admin</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', marginBottom: '20px', display: 'block', width: '100%', border: '1px solid #ccc', color: '#333' }} placeholder="Contraseña" />
          <button type="submit" style={{ background: '#0070f3', color: 'white', padding: '12px 40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <main style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ color: '#000' }}>Admin Iglesia ⛪</h1>
        <button onClick={() => setAuthorized(false)} style={{ color: '#666' }}>Salir</button>
      </header>

      {/* TARJETAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px', border: '1px solid #bbdefb' }}>
          <b style={{ color: '#1976d2' }}>Total Registrados</b>
          <p style={{ fontSize: '24px', margin: '5px 0', color: '#000' }}>{asistencias.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#f1f8e9', borderRadius: '10px', border: '1px solid #dcedc8' }}>
          <b style={{ color: '#388e3c' }}>Vistos en Filtro</b>
          <p style={{ fontSize: '24px', margin: '5px 0', color: '#000' }}>{datosFiltrados.length}</p>
        </div>
      </div>

      {/* FORMULARIO NOTIFICACIONES */}
      <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0, color: '#000' }}>📢 Enviar Notificación Push</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>Se enviará a: <b>{filtroHorario === 'Todas' ? 'TODA LA IGLESIA' : `SOLO REUNIÓN ${filtroHorario}`}</b></p>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', color: '#000' }} />
        <textarea placeholder="Mensaje para los fieles..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '100%', padding: '10px', height: '80px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '10px', color: '#000' }} />
        <button onClick={sendNotification} disabled={sending} style={{ width: '100%', background: '#000', color: '#fff', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          {sending ? 'Enviando...' : 'ENVIAR AHORA'}
        </button>
      </section>

      {/* TABLA Y FILTROS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '5px', color: '#000' }} />
        <select value={filtroHorario} onChange={(e) => setFiltroHorario(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px', color: '#000' }}>
          <option value="Todas">Todas las reuniones</option>
          <option value="09:00">09:00 HS</option>
          <option value="11:00">11:00 HS</option>
          <option value="20:00">20:00 HS</option>
        </select>
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#eee', color: '#000' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Horario</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                <td style={{ padding: '12px' }}>{a.miembros?.nombre} {a.miembros?.apellido}</td>
                <td style={{ padding: '12px' }}>{a.horario_reunion}</td>
                <td style={{ padding: '12px' }}>{a.hora_entrada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

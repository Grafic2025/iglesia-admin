'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [filtroHorario, setFiltroHorario] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  // 1. Manejo del Login Simple
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Iglesia2026') { // Cambia esta clave por la que quieras
      setAuthorized(true)
    } else {
      alert('Contraseña incorrecta')
    }
  }

  useEffect(() => {
    if (authorized) fetchAsistencias()
  }, [authorized])

  const fetchAsistencias = async () => {
    // Traemos datos uniendo las tablas de asistencias y miembros
    const { data } = await supabase
      .from('asistencias')
      .select(`
        id,
        horario_reunion,
        hora_entrada,
        fecha,
        miembros (nombre, apellido)
      `)
      .order('fecha', { ascending: false })
    if (data) setAsistencias(data)
  }

  // Filtrado lógico
  const datosFiltrados = asistencias.filter(item => {
    const cumpleHorario = filtroHorario === 'Todas' || item.horario_reunion === filtroHorario
    const nombreCompleto = `${item.miembros?.nombre} ${item.miembros?.apellido}`.toLowerCase()
    const cumpleBusqueda = nombreCompleto.includes(busqueda.toLowerCase())
    return cumpleHorario && cumpleBusqueda
  })

  if (!authorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2>⛪ Acceso Admin</h2>
          <input 
            type="password" 
            placeholder="Contraseña Maestra" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', width: '250px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px', display: 'block' }}
          />
          <button type="submit" style={{ background: '#0070f3', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <main style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Panel de Asistencia</h1>
        <button onClick={() => setAuthorized(false)} style={{ background: '#eee', border: 'none', padding: '8px 15px', borderRadius: '6px' }}>Cerrar Sesión</button>
      </header>

      {/* TARJETAS DE RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px' }}>
          <h4 style={{ margin: 0 }}>Total Hoy</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>{asistencias.length}</p>
        </div>
        <div style={{ padding: '20px', background: '#f1f8e9', borderRadius: '10px' }}>
          <h4 style={{ margin: 0 }}>Reunión Actual</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>{datosFiltrados.length}</p>
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar fiel por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '250px' }}
        />
        <select 
          value={filtroHorario} 
          onChange={(e) => setFiltroHorario(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="Todas">Todos los Horarios</option>
          <option value="09:00">09:00 HS</option>
          <option value="11:00">11:00 HS</option>
          <option value="20:00">20:00 HS</option>
        </select>
      </div>

      {/* TABLA PROFESIONAL */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px' }}>Nombre Completo</th>
              <th style={{ textAlign: 'left', padding: '15px' }}>Reunión</th>
              <th style={{ textAlign: 'left', padding: '15px' }}>Hora Ingreso</th>
              <th style={{ textAlign: 'left', padding: '15px' }}>Asistió</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((asistencia) => (
              <tr key={asistencia.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{asistencia.miembros?.nombre} {asistencia.miembros?.apellido}</td>
                <td style={{ padding: '15px' }}><span style={{ padding: '4px 8px', background: '#eee', borderRadius: '4px', fontSize: '0.85rem' }}>{asistencia.horario_reunion}</span></td>
                <td style={{ padding: '15px' }}>{asistencia.hora_entrada}</td>
                <td style={{ padding: '15px' }}><span style={{ color: 'green' }}>✅ Presente</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
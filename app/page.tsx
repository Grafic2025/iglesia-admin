'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Scan = {
  id: number
  qr_value: string
  created_at: string
}

export default function Page() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScans = async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setScans(data)
      }

      setLoading(false)
    }

    fetchScans()
  }, [])

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando...</div>
  }

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        QR escaneados – Iglesia del Salvador
      </h1>

      {scans.length === 0 ? (
        <p>No hay escaneos todavía</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>QR</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {scans.map(scan => (
              <tr key={scan.id}>
                <td>{scan.qr_value}</td>
                <td>
                  {new Date(scan.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

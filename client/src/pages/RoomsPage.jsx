import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:4000/rooms'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => setRooms(data))
      .catch(() => setError('Não foi possível carregar as salas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container">Carregando salas…</div>
  if (error) return <div className="container error">{error}</div>

  return (
    <div className="container">
      <h1>Salas disponíveis</h1>
      <div className="grid">
        {rooms.map(room => (
          <Link key={room.key} to={`/room/${room.key}`} className="card">
            <h2>{room.name}</h2>
            <p>{room.description}</p>
            <small>{room.url}</small>
          </Link>
        ))}
      </div>
    </div>
  )
}

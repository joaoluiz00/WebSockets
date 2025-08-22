import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

const ROOMS = {
  geral: 'http://localhost:4001',
  tech: 'http://localhost:4002',
  games: 'http://localhost:4003',
  music: 'http://localhost:4004',
}

export default function ChatRoomPage() {
  const { key } = useParams()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)

  const socketUrl = ROOMS[key]
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socketUrl) {
      navigate('/')
      return
    }

    const s = io(socketUrl, { transports: ['websocket'] })
    socketRef.current = s

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))

    s.on('history', (hist) => setMessages(hist))
    s.on('receiveMessage', (msg) => setMessages(prev => [...prev, msg]))

    return () => {
      s.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const canSend = useMemo(() => input.trim().length > 0 && connected, [input, connected])

  function send() {
    if (!canSend) return
    const payload = { user: username.trim() || 'Anônimo', text: input.trim(), ts: Date.now() }
    socketRef.current?.emit('sendMessage', payload)
    setInput('')
  }

  function onEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="container">
      <button className="link" onClick={() => navigate('/')}>← Voltar</button>
      <h1>Chat: {key}</h1>

      <div className="row">
        <input
          className="username"
          placeholder="Seu nome"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <span className={connected ? 'status on' : 'status off'}>
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div className="chat">
        {messages.map(m => (
          <div key={m.id} className="msg">
            <b>{m.user}:</b> <span>{m.text}</span>
            <small>{new Date(m.ts).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="row">
        <textarea
          className="input"
          rows={2}
          placeholder="Digite sua mensagem e pressione Enter"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onEnter}
        />
        <button className="send" disabled={!canSend} onClick={send}>Enviar</button>
      </div>
    </div>
  )
}

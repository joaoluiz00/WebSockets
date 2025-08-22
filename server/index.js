const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Definição das salas com suas portas específicas
// Cada sala sobe um servidor Socket.IO independente (portas diferentes)
const rooms = [
  { key: 'geral', name: 'Geral', port: 4001, description: 'Conversa geral' },
  { key: 'tech', name: 'Tecnologia', port: 4002, description: 'Tech, dev, gadgets' },
  { key: 'games', name: 'Games', port: 4003, description: 'Jogos e eSports' },
  { key: 'music', name: 'Música', port: 4004, description: 'Sons, playlists e bandas' }
];

// API para listar as salas e gateway de health-check
const apiPort = 4000;
const api = express();
api.use(cors());

api.get('/rooms', (req, res) => {
  res.json(
    rooms.map(r => ({ key: r.key, name: r.name, description: r.description, url: `http://localhost:${r.port}` }))
  );
});

api.get('/', (_req, res) => res.send('Multi-room chat API OK'));

api.listen(apiPort, () => console.log(`API rodando na porta ${apiPort}`));

// Função utilitária para criar um servidor de chat por sala
function startRoomServer(room) {
  const app = express();
  app.use(cors());
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Mensagens em memória por sala (reset a cada restart)
  const history = [];

  io.on('connection', socket => {
    console.log(`[${room.key}] conectado: ${socket.id}`);

    // Envia histórico ao novo cliente
    socket.emit('history', history);

    socket.on('sendMessage', payload => {
      // payload esperado: { user: string, text: string, ts?: number }
      const msg = {
        user: payload?.user?.trim() || 'Anônimo',
        text: String(payload?.text ?? '').slice(0, 2000),
        ts: payload?.ts || Date.now(),
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      };
      history.push(msg);
      if (history.length > 200) history.shift(); // limita histórico
      io.emit('receiveMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log(`[${room.key}] desconectou: ${socket.id}`);
    });
  });

  server.listen(room.port, () => {
    console.log(`Sala '${room.name}' escutando em http://localhost:${room.port}`);
  });
}

// Inicia todos os servidores de sala
rooms.forEach(startRoomServer);

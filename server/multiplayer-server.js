/*
 * Servidor multiplayer simples (WebSocket puro)
 * Sala unica com limite de 20 jogadores.
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 2567;
const MAX_PLAYERS = 20;

const wss = new WebSocket.Server({ port: PORT });
const players = new Map(); // id -> player data

function broadcast(message, excludeId = null) {
  const payload = JSON.stringify(message);
  for (const [id, p] of players.entries()) {
    if (id === excludeId) continue;
    if (p.ws.readyState === WebSocket.OPEN) p.ws.send(payload);
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

wss.on('connection', (ws) => {
  const playerId = makeId();
  let joined = false;

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'join' && !joined) {
      if (players.size >= MAX_PLAYERS) {
        ws.send(JSON.stringify({ type: 'room_full' }));
        ws.close();
        return;
      }

      joined = true;
      const player = {
        id: playerId,
        name: String(msg.name || 'Jogador').slice(0, 20),
        skin: msg.skin || 'normal',
        x: Number(msg.x || 0),
        y: Number(msg.y || 0.5),
        z: Number(msg.z || 0),
        ry: Number(msg.ry || 0),
        ws
      };

      players.set(playerId, player);

      ws.send(JSON.stringify({ type: 'welcome', playerId }));
      ws.send(JSON.stringify({
        type: 'snapshot',
        players: Array.from(players.values())
          .filter((p) => p.id !== playerId)
          .map((p) => ({ id: p.id, name: p.name, skin: p.skin, x: p.x, y: p.y, z: p.z, ry: p.ry }))
      }));

      broadcast({
        type: 'player_join',
        player: { id: player.id, name: player.name, skin: player.skin, x: player.x, y: player.y, z: player.z, ry: player.ry }
      }, playerId);
      return;
    }

    if (!joined || !players.has(playerId)) return;

    const p = players.get(playerId);

    if (msg.type === 'state') {
      p.x = Number(msg.x || 0);
      p.y = Number(msg.y || 0.5);
      p.z = Number(msg.z || 0);
      p.ry = Number(msg.ry || 0);
      if (msg.skin) p.skin = String(msg.skin);

      broadcast({
        type: 'player_state',
        playerId,
        x: p.x,
        y: p.y,
        z: p.z,
        ry: p.ry
      }, playerId);
      return;
    }

    if (msg.type === 'transform') {
      p.skin = String(msg.skin || 'normal');
      broadcast({ type: 'player_transform', playerId, skin: p.skin }, playerId);
      return;
    }

    if (msg.type === 'chat') {
      const text = String(msg.text || '').slice(0, 80);
      if (!text) return;
      broadcast({ type: 'chat', playerId, name: p.name, text }, playerId);
    }
  });

  ws.on('close', () => {
    const p = players.get(playerId);
    players.delete(playerId);
    if (p) {
      broadcast({ type: 'player_leave', playerId, name: p.name });
    }
  });
});

console.log(`Servidor multiplayer rodando na porta ${PORT}`);

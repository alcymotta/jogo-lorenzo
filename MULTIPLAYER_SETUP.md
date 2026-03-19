# Multiplayer Setup - Ilha de Capibara

## 1. Rodar servidor WebSocket

```bash
cd server
npm install
npm start
```

Servidor padrao:

```bash
ws://localhost:2567
```

## 2. Conectar o cliente do jogo

Opcao A (query string):

```bash
http://localhost:8000/?ws=ws://localhost:2567
```

Opcao B (console do navegador):

```javascript
GameDebug.setServer('ws://localhost:2567')
```

Depois recarregue a pagina.

## 3. Publicacao com GitHub Pages

- O front-end pode continuar no GitHub Pages.
- O servidor WebSocket deve rodar separado (Railway, Render, VPS, etc.).
- Salve a URL publica em `localStorage` via `GameDebug.setServer('wss://...')`.

## 4. Limites e protocolo atual

- 20 jogadores por sala
- sala padrao: `ilha-main`

Mensagens:

- `join`
- `welcome`
- `snapshot`
- `player_join`
- `player_leave`
- `state`
- `player_state`
- `transform`
- `player_transform`
- `chat`

## 5. Troubleshooting

- Se `Rede: OFFLINE`, verifique se a URL ws/wss esta correta.
- Em HTTPS, use `wss://`.
- Verifique firewall/porta 2567.
- Abra console do navegador para logs de conexao.

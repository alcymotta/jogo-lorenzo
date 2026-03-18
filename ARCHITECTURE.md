# 📚 Estrutura do Projeto - Documentação Técnica

## 📂 Hierarquia de Arquivos

```
Jogo Lorenzo/
├── 📄 index.html              ⭐ ABRA ESTE ARQUIVO!
├── 📄 test.html               Página de testes/diagnóstico
├── 🎨 styles.css              Estilos CSS
├── ⚙️ config.js               Configurações (opcional)
│
├── 📖 Documentação:
│   ├── README.md              Documentação completa
│   ├── QUICK_START.md         Início rápido
│   ├── instructions.txt       Instruções simples (texto)
│   ├── ARCHITECTURE.md        Este arquivo
│
├── 📁 js/                      Scripts JavaScript
│   ├── main.js                Inicialização e eventos globais
│   ├── game.js                🎮 Engine principal 3D
│   ├── player.js              👤 Sistema do jogador
│   ├── camera.js              📸 Câmera 3D
│   ├── controls.js            🕹️ Controles (teclado/touch)
│   ├── map.js                 🗺️ Geração do mapa
│   ├── npc.js                 🐹 NPCs e animações
│   └── chat.js                💬 Chat e códigos
│
└── 📝 Outros:
    └── Este documento
```

---

## 🎮 Fluxo de Execução

```
1. Usuário abre index.html
    ↓
2. DOM carregado → DOMContentLoaded event
    ↓
3. main.js inicializa setupGameUI() e setupGameEvents()
    ↓
4. GameEngine é criado (game.js)
    ↓
5. Componentes carregados em ordem:
    - Cena 3D (Three.js)
    - Renderizador
    - Câmera
    - Iluminação
    - MapGenerator (mapa.js)
    - Player (player.js)
    - ThirdPersonCamera (camera.js)
    - ControlSystem (controls.js)
    - ChatSystem (chat.js)
    - NPCs (npc.js)
    ↓
6. Loop de animação (animate() - 60fps)
    ↓
7. Renderização contínua
```

---

## 📦 Componentes Principais

### 1. **GameEngine** (game.js)
**Responsável por:** Gerenciar a cena, física, entidades

**Funções principais:**
- `init()` - Inicializar tudo
- `animate()` - Loop principal
- `updatePhysics()` - Atualizar gravidade
- `toggleFly()` - Ativar vôo
- `applyTransformation()` - Transformar jogador

**Propriedades:**
```javascript
scene          // Cena Three.js
camera         // Câmera principal
renderer       // Renderizador WebGL
player         // Références ao jogador
controls       // Sistema de controles
map            // Gerador de mapa
```

---

### 2. **Player** (player.js)
**Responsável por:** Renderização e controle do personagem

**Funções principais:**
- `createCharacter()` - Criar modelo 3D
- `move(direction)` - Mover no plano XZ
- `jump()` - Pular
- `transform(type)` - Mudar transformação
- `playEmote(type)` - Executar emote
- `toggleFly()` - Ativar/desativar vôo

**Transformações disponíveis:**
- `normal` - Padrão
- `nube` - Nuvem branca
- `c00lkidd` - Rosa chique
- `capybara` - Marrom
- `guarda` - Azul

---

### 3. **ThirdPersonCamera** (camera.js)
**Responsável por:** Posicionar câmera atrás do jogador

**Funções principais:**
- `update()` - Atualizar posição da câmera
- `zoom(direction)` - Zoom in/out
- `reset()` - Resetar câmera

**Propriedades:**
- `distance` - Distância do jogador
- `height` - Altura acima do jogador
- `angle` - Rotação horizontal

---

### 4. **ControlSystem** (controls.js)
**Responsável por:** Processar entrada do usuário

**Funções principais:**
- `onKeyDown(event)` - Tecla pressionada
- `onKeyUp(event)` - Tecla solta
- `updateMovement()` - Atualizar movimento

**Entradas suportadas:**
- Teclado (WASD, Espaço, Shift)
- Joystick virtual (mobile)
- Mouse scroll (zoom)

---

### 5. **MapGenerator** (map.js)
**Responsável por:** Criar geometria do mapa

**Funções principais:**
- `generate()` - Gerar mapa completo
- `createTerrain()` - Terreno (grama)
- `createWater()` - Lago
- `plantTrees()` - Árvores
- `placeRocks()` - Rochas
- `createMountains()` - Montanhas
- `update()` - Animar água

**Elementos:**
- Terreno 300x300
- Lago circular
- 15+ árvores
- Várias rochas
- 3 montanhas

---

### 6. **NPC** (npc.js)
**Responsável por:** NPCs animados (capivaras)

**Funções principais:**
- `createModel()` - Criar modelo 3D
- `update()` - Animar e mover
- `animateLegs()` - Animar pernas
- `makeSound()` - Emitir som (feedback)

**Comportamento:**
- Caminham aleatoriamente
- Mudam de direção periodicamente
- Animações de pernas e cauda
- Círculo de erro ao sair dos limites

---

### 7. **ChatSystem** (chat.js)
**Responsável por:** Chat e sistema de códigos

**Funções principais:**
- `sendCode()` - Enviar código
- `processCode(code)` - Processar entrada
- `addMessage(text, type)` - Adicionar mensagem
- `transformPlayer(type)` - Executar transformação

**Códigos especiais:**
```
65395  → Transformar Nube
0762   → Transformar c00lkidd  
77     → Transformar Capivara
888    → Transformar Guarda
;fly   → Ativar vôo
456    → Voador
21120  → Martelo (dono)
```

---

## 🎯 Sistema de Coordenadas

O jogo usa **Three.js coordinate system**:

```
     Y (cima)
     ↑
     |
     └──→ X (direita)
    ╱
   Z (pra dentro)
```

**Limites do mapa:**
- X: -150 a +150
- Y: 0 (chão) a 50+ (céu)
- Z: -150 a +150

---

## 🔄 Ciclo de Atualização

**A cada frame (60fps):**

```
1. Processar entrada (controls.js)
2. Atualizar movimento (player.js)
3. Atualizar física (game.js)
4. Atualizar câmera (camera.js)
5. Atualizar NPCs (npc.js)
6. Atualizar mapa (map.js)
7. Renderizar cena (renderer.render)
```

---

## 📊 Classes Principais

### GameEngine
```javascript
class GameEngine {
    scene, camera, renderer
    player, controls, gameCamera, map
    chatSystem, npcs
    
    init(), animate(), updatePhysics()
    applyTransformation(), toggleFly(), giveItem()
    banPlayer(), onWindowResize()
}
```

### Player
```javascript
class Player {
    position, velocity, rotation
    playerName, health, inventory
    isJumping, isFlying, currentTransform
    
    createCharacter(), update(), move(), jump()
    transform(), playEmote(), addToInventory()
    takeDamage(), heal()
}
```

### NPC
```javascript
class NPC {
    position, velocity, rotation
    moveSpeed, model, bodyParts
    
    createModel(), update(), animateLegs()
    makeSound(), destroy()
}
```

### MapGenerator
```javascript
class MapGenerator {
    scene, terrain, water, trees, rocks
    mountains
    
    generate(), createTerrain(), createWater()
    plantTrees(), placeRocks(), createMountains()
    addDecorations(), update(), checkCollision()
}
```

### ChatSystem
```javascript
class ChatSystem {
    engine, messages, codes
    
    addMessage(), renderMessages(), sendCode()
    processCode(), transformPlayer()
    toggleFly(), giveVoador(), giveBanHammer()
    banPlayer()
}
```

---

## 🎨 Sistema de Cores (Hexadecimal)

```javascript
0x87CEEB  // Sky Blue (céu)
0x00AA00  // Green (grama)
0x1E90FF  // Dodger Blue (água)
0xFFB347  // Light Orange (cabeça padrão)
0xF4A460  // Sandy Brown (corpo)
0xA0755F  // Brown (pernas)
0x8B4513  // Saddle Brown (capivara)
0xFFFFFF  // White (nube)
0xFF1493  // Deep Pink (c00lkidd)
0x1E90FF  // Dodger Blue (guarda)
```

---

## 🔌 Arquitetura de Entrada

```
Teclado/Touch
     ↓
controls.js (ControlSystem)
     ↓
player.js (Player) ← move() / jump()
     ↓
position/velocity atualizado
```

---

## 🔊 Emotes

Sistema baseado em animação visual:

```javascript
playEmote('laugh')   // Cabeça escala (1.1x)
playEmote('mortis')  // Corpo rotaciona 360°
```

---

## 💾 Dados Persistentes

**Atualmente:** Nenhum (pode ser adicionado LocalStorage)

**Como adicionar:**
```javascript
localStorage.setItem('playerName', name)
localStorage.getItem('playerName')
```

---

## 🧪 Sistema de Teste (test.html)

Verifica:
- ✓ WebGL suporte
- ✓ Three.js CDN
- ✓ Arquivos locais
- ✓ LocalStorage
- ✓ Info navegador

---

## 🔧 Customizações Possíveis

### Änder cores:
Editar `config.js` ou cada arquivo `.js`

### Mudar velocidades:
```javascript
player.moveSpeed = 0.20  // Mais rápido
player.jumpForce = 0.45  // Pulos maiores
```

### Adicionar NPCs:
Em `game.js` `spawnNPCs()`:
```javascript
this.npcs.push(new NPC(scene, {
    position: { x: 100, z: 100 },
    type: 'capybara'
}))
```

### Novos códigos:
Em `chat.js`:
```javascript
this.codes['999999'] = {
    name: 'Novo poder',
    action: () => this.novaAcao()
}
```

---

## 📈 Roadmap de Melhorias

- [ ] Multiplayer com WebSockets
- [ ] Física aprimorada (Cannon.js)
- [ ] Sons e música
- [ ] Persistência de dados
- [ ] Mobile otimizado
- [ ] Mais transformações
- [ ] Sistema de partículas
- [ ] Quests/Missions

---

## 🚀 Performance

**Otimizações atuais:**
- Shadow maps 2048x2048
- LOD não implementado (pode adicionar)
- Chunk loading não implementado
- Objeto pooling não implementado

**Há espaço para melhoria!**

---

## 🐛 Debug Útil

Console:
```javascript
gameEngine             // Acesso ao engine
gameEngine.player      // Dados do jogador
gameEngine.scene       // Cena Three.js
GameDebug.playerInfo() // Info jogador
GameDebug.teleport()   // Teleportar
```

---

## 📚 Recursos Externos

- **Three.js:** https://threejs.org
- **WebGL:** Suporte nativo em navegadores modernos
- **Canvas API:** Para renderização 2D (UI)

---

## 👨‍💻 Contribuindo

Para adicionar features:

1. Crie nova classe em novo arquivo
2. Integre ao GameEngine.init()
3. Adicione ao animate() se necessário
4. Update documentação

---

**Última atualização:** Março/2026
**Versão:** 1.0.0
**Status:** Funcional e pronto para jogar! 🎮

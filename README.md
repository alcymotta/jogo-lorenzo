# 🏝️ Ilha de Capibara - Jogo 3D Interativo

Um jogo 3D imersivo construído com **Three.js** que roda diretamente no navegador. Explore uma ilha mágica, colete poderes especiais e se transforme em diferentes personagens!

## 🎮 Características

✨ **Gráficos 3D Low-Poly** em estilo cartoon
🐹 **NPCs Animados** (capivaras andando pelo mapa)
🗺️ **Mapa Expansivo** com lago, árvores, montanhas e mais
🎭 **Sistema de Transformações** (Nube, c00lkidd, Capivara, Guarda)
✈️ **Sistema de Vôo** com diferentes voadores
🎨 **Emotes Personalizados** (Riso, Mortal/Flip)
💬 **Chat com Códigos Especiais** para liberar poderes
📱 **Compatível Mobile** com joystick virtual
🔨 **Sistema de Banimento** com Martelo (apenas dono)

## 🚀 Como Executar

### Opção 1: Abrir Arquivo HTML Direto
```bash
1. Abra a pasta do jogo
2. Clique duplo em "index.html"
3. Pronto! O jogo abrirá no seu navegador padrão
```

### Opção 2: Usar um Servidor Local

**Com Python 3:**
```bash
cd "Jogo Lorenzo"
python -m http.server 8000
# Abra http://localhost:8000 no navegador
```

**Com Python 2:**
```bash
cd "Jogo Lorenzo"
python -m SimpleHTTPServer 8000
# Abra http://localhost:8000 no navegador
```

**Com Node.js (se tiver instalado):**
```bash
cd "Jogo Lorenzo"
npx http-server
```

**Com PHP:**
```bash
cd "Jogo Lorenzo"
php -S localhost:8000
# Abra http://localhost:8000 no navegador
```

## 🎮 Controles

### PC (Teclado)
```
W, A, S, D   → Mover personagem
ESPAÇO       → Pular
C            → Focar no chat
Mouse Scroll → Zoom da câmera
```

### Mobile (Toque)
```
Joystick     → Mover
Botão Pulo   → Pular
Toque        → Interações
```

### Botões UI
```
😂 Emote     → Rir (animate com scaling)
🤸 Mortal    → Fazer pirueta (flip)
✈️ Voar      → Ativar vôo (quando disponível)
```

## 🔑 Códigos Especiais

Digite esses códigos no chat para ativar poderes:

| Código | Efeito | Quem Pode |
|--------|--------|----------|
| `65395` | Transformar em Nube ☁️ | Todos |
| `0762` | Transformar em c00lkidd 😎 | Todos |
| `77` | Transformar em Capivara 🐹 | Todos |
| `888` | Transformar em Guarda 👮 | Todos |
| `;fly` | Ativar vôo ✈️ | Todos |
| `456` | HD Voador 🛸 (dono) / Tapete 🧞 (outros) | Todos |
| `21120` | Martelo do Banimento 🔨 | Apenas Dono |

## 📁 Estrutura do Projeto

```
Jogo Lorenzo/
├── index.html              # Arquivo principal (abra este!)
├── styles.css              # Estilos da interface
├── js/
│   ├── main.js            # Inicialização e eventos globais
│   ├── game.js            # Engine principal, cena 3D, loop
│   ├── player.js          # Personagem, movimento, transformações
│   ├── camera.js          # Câmera em terceira pessoa
│   ├── controls.js        # Sistema de controles (teclado/touch)
│   ├── map.js             # Geração do mapa e elementos
│   ├── npc.js             # NPCs e capivaras animadas
│   └── chat.js            # Sistema de chat e códigos
└── README.md              # Este arquivo
```

## 🎯 Como Jogar

1. **Abra o jogo** - Execute `index.html`
2. **Digite seu nome** - Entre com um apelido na tela inicial
3. **Explore o mapa** - Use WASD para se mover
4. **Digite códigos** - Pressione "C" e digite códigos para ganhar poderes
5. **Colete poderes** - Experimente as transformações e vôo
6. **Divirta-se** - Use emotes e explora a ilha!

## 🛠️ Tecnologias

- **Three.js** - Renderização 3D WebGL
- **JavaScript ES6+** - Lógica do jogo
- **HTML5** - Estrutura
- **CSS3** - Interface e estilos responsivos
- **WebGL** - Rendering 3D acelerado

## 🎨 Personalizações

### Mudar a cor do personagem
Edite `js/player.js`, procure por `MeshPhongMaterial` e altere o valor de `color`:
```javascript
const headMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xFFB347  // Mude este número para hexadecimal de outra cor
});
```

### Ajustar velocidade de movimento
Em `js/player.js`:
```javascript
this.moveSpeed = 0.15;  // Aumente para mais rápido
this.jumpForce = 0.35;  // Aumente para pulos mais altos
```

### Adicionar mais NPCs
Em `js/game.js`, função `spawnNPCs()`:
```javascript
const npcPositions = [
    // ... posições existentes ...
    { x: 100, z: 100, type: 'capybara' }  // Nova capivara
];
```

## 🐛 Troubleshooting

### "Jogo não carrega"
- Certifique-se de ter internet (Three.js é carregado via CDN)
- Tente atualizar o navegador (Ctrl+F5)
- Experimente outro navegador moderno (Chrome, Firefox, Edge)

### "Personagem não se move"
- Verifique se a janela do jogo está focada
- Tente pressionar as teclas WASD
- No mobile, teste o joystick virtual

### "Códigos não funcionam"
- Pressione "C" para focar no chat
- Digite o código exato (ex: `65395`)
- Pressione Enter ou clique no botão Enviar

### "Performance lenta"
- Feche outras abas/programas
- Reduza a resolução da janela
- Tente outro navegador
- Desabilite extensões de navegador

## 🎓 Modo Debug

Abra o console do navegador (F12) e use:

```javascript
// Teleportar
GameDebug.teleport(0, 2, 0)

// Dar item
GameDebug.giveItem("hd_voador")

// Transformar
GameDebug.transform("nube")

// Ativar vôo
GameDebug.fly(true)

// Info do jogador
GameDebug.playerInfo()

// Mensagem no chat
GameDebug.message("Olá mundo!")
```

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Versão mínima: HTML5 com WebGL
- Conexão com internet (para carregar Three.js via CDN)
- 50MB de RAM livre

## 🎯 Roadmap Futuro

- [ ] Multiplayer online
- [ ] Sistema de combate
- [ ] Mais transformações
- [ ] Quests/Missões
- [ ] Loja de itens
- [ ] Sons e música
- [ ] Efeitos especiais
- [ ] Mais NPCs com IA aprimorada

## 📝 Créditos

Desenvolvido com 💜 para exploração e diversão!

**Recursos:**
- Three.js - Biblioteca 3D WebGL
- Inspiração: Roblox, Minecraft, Platforms tipo Jailbreak

## 📄 Licença

Código aberto para uso pessoal e educacional.

---

**Divirta-se na Ilha de Capibara!** 🐹🏝️✨

Para dúvidas ou sugestões, abra o console (F12) e use a ferramenta de debug disponível em `GameDebug`.

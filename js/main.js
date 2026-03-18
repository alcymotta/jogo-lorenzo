/**
 * main.js - Arquivo Principal
 * Inicializa o jogo quando tudo está carregado
 * Gerencia eventos globais e loop principal integrado
 */

// Variáveis globais
let gameEngine = null;
let isGameRunning = false;

/**
 * Inicializar jogo quando DOM está pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Iniciando Ilha de Capibara...');
    
    // Criar engine do jogo
    gameEngine = new GameEngine();
    isGameRunning = true;
    
    // Setup inicial
    setupGameUI();
    setupGameEvents();
    
    console.log('✅ Jogo pronto para jogar!');
});

/**
 * Configurar UI do jogo
 */
function setupGameUI() {
    // Mostrar controles baseado no dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Dispositivo mobile detectado');
        // Controles mobile já iniciados em game.js
    } else {
        console.log('🖥️ Dispositivo desktop detectado');
    }
    
    // Focar input de nome
    setTimeout(() => {
        document.getElementById('playerNameInput').focus();
    }, 100);
}

/**
 * Configurar eventos globais
 */
function setupGameEvents() {
    // Parar jogo quando aba perde foco
    window.addEventListener('blur', () => {
        if (gameEngine) {
            gameEngine.controls.stop();
        }
    });
    
    // Lidar com visibilidade da página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameEngine) {
            // Pausar jogo
            console.log('⏸️ Jogo pausado');
        } else if (gameEngine) {
            // Retomar jogo
            console.log('▶️ Jogo retomado');
        }
    });
    
    // Prevenir saída acidental
    window.addEventListener('beforeunload', (event) => {
        // Apenas avisar se estiver efetivamente jogando
        if (isGameRunning && gameEngine.player.playerName !== 'Capibara Exploradora') {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    
    // Teclas globais
    document.addEventListener('keydown', (e) => {
        // F11 ou F12 para fullscreen
        if (e.key === 'F11' || e.key === 'F12') {
            e.preventDefault();
        }
        
        // ESC para sair de inputs
        if (e.key === 'Escape') {
            document.getElementById('codeInput').blur();
        }
    });
}

/**
 * Parar jogo
 */
function stopGame() {
    if (gameEngine) {
        gameEngine.stop();
        isGameRunning = false;
        console.log('🛑 Jogo parado');
    }
}

/**
 * Reiniciar jogo
 */
function restartGame() {
    if (gameEngine) {
        gameEngine.stop();
    }
    location.reload();
}

/**
 * Toggle fullscreen
 */
function toggleFullScreen() {
    const canvas = document.getElementById('gameCanvas');
    
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            console.warn('Não foi possível ativar fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Assistência ao jogador
 */
function showHelp() {
    const helpText = `
🎮 CONTROLES BÁSICOS:
━━━━━━━━━━━━━━━━━━━━━

📱 MOVIMENTO:
• PC: WASD para mover
• PC: ESPAÇO para pular
• Mobile: Joystick + Botão de pulo

🎨 TRANSFORMAÇÕES:
• 65395 → Nube
• 0762 → c00lkidd
• 77 → Capivara
• 888 → Guarda

✈️ PODERES:
• ;fly → Ativar vôo
• 456 → Voador (HD/Tapete)
• 21120 → Martelo (dono)

😀 EMOTES:
• Botão de emote para rir
• Botão Mortal para pirueta

💬 CHAT:
• C para focar no chat
• Entre com códigos para ativar

━━━━━━━━━━━━━━━━━━━━━
Divirta-se na Ilha de Capibara!
    `;
    
    alert(helpText);
}

/**
 * Função para debug (access via console)
 */
window.GameDebug = {
    /**
     * Teleportar jogador
     */
    teleport: (x, y, z) => {
        if (gameEngine && gameEngine.player) {
            gameEngine.player.position = { x, y, z };
            console.log(`📍 Teleportado para: ${x}, ${y}, ${z}`);
        }
    },
    
    /**
     * Dar item ao jogador
     */
    giveItem: (itemName) => {
        if (gameEngine && gameEngine.player) {
            gameEngine.player.addToInventory(itemName);
        }
    },
    
    /**
     * Transformar jogador
     */
    transform: (type) => {
        if (gameEngine && gameEngine.player) {
            gameEngine.player.transform(type);
        }
    },
    
    /**
     * Ativar vôo
     */
    fly: (state) => {
        if (gameEngine) {
            gameEngine.toggleFly(state ?? true);
        }
    },
    
    /**
     * Mostrar info do jogador
     */
    playerInfo: () => {
        if (gameEngine && gameEngine.player) {
            const p = gameEngine.player;
            console.log({
                nome: p.playerName,
                posição: p.position,
                transformação: p.currentTransform,
                vida: p.health,
                voando: p.isFlying,
                inventário: p.inventory
            });
        }
    },
    
    /**
     * Adicionar mensagem ao chat
     */
    message: (text) => {
        if (gameEngine && gameEngine.chatSystem) {
            gameEngine.chatSystem.addMessage(text, 'system');
        }
    }
};

console.log('💡 Dicas de Debug:');
console.log('GameDebug.teleport(x, y, z) - Teleportar');
console.log('GameDebug.giveItem("item") - Dar item');
console.log('GameDebug.transform("type") - Transformar');
console.log('GameDebug.fly(true/false) - Voar');
console.log('GameDebug.playerInfo() - Info do jogador');
console.log('GameDebug.message("text") - Mensagem chat');

// Exportar para console
window.gameEngine = gameEngine;

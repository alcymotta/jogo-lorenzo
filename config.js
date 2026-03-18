/**
 * config.js (OPCIONAL) - Configurações Customizáveis
 * 
 * Este arquivo permite customizar facilmente aspectos do jogo
 * Você pode editar este arquivo para mudar cores, velocidades, etc
 * 
 * NOTA: Você pode deletar este arquivo se não quiser usar
 * O jogo funciona perfeitamente sem ele
 */

const GAME_CONFIG = {
    // ==================
    // CONSTANTES GLOBAIS
    // ==================
    
    // Identificação
    GAME_TITLE: "Ilha de Capibara 3D",
    GAME_OWNER: "Lorenzo",
    GAME_VERSION: "1.0.0",
    
    // ==================
    // CONFIGURAÇÕES DA CÂMERA
    // ==================
    CAMERA: {
        distance: 8,           // Distância da câmera do jogador
        height: 5,             // Altura da câmera
        fov: 75,               // Field of view (quanto mais alto, mais zoom-out)
        near: 0.1,             // Plano próximo
        far: 1000              // Plano longe
    },
    
    // ==================
    // CONFIGURAÇÕES DO JOGADOR
    // ==================
    PLAYER: {
        // Movimento
        moveSpeed: 0.15,       // Velocidade de movimento normal
        jumpForce: 0.35,       // Força do pulo
        gravity: -0.015,       // Gravidade
        
        // Vôo
        flySpeed: 0.2,         // Velocidade de vôo
        
        // Cores padrão (hexadecimal)
        headColor: 0xFFB347,   // Laranja
        bodyColor: 0xF4A460,   // Sandy
        legColor: 0xA0755F,    // Marrom
        tailColor: 0xA0755F    // Marrom
    },
    
    // ==================
    // CONFIGURAÇÕES DO MAPA
    // ==================
    MAP: {
        terrainColor: 0x00AA00,        // Verde (grama)
        waterColor: 0x1E90FF,          // Azul (água)
        maxDistance: 150,              // Limites do mapa
        
        // Iluminação
        ambientIntensity: 0.6,
        sunIntensity: 0.8,
        fogColor: 0x87CEEB,            // Azul céu
        fogNear: 200,
        fogFar: 500
    },
    
    // ==================
    // CÓDIGOS DO JOGO
    // ==================
    CODES: {
        '65395': { name: 'Nube', transform: 'nube' },
        '0762': { name: 'c00lkidd', transform: 'c00lkidd' },
        '77': { name: 'Capivara', transform: 'capybara' },
        '888': { name: 'Guarda', transform: 'guarda' },
        ';fly': { name: 'Vôo', action: 'fly' },
        '456': { name: 'Voador', action: 'voador' },
        '21120': { name: 'Martelo', action: 'hammer' }
    },
    
    // ==================
    // TRANSFORMAÇÕES E CORES
    // ==================
    TRANSFORMATIONS: {
        normal: {
            headColor: 0xFFB347,
            bodyColor: 0xF4A460,
            legColor: 0xA0755F,
            scale: { x: 1, y: 1, z: 1 }
        },
        nube: {
            headColor: 0xFFFFFF,
            bodyColor: 0xFFFFFF,
            legColor: 0xF0F0F0,
            scale: { x: 1.2, y: 1.2, z: 1.2 }
        },
        c00lkidd: {
            headColor: 0xFF1493,
            bodyColor: 0xFF1493,
            legColor: 0xFF1493,
            scale: { x: 0.9, y: 1.1, z: 0.9 }
        },
        capybara: {
            headColor: 0x8B4513,
            bodyColor: 0x8B4513,
            legColor: 0x8B4513,
            scale: { x: 1.5, y: 0.8, z: 1.5 }
        },
        guarda: {
            headColor: 0x1E90FF,
            bodyColor: 0x000080,
            legColor: 0x000080,
            scale: { x: 1.1, y: 1.3, z: 1.1 }
        }
    },
    
    // ==================
    // CONFIGURAÇÕES DE NPC
    // ==================
    NPC: {
        spawnCount: 5,         // Número de capivaras
        moveSpeed: 0.02,       // Velocidade de movimento NPCs
        changeDirectionInterval: 200 // ms entre mudanças de direção
    },
    
    // ==================
    // CONFIGURAÇÕES DE UI
    // ==================
    UI: {
        chatMaxMessages: 15,   // Máximo de mensagens visíveis
        chatFontSize: 12,      // Tamanho da fonte do chat
        
        // Cores de texto
        normalColor: '#ffffff',
        systemColor: '#ffff00',
        codeColor: '#00ff00',
        errorColor: '#ff0000'
    },
    
    // ==================
    // DEBUG
    // ==================
    DEBUG: {
        enabled: true,         // Mostrar informações de debug
        showAxesHelper: false, // Mostrar eixos 3D (X, Y, Z)
        showGridHelper: false  // Mostrar grade
    }
};

// ==================
// USO NO CÓDIGO
// ==================
/*
Para usar estas configurações no código, basta referenciar:

Exemplo em game.js:
    this.gravity = GAME_CONFIG.PLAYER.gravity;
    this.scene.background = new THREE.Color(GAME_CONFIG.MAP.fogColor);

Exemplo em player.js:
    const headMaterial = new THREE.MeshPhongMaterial({
        color: GAME_CONFIG.PLAYER.headColor
    });

Se você quer customizar, edite os valores acima!
Para restaurar valores padrão, recarregue a página.
*/

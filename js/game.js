/**
 * game.js - Gerenciamento da Cena 3D e Loop de Atualização
 * Responsável por configurar Three.js, renderização e lógica principal
 */

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.controls = null;
        this.gameCamera = null;
        this.map = null;
        this.npcs = [];
        this.chatSystem = null;
        this.isRunning = false;
        
        // Configurações do jogo
        this.gravity = -0.015;
        this.gameOwner = 'Lorenzo'; // Dono do jogo para código especial
        this.init();
    }

    /**
     * Inicializa a cena 3D e todos os componentes
     */
    init() {
        // Configurar Three.js
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.setupPhysics();
        
        // Criar mapa
        this.map = new MapGenerator(this.scene);
        this.map.generate();
        
        // Criar jogador
        this.player = new Player(this.scene, { x: 0, y: 2, z: 0 });
        this.player.engine = this;
        
        // Configurar câmera em terceira pessoa
        this.gameCamera = new ThirdPersonCamera(this.camera, this.player);
        
        // Configurar controles
        this.controls = new ControlSystem(this.player);
        this.controls.engine = this;
        
        // Configurar chat e sistema de códigos
        this.chatSystem = new ChatSystem();
        this.chatSystem.engine = this;
        
        // Gerar NPCs
        this.spawnNPCs();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Iniciar loop principal
        this.isRunning = true;
        this.animate();
        
        console.log('🎮 Jogo inicializado com sucesso!');
    }

    /**
     * Configurar cena Three.js
     */
    setupScene() {
        this.scene = new THREE.Scene();
        
        // Azul céu como fundo
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Névoa
        this.scene.fog = new THREE.Fog(0x87CEEB, 200, 500);
        
        // Plano de renderização
        this.scene.add(new THREE.AxesHelper(10));
    }

    /**
     * Configurar renderizador
     */
    setupRenderer() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        
        // Responsivo
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Configurar câmera
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
    }

    /**
     * Configurar iluminação
     */
    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direcional (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);
        
        // Luz ambiente azul (reflexo do céu)
        const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x00aa00, 0.3);
        this.scene.add(skyLight);
    }

    /**
     * Configurar sistema de física básico
     */
    setupPhysics() {
        // Physics simples: gravidade
        this.physicsObjects = [];
    }

    /**
     * Gerar NPCs e capivaras no mapa
     */
    spawnNPCs() {
        const npcPositions = [
            { x: -30, z: 30, type: 'capybara' },
            { x: 30, z: -20, type: 'capybara' },
            { x: -50, z: 0, type: 'capybara' },
            { x: 40, z: 40, type: 'capybara' },
            { x: 0, z: 50, type: 'capybara' }
        ];
        
        npcPositions.forEach(pos => {
            const npc = new NPC(this.scene, {
                position: pos,
                type: pos.type
            });
            this.npcs.push(npc);
        });
    }

    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Teclas
        document.addEventListener('keydown', (e) => this.controls.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.controls.onKeyUp(e));
        
        // Chat
        document.getElementById('codeBtn').addEventListener('click', () => {
            this.chatSystem.sendCode();
        });
        
        document.getElementById('codeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.chatSystem.sendCode();
            }
        });
        
        // Botões
        document.getElementById('playerNameBtn').addEventListener('click', () => {
            this.setPlayerName();
        });
        
        document.getElementById('emoteBtn').addEventListener('click', () => {
            this.player.playEmote('laugh');
        });
        
        document.getElementById('mortisBtn').addEventListener('click', () => {
            this.player.playEmote('mortis');
        });
        
        // Mobile
        this.setupMobileControls();
    }

    /**
     * Configurar controles mobile
     */
    setupMobileControls() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mostrar controles mobile
            const mobileElements = document.querySelectorAll('.controls-mobile');
            mobileElements.forEach(el => el.style.display = 'block');
            
            const pcElements = document.querySelectorAll('.controls-pc');
            pcElements.forEach(el => el.style.display = 'none');
            
            document.getElementById('joystickContainer').style.display = 'flex';
            
            // Joystick
            this.setupJoystick();
            
            // Botão de pulo
            document.getElementById('jumpBtnMobile').addEventListener('click', () => {
                this.player.jump();
            });
        }
    }

    /**
     * Configurar joystick virtual
     */
    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const knob = document.getElementById('joystickKnob');
        let isPressed = false;
        let centerX, centerY;
        
        const updateJoystick = (clientX, clientY) => {
            const rect = joystick.getBoundingClientRect();
            centerX = rect.width / 2;
            centerY = rect.height / 2;
            
            const x = clientX - rect.left - centerX;
            const y = clientY - rect.top - centerY;
            
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = 40;
            
            let moveX = x;
            let moveY = y;
            
            if (distance > maxDistance) {
                moveX = (x / distance) * maxDistance;
                moveY = (y / distance) * maxDistance;
            }
            
            knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
            
            // Atualizar movimento
            const moveStrength = distance / maxDistance;
            const moveAngle = Math.atan2(x, y);
            
            this.controls.joystickInput = {
                x: Math.sin(moveAngle) * moveStrength,
                z: Math.cos(moveAngle) * moveStrength
            };
        };
        
        joystick.addEventListener('touchstart', (e) => {
            isPressed = true;
            updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            if (isPressed) {
                updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        
        joystick.addEventListener('touchend', () => {
            isPressed = false;
            knob.style.transform = 'translate(-50%, -50%)';
            this.controls.joystickInput = { x: 0, z: 0 };
        });
    }

    /**
     * Definir nome do jogador
     */
    setPlayerName() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();
        
        if (name.length > 0) {
            this.player.playerName = name;
            document.getElementById('playerName').textContent = name;
            document.getElementById('playerNameContainer').classList.add('hidden');
            this.chatSystem.addMessage(`${name} entrou no jogo!`, 'system');
        } else {
            alert('Digite um nome válido!');
        }
    }

    /**
     * Loop principal de animação
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isRunning) return;
        
        // Atualizar física
        this.updatePhysics();
        
        // Atualizar jogador
        this.player.update();
        
        // Atualizar câmera
        this.gameCamera.update();
        
        // Atualizar NPCs
        this.npcs.forEach(npc => npc.update());
        
        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Atualizar física simples
     */
    updatePhysics() {
        // Aplicar gravidade ao jogador
        if (!this.player.isFlying) {
            this.player.velocity.y += this.gravity;
        }
        
        // Limitar velocidade máxima
        const maxFallSpeed = 0.3;
        if (this.player.velocity.y < -maxFallSpeed) {
            this.player.velocity.y = -maxFallSpeed;
        }
        
        // Detectar colisão com o chão
        if (this.player.position.y <= 0.5) {
            this.player.position.y = 0.5;
            this.player.velocity.y = 0;
            this.player.isJumping = false;
        }
    }

    /**
     * Aplicar transformação ao jogador
     */
    applyTransformation(transformType) {
        this.player.transform(transformType);
    }

    /**
     * Ativar/desativar vôo
     */
    toggleFly(state) {
        this.player.toggleFly(state);
        document.getElementById('flyStatus').textContent = state ? 'ON' : 'OFF';
        document.getElementById('flyBtn').style.display = state ? 'block' : 'none';
    }

    /**
     * Dar item ao jogador
     */
    giveItem(itemType) {
        this.player.inventory.push(itemType);
        this.chatSystem.addMessage(`Você recebeu: ${itemType}`, 'system');
    }

    /**
     * Remover jogador (Martelo do Banimento)
     */
    banPlayer(playerName) {
        if (this.player.playerName === playerName) {
            this.chatSystem.addMessage('❌ Você foi banido do servidor!', 'error');
            this.player.health = 0;
        }
    }

    /**
     * Lidar com redimensionamento da janela
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Parar o jogo
     */
    stop() {
        this.isRunning = false;
    }
}

// GameEngine será inicializado por main.js

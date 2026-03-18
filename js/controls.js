/**
 * controls.js - Sistema de Controles (Teclado e Touch)
 * Gerencia entrada do usuário e movimentação
 */

class ControlSystem {
    constructor(player) {
        this.player = player;
        this.engine = null;
        
        // Estado das teclas
        this.keysPressed = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false,
            shift: false,
            c: false
        };
        
        // Joystick virtual (mobile)
        this.joystickInput = { x: 0, z: 0 };
        
        // Velocidades
        this.moveDirection = { x: 0, z: 0 };
        this.acceleration = 0.05;
        this.deceleration = 0.15;
        
        this.setupInputListeners();
    }

    /**
     * Configurar listeners de entrada
     */
    setupInputListeners() {
        // Teclado - Key Down
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Teclado - Key Up
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse - Scroll para zoom
        document.addEventListener('wheel', (event) => {
            if (this.engine && this.engine.gameCamera) {
                event.preventDefault();
                const direction = event.deltaY > 0 ? 0.5 : -0.5;
                this.engine.gameCamera.zoom(direction);
            }
        }, { passive: false });
        
        // Mouse - Movimento para rotação (apenas em fullscreen ou quando travado)
        document.addEventListener('mousemove', (event) => {
            if (this.engine && this.engine.gameCamera) {
                // Simples: câmera segue o mouse um pouco
                // Pode ser expandido para mouse lock later
            }
        });
    }

    /**
     * Handle tecla pressionada
     */
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case 'w':
                this.keysPressed.w = true;
                event.preventDefault();
                break;
            case 'a':
                this.keysPressed.a = true;
                event.preventDefault();
                break;
            case 's':
                this.keysPressed.s = true;
                event.preventDefault();
                break;
            case 'd':
                this.keysPressed.d = true;
                event.preventDefault();
                break;
            case ' ':
                event.preventDefault();
                this.player.jump();
                break;
            case 'shift':
                this.keysPressed.shift = true;
                break;
            case 'c':
                // Focar no chat
                event.preventDefault();
                document.getElementById('codeInput').focus();
                break;
            case ';':
                // Código rápido para vôo (debug)
                if (this.engine && this.engine.chatSystem) {
                    this.engine.chatSystem.processCode(';fly');
                }
                break;
        }
        
        // Atualizar movimento
        this.updateMovement();
    }

    /**
     * Handle tecla solta
     */
    onKeyUp(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case 'w':
                this.keysPressed.w = false;
                break;
            case 'a':
                this.keysPressed.a = false;
                break;
            case 's':
                this.keysPressed.s = false;
                break;
            case 'd':
                this.keysPressed.d = false;
                break;
            case 'shift':
                this.keysPressed.shift = false;
                break;
        }
        
        this.updateMovement();
    }

    /**
     * Atualizar direção de movimento
     */
    updateMovement() {
        const moveInput = { x: 0, z: 0 };
        
        // Input do teclado
        if (this.keysPressed.w) moveInput.z -= 1; // Para frente
        if (this.keysPressed.s) moveInput.z += 1; // Para trás
        if (this.keysPressed.a) moveInput.x -= 1; // Para esquerda
        if (this.keysPressed.d) moveInput.x += 1; // Para direita
        
        // Input do joystick (mobile)
        if (this.joystickInput.x !== 0 || this.joystickInput.z !== 0) {
            moveInput.x += this.joystickInput.x;
            moveInput.z += this.joystickInput.z;
        }
        
        // Normalizar entrada
        const length = Math.sqrt(moveInput.x * moveInput.x + moveInput.z * moveInput.z);
        if (length > 0) {
            moveInput.x /= length;
            moveInput.z /= length;
        }
        
        // Aplicar movimento ao jogador
        if (this.player.isFlying) {
            // Vôo permite movimento livre em 3D
            const flyDirection = { x: moveInput.x, y: 0, z: moveInput.z };
            
            // Teclas para cima/baixo ao voar
            if (this.keysPressed.space) flyDirection.y = 1;
            if (this.keysPressed.shift) flyDirection.y = -1;
            
            this.player.flyInDirection(flyDirection);
        } else {
            // Movimento normal
            this.player.move(moveInput);
        }
    }

    /**
     * Parar todo movimento
     */
    stop() {
        this.keysPressed = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false,
            shift: false,
            c: false
        };
        this.joystickInput = { x: 0, z: 0 };
        this.player.stopMovement();
    }
}

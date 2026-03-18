/**
 * controls.js - Sistema de Controles
 *
 * ARQUITETURA:
 *   W/S  → move para frente/trás no eixo que o CORPO do player aponta
 *   A/D  → gira o CORPO do player (sem depender da câmera)
 *   Câmera segue o corpo com lerp suave — ZERO dependência circular.
 */

class ControlSystem {
    constructor(player) {
        this.player = player;
        this.engine = null;

        this.keysPressed = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false
        };

        this.joystickInput = { x: 0, z: 0 };

        // Velocidade de giro do corpo (radianos por frame a 60fps)
        this.turnSpeed = 0.045;

        this.setupInputListeners();
    }

    _chatFocused() {
        const el = document.activeElement;
        return el && (el.id === 'codeInput' || el.id === 'playerNameInput');
    }

    setupInputListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup',   (e) => this.onKeyUp(e));

        document.addEventListener('wheel', (e) => {
            if (this.engine && this.engine.gameCamera) {
                e.preventDefault();
                this.engine.gameCamera.zoom(e.deltaY > 0 ? 0.5 : -0.5);
            }
        }, { passive: false });
    }

    onKeyDown(event) {
        if (this._chatFocused()) {
            if (event.key === 'Escape') document.activeElement.blur();
            return;
        }
        const key = event.key.toLowerCase();
        switch (key) {
            case 'w': this.keysPressed.w = true; event.preventDefault(); break;
            case 'a': this.keysPressed.a = true; event.preventDefault(); break;
            case 's': this.keysPressed.s = true; event.preventDefault(); break;
            case 'd': this.keysPressed.d = true; event.preventDefault(); break;
            case ' ': event.preventDefault(); this.player.jump(); break;
            case 'shift': this.keysPressed.shift = true; break;
            case 'c': event.preventDefault(); document.getElementById('codeInput').focus(); break;
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        switch (key) {
            case 'w': this.keysPressed.w = false; break;
            case 'a': this.keysPressed.a = false; break;
            case 's': this.keysPressed.s = false; break;
            case 'd': this.keysPressed.d = false; break;
            case 'shift': this.keysPressed.shift = false; break;
        }
    }

    /**
     * Chamado a cada frame. Gira o corpo com A/D e move com W/S.
     * Não lê nem escreve o ângulo da câmera.
     */
    update() {
        if (this._chatFocused()) {
            this.player.stopMovement();
            return;
        }

        // 1. A/D giram o corpo do player diretamente
        if (this.keysPressed.a) this.player.rotation.y += this.turnSpeed;
        if (this.keysPressed.d) this.player.rotation.y -= this.turnSpeed;
        this.player.bodyGroup.rotation.y = this.player.rotation.y;

        // 2. W/S movem no eixo do corpo (forward = onde o nariz aponta)
        let forwardInput = 0;
        if (this.keysPressed.w) forwardInput += 1;
        if (this.keysPressed.s) forwardInput -= 1;

        // Joystick mobile: iz equivale ao W/S, ix ao A/D
        forwardInput  += -this.joystickInput.z;
        const joyTurn  =  this.joystickInput.x;
        if (joyTurn !== 0) {
            this.player.rotation.y -= joyTurn * this.turnSpeed;
            this.player.bodyGroup.rotation.y = this.player.rotation.y;
        }

        const isRunning = this.keysPressed.shift;

        if (Math.abs(forwardInput) > 0.01) {
            // Vetor forward a partir da rotação atual do corpo
            const ry = this.player.rotation.y;
            const dir = {
                  x: Math.sin(ry) * forwardInput,
                  z: Math.cos(ry) * forwardInput
            };
            if (this.player.isFlying) {
                this.player.flyInDirection({ x: dir.x, y: 0, z: dir.z });
            } else {
                this.player.move(dir, isRunning);
            }
        } else {
            this.player.stopMovement();
        }
    }

    stop() {
        this.keysPressed = { w: false, a: false, s: false, d: false, shift: false };
        this.joystickInput = { x: 0, z: 0 };
        this.player.stopMovement();
    }
}

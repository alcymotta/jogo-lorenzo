/**
 * controls.js - Sistema de Controles (Teclado e Touch)
 * Movimento relativo à câmera, suporte a correr, chat guard e joystick mobile.
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
            space: false,
            shift: false
        };

        this.joystickInput = { x: 0, z: 0 };

        this.setupInputListeners();
    }

    /** Verifica se o chat está em foco (bloquear WASD) */
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
        // Quando chat está focado só capturar Escape
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
            case ' ':
                event.preventDefault();
                this.player.jump();
                break;
            case 'shift': this.keysPressed.shift = true; break;
            case 'c':
                event.preventDefault();
                document.getElementById('codeInput').focus();
                break;
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
     * Chamado a cada frame pelo game loop.
     * Calcula input, rotaciona pelo ângulo da câmera e envia ao player.
     */
    update() {
        if (this._chatFocused()) {
            this.player.stopMovement();
            return;
        }

        // --- Ler input bruto ---
        let ix = 0, iz = 0;
        if (this.keysPressed.w) iz -= 1;
        if (this.keysPressed.s) iz += 1;
        if (this.keysPressed.a) ix -= 1;
        if (this.keysPressed.d) ix += 1;

        // Joystick mobile
        ix += this.joystickInput.x;
        iz += this.joystickInput.z;

        // Normalizar diagonal
        const len = Math.sqrt(ix * ix + iz * iz);
        if (len > 1) { ix /= len; iz /= len; }

        // --- Rotacionar pelo ângulo da câmera ---
        const camAngle = this.engine ? this.engine.gameCamera.angle : 0;
        const sin = Math.sin(camAngle);
        const cos = Math.cos(camAngle);
        const wx = ix * cos + iz * sin;
        const wz = -ix * sin + iz * cos;

        const isRunning = this.keysPressed.shift;

        if (this.player.isFlying) {
            const flyDir = { x: wx, y: 0, z: wz };
            if (this.keysPressed.space) flyDir.y = 1;
            if (this.keysPressed.shift) flyDir.y = -1;
            this.player.flyInDirection(flyDir);
        } else {
            this.player.move({ x: wx, z: wz }, isRunning);
        }
    }

    stop() {
        this.keysPressed = { w: false, a: false, s: false, d: false, space: false, shift: false };
        this.joystickInput = { x: 0, z: 0 };
        this.player.stopMovement();
    }
}

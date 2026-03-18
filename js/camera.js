/**
 * camera.js - Câmera em Terceira Pessoa
 *
 * ARQUITETURA:
 *   Câmera fica ATRÁS do corpo do player (player.rotation.y + PI).
 *   Segue com lerp suave — sem ler velocidade, sem dependência circular.
 */

class ThirdPersonCamera {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;

        this.distance = 8;
        this.height   = 5;
        // Inicializa o ângulo da câmera atrás do player
        this.angle    = player.rotation.y + Math.PI;

        this.targetDistance = this.distance;
        this.targetHeight   = this.height;

        // Suavização — quanto menor, mais lento/suave o giro
        this.angleSmoothing = 0.08;
        this.posSmoothing   = 0.14;

        this.minDistance = 3;
        this.maxDistance = 18;
        this.minHeight   = 1.5;
        this.maxHeight   = 12;
    }

    update() {
        const p = this.player;

        // Ângulo alvo = atrás do corpo do player
        const targetAngle = p.rotation.y + Math.PI;

        // Lerp pelo caminho angular mais curto (evita giro em 360°)
        let diff = targetAngle - this.angle;
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        this.angle += diff * this.angleSmoothing;

        // Lerp de distância e altura
        this.distance += (this.targetDistance - this.distance) * this.posSmoothing;
        this.height   += (this.targetHeight   - this.height)   * this.posSmoothing;

        // Posição da câmera
        const cx = p.position.x + Math.sin(this.angle) * this.distance;
        const cz = p.position.z + Math.cos(this.angle) * this.distance;
        const cy = Math.max(p.position.y + this.height, p.position.y + 1.5);

        this.camera.position.set(cx, cy, cz);
        this.camera.lookAt(p.position.x, p.position.y + 0.8, p.position.z);
    }

    zoom(direction) {
        this.targetDistance = Math.max(this.minDistance,
            Math.min(this.maxDistance, this.targetDistance + direction));
    }

    reset() {
        this.targetDistance = 8;
        this.targetHeight   = 5;
    }
}

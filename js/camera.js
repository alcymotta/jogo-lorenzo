/**
 * camera.js - Câmera em Terceira Pessoa
 * Câmera fixa atrás do personagem, segue direção de movimento automaticamente.
 */

class ThirdPersonCamera {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;

        this.distance = 8;
        this.height = 5;
        this.angle = 0;          // ângulo atual (yaw) — em radianos
        this._lastMoveAngle = 0; // último ângulo em que o player se movia

        this.targetDistance = this.distance;
        this.targetHeight = this.height;

        // Suavização
        this.posSmoothing   = 0.12;  // quão rápido câmera segue posição
        this.angleSmoothing = 0.06;  // quão suave gira atrás do player

        // Limites de zoom
        this.minDistance = 3;
        this.maxDistance = 18;
        this.minHeight   = 1.5;
        this.maxHeight   = 12;
    }

    update() {
        const p = this.player;

        // Detectar se player está se movendo
        const hSpeed = Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.z * p.velocity.z);
        if (hSpeed > 0.01) {
            // Câmera vai para atrás da direção de movimento
            this._lastMoveAngle = Math.atan2(p.velocity.x, p.velocity.z);
        }

        // Lerp suave do ângulo
        let angleDiff = this._lastMoveAngle - this.angle;
        // Garantir caminho mais curto (wrap em -PI..PI)
        while (angleDiff >  Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        this.angle += angleDiff * this.angleSmoothing;

        // Lerp de distância e altura
        this.distance += (this.targetDistance - this.distance) * this.posSmoothing;
        this.height   += (this.targetHeight   - this.height)   * this.posSmoothing;

        // Calcular posição da câmera
        const tx = p.position.x + Math.sin(this.angle) * this.distance;
        const tz = p.position.z + Math.cos(this.angle) * this.distance;

        // Clamp de altura — câmera nunca desce abaixo de playerY + 1.5
        const minCamY = p.position.y + 1.5;
        const ty = Math.max(p.position.y + this.height, minCamY);

        this.camera.position.set(tx, ty, tz);
        this.camera.lookAt(p.position.x, p.position.y + 0.8, p.position.z);
    }

    zoom(direction) {
        this.targetDistance = Math.max(this.minDistance,
            Math.min(this.maxDistance, this.targetDistance + direction));
    }

    elevate(direction) {
        this.targetHeight = Math.max(this.minHeight,
            Math.min(this.maxHeight, this.targetHeight + direction));
    }

    reset() {
        this.targetDistance = 8;
        this.targetHeight   = 5;
    }
}

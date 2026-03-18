/**
 * camera.js - Câmera em Terceira Pessoa
 * Segue o jogador mantendo uma distância e ângulo agradáveis
 */

class ThirdPersonCamera {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        
        // Parâmetros da câmera
        this.distance = 8; // Distância da câmera do jogador
        this.height = 5; // Altura acima do jogador
        this.angle = 0; // Ângulo horizontal em torno do jogador
        this.targetAngle = 0;
        
        // Suavização
        this.smoothing = 0.1;
        this.targetDistance = this.distance;
        this.targetHeight = this.height;
        
        // Limites
        this.minDistance = 3;
        this.maxDistance = 15;
        this.minHeight = 2;
        this.maxHeight = 10;
        
        // Rotação com mouse (desktop)
        this.isLocked = false;
    }

    /**
     * Atualizar posição da câmera
     */
    update() {
        // Calcular posição alvo da câmera
        const playerPos = this.player.position;
        
        // Aplicar suavização à distância e altura
        this.distance += (this.targetDistance - this.distance) * this.smoothing;
        this.height += (this.targetHeight - this.height) * this.smoothing;
        
        // Calcular nova posição da câmera
        const cameraDistance = this.distance;
        const cameraHeight = this.height;
        
        // Câmera sempre atrás do jogador
        this.targetAngle = this.player.rotation.y;
        this.angle += (this.targetAngle - this.angle) * this.smoothing;
        
        // Posição circular ao redor do jogador
        const cameraX = playerPos.x + Math.sin(this.angle) * cameraDistance;
        const cameraY = playerPos.y + cameraHeight;
        const cameraZ = playerPos.z + Math.cos(this.angle) * cameraDistance;
        
        // Atualizar câmera
        this.camera.position.set(cameraX, cameraY, cameraZ);
        
        // Olhar para o jogador (levemente acima da cabeça)
        const lookAtY = playerPos.y + 0.5;
        this.camera.lookAt(playerPos.x, lookAtY, playerPos.z);
    }

    /**
     * Zoom in/out com scroll
     */
    zoom(direction) {
        this.targetDistance += direction;
        this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    }

    /**
     * Rotacionar câmera com mouse
     */
    rotateWithMouse(deltaX) {
        this.targetAngle += deltaX * 0.005;
    }

    /**
     * Elevar câmera
     */
    elevate(direction) {
        this.targetHeight += direction;
        this.targetHeight = Math.max(this.minHeight, Math.min(this.maxHeight, this.targetHeight));
    }

    /**
     * Reset câmera para posição padrão
     */
    reset() {
        this.targetDistance = this.distance;
        this.targetHeight = this.height;
        this.targetAngle = 0;
    }
}

/**
 * world.js - Camada de mundo/ambiente
 * Organiza geracao de mapa, atmosfera e atualizacoes visuais.
 */

class WorldSystem {
    constructor(engine) {
        this.engine = engine;
        this.map = null;
        this.qualityProfile = this.detectQualityProfile();
    }

    detectQualityProfile() {
        const ua = navigator.userAgent || '';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        return isMobile ? 'mobile' : 'desktop';
    }

    build() {
        this.applyAtmosphere();
        this.map = new MapGenerator(this.engine.scene, {
            quality: this.qualityProfile,
            renderer: this.engine.renderer
        });
        this.map.generate();
    }

    applyAtmosphere() {
        this.engine.scene.background = new THREE.Color(0x8FD3FF);
        this.engine.scene.fog = new THREE.Fog(0x99CBEE, 140, 520);
    }

    update(delta) {
        if (this.map && this.map.update) {
            const playerPos = this.engine.player ? this.engine.player.position : null;
            this.map.update(delta, playerPos);
        }
    }
}

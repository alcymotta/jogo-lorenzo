/**
 * ui.js - HUD extendida (mini mapa, emotes, skins, status de rede)
 */

class UISystem {
    constructor(engine) {
        this.engine = engine;
        this.miniMapCanvas = null;
        this.miniMapCtx = null;
        this.onlineCountEl = null;
        this.netStatusEl = null;
        this.skinSelectEl = null;
        this.lastMiniMapUpdate = 0;
    }

    init() {
        this.miniMapCanvas = document.getElementById('miniMapCanvas');
        if (this.miniMapCanvas) this.miniMapCtx = this.miniMapCanvas.getContext('2d');

        this.onlineCountEl = document.getElementById('onlineCount');
        this.netStatusEl = document.getElementById('netStatus');
        this.skinSelectEl = document.getElementById('skinSelect');

        this.setupSkinSelector();
        this.setupEmoteBar();
        this.setOnlineCount(1);
        this.setNetworkStatus('OFFLINE');
    }

    setupSkinSelector() {
        if (!this.skinSelectEl) return;
        this.skinSelectEl.addEventListener('change', (e) => {
            const skinId = e.target.value;
            this.engine.player.transform(skinId);
            if (this.engine.networkSystem) this.engine.networkSystem.sendTransform(skinId);
        });

        if (!this.engine.skinSystem) return;
        this.skinSelectEl.innerHTML = '';
        this.engine.skinSystem.getAllSkins().forEach((skin) => {
            const opt = document.createElement('option');
            opt.value = skin.id;
            opt.textContent = skin.name;
            this.skinSelectEl.appendChild(opt);
        });
    }

    setSelectedSkin(skinId) {
        if (!this.skinSelectEl) return;
        this.skinSelectEl.value = skinId;
    }

    setupEmoteBar() {
        const bind = (id, emote) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('click', () => this.engine.player.playEmote(emote));
        };

        bind('emoteLaughBtn', 'laugh');
        bind('emoteDanceBtn', 'dance');
        bind('emoteWaveBtn', 'wave');
        bind('emoteSitBtn', 'sit');
        bind('emoteMortisBtn', 'mortis');
    }

    setOnlineCount(value) {
        if (this.onlineCountEl) this.onlineCountEl.textContent = String(value);
    }

    setNetworkStatus(status) {
        if (!this.netStatusEl) return;
        this.netStatusEl.textContent = status;
        this.netStatusEl.dataset.state = status;
    }

    update(delta) {
        this.lastMiniMapUpdate += delta;
        if (this.lastMiniMapUpdate < 0.1) return;
        this.lastMiniMapUpdate = 0;
        this.drawMiniMap();
    }

    drawMiniMap() {
        if (!this.miniMapCtx || !this.engine.player) return;

        const ctx = this.miniMapCtx;
        const w = this.miniMapCanvas.width;
        const h = this.miniMapCanvas.height;
        const center = { x: w / 2, y: h / 2 };
        const mapRadiusWorld = (this.engine.map && this.engine.map.worldRadius) || 170;
        const mapRadiusCanvas = Math.min(w, h) * 0.45;
        const toMini = (wx, wz) => ({
            x: center.x + (wx / mapRadiusWorld) * mapRadiusCanvas,
            y: center.y + (wz / mapRadiusWorld) * mapRadiusCanvas
        });

        ctx.clearRect(0, 0, w, h);

        // base
        ctx.fillStyle = 'rgba(12, 22, 36, 0.65)';
        ctx.beginPath();
        ctx.arc(center.x, center.y, mapRadiusCanvas + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(40, 140, 80, 0.55)';
        ctx.beginPath();
        ctx.arc(center.x, center.y, mapRadiusCanvas, 0, Math.PI * 2);
        ctx.fill();

        // lake marker
        if (this.engine.map && this.engine.map.lakeCenter) {
            const lake = toMini(this.engine.map.lakeCenter.x, this.engine.map.lakeCenter.z);
            const lakeR = (this.engine.map.lakeRadius / mapRadiusWorld) * mapRadiusCanvas;
            ctx.fillStyle = 'rgba(54, 180, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(lake.x, lake.y, lakeR, 0, Math.PI * 2);
            ctx.fill();
        }

        // local player
        const p = this.engine.player.position;
        const me = toMini(p.x, p.z);
        ctx.fillStyle = '#ffd966';
        ctx.beginPath();
        ctx.arc(me.x, me.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // view direction arrow
        const dirLen = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(me.x, me.y);
        ctx.lineTo(
            me.x + Math.sin(this.engine.player.rotation.y) * dirLen,
            me.y + Math.cos(this.engine.player.rotation.y) * dirLen
        );
        ctx.stroke();

        // remote players
        if (this.engine.networkSystem) {
            this.engine.networkSystem.remotePlayers.forEach((remote) => {
                const dot = toMini(remote.position.x, remote.position.z);
                ctx.fillStyle = '#76d7ff';
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 3.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
}

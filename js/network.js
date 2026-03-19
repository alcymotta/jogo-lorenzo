/**
 * network.js - Multiplayer opcional via WebSocket
 * Funciona com fallback offline quando servidor nao esta disponivel.
 */

class RemotePlayerAvatar {
    constructor(scene, id, name) {
        this.scene = scene;
        this.id = id;
        this.name = name || 'Jogador';
        this.position = { x: 0, y: 0.5, z: 0 };
        this.rotationY = 0;
        this.targetPosition = { x: 0, y: 0.5, z: 0 };
        this.targetRotationY = 0;

        this.group = new THREE.Group();
        this.group.position.set(0, 0.5, 0);
        scene.add(this.group);

        const matSkin = new THREE.MeshPhongMaterial({ color: 0xFFD0A0, flatShading: true });
        const matBody = new THREE.MeshPhongMaterial({ color: 0x5A8DEE, flatShading: true });

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.44), matSkin);
        head.position.y = 0.7;
        head.castShadow = true;
        this.group.add(head);

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.82, 0.38), matBody);
        body.position.y = 0.08;
        body.castShadow = true;
        this.group.add(body);

        const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 8), matBody);
        leftLeg.position.set(-0.18, -0.7, 0);
        leftLeg.castShadow = true;
        this.group.add(leftLeg);

        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.18;
        this.group.add(rightLeg);

        this.nameSprite = this.createNameSprite(this.name);
        this.nameSprite.position.set(0, 1.45, 0);
        this.group.add(this.nameSprite);
    }

    createNameSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.8, 0.7, 1);
        return sprite;
    }

    applyTransform(skinId) {
        let bodyColor = 0x5A8DEE;
        if (skinId === 'capybara') bodyColor = 0x8B5E34;
        if (skinId === 'nube') bodyColor = 0xFFFFFF;
        if (skinId === 'guarda') bodyColor = 0x1E3D8F;
        if (skinId === 'c00lkidd') bodyColor = 0xFF1493;

        let meshIndex = 0;
        this.group.traverse((child) => {
            if (child.isMesh && child.material) {
                // Mantem a cabeca no primeiro mesh e tinge o restante com a skin remota.
                if (meshIndex > 0) child.material.color.setHex(bodyColor);
                meshIndex++;
            }
        });
    }

    setTargetState(data) {
        if (typeof data.x === 'number') this.targetPosition.x = data.x;
        if (typeof data.y === 'number') this.targetPosition.y = data.y;
        if (typeof data.z === 'number') this.targetPosition.z = data.z;
        if (typeof data.ry === 'number') this.targetRotationY = data.ry;
    }

    update(delta) {
        const lerp = Math.min(1, delta * 8);
        this.position.x += (this.targetPosition.x - this.position.x) * lerp;
        this.position.y += (this.targetPosition.y - this.position.y) * lerp;
        this.position.z += (this.targetPosition.z - this.position.z) * lerp;
        this.rotationY += (this.targetRotationY - this.rotationY) * lerp;

        this.group.position.set(this.position.x, this.position.y, this.position.z);
        this.group.rotation.y = this.rotationY;
    }

    destroy() {
        this.scene.remove(this.group);
    }
}

class NetworkSystem {
    constructor(engine) {
        this.engine = engine;
        this.ws = null;
        this.connected = false;
        this.playerId = null;
        this.roomId = 'ilha-main';
        this.remotePlayers = new Map();
        this.lastStateSend = 0;
        this.stateSendInterval = 0.066; // ~15Hz
        this.maxPlayers = 20;
    }

    getDefaultServerUrl() {
        const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (isLocal) return 'ws://localhost:2567';

        // Para GitHub Pages, usuario pode apontar para servidor externo
        return localStorage.getItem('capybara_ws_url') || '';
    }

    connect(playerName) {
        if (this.connected || this.ws) return;

        const wsUrl = this.getDefaultServerUrl();
        if (!wsUrl) {
            this.engine.uiSystem?.setNetworkStatus('OFFLINE');
            return;
        }

        this.engine.uiSystem?.setNetworkStatus('CONNECTING');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.connected = true;
            this.engine.uiSystem?.setNetworkStatus('ONLINE');
            this.send({
                type: 'join',
                roomId: this.roomId,
                name: playerName,
                skin: this.engine.player.currentTransform,
                x: this.engine.player.position.x,
                y: this.engine.player.position.y,
                z: this.engine.player.position.z,
                ry: this.engine.player.rotation.y
            });
        };

        this.ws.onmessage = (ev) => this.handleMessage(ev.data);

        this.ws.onclose = () => {
            this.connected = false;
            this.ws = null;
            this.playerId = null;
            this.clearRemotePlayers();
            this.engine.uiSystem?.setNetworkStatus('OFFLINE');
            this.engine.uiSystem?.setOnlineCount(1);
        };

        this.ws.onerror = () => {
            this.engine.uiSystem?.setNetworkStatus('OFFLINE');
        };
    }

    disconnect() {
        if (this.ws) this.ws.close();
    }

    send(data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(data));
    }

    sendChat(text) {
        if (!this.connected) return;
        this.send({ type: 'chat', text });
    }

    sendTransform(skinId) {
        if (!this.connected) return;
        this.send({ type: 'transform', skin: skinId });
    }

    update(delta) {
        this.remotePlayers.forEach((remote) => remote.update(delta));

        if (!this.connected || !this.playerId) return;
        this.lastStateSend += delta;
        if (this.lastStateSend < this.stateSendInterval) return;
        this.lastStateSend = 0;

        const p = this.engine.player;
        this.send({
            type: 'state',
            x: p.position.x,
            y: p.position.y,
            z: p.position.z,
            ry: p.rotation.y,
            skin: p.currentTransform
        });
    }

    handleMessage(raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch (err) {
            return;
        }

        switch (msg.type) {
            case 'welcome':
                this.playerId = msg.playerId;
                break;
            case 'snapshot':
                this.applySnapshot(msg.players || []);
                break;
            case 'player_join':
                this.addRemotePlayer(msg.player);
                this.engine.chatSystem?.addMessage('Entrou: ' + msg.player.name, 'system');
                break;
            case 'player_leave':
                this.removeRemotePlayer(msg.playerId);
                this.engine.chatSystem?.addMessage('Saiu: ' + (msg.name || 'Jogador'), 'system');
                break;
            case 'player_state':
                this.applyRemoteState(msg.playerId, msg);
                break;
            case 'player_transform':
                this.applyRemoteTransform(msg.playerId, msg.skin);
                break;
            case 'chat':
                if (msg.name && msg.text) {
                    this.engine.chatSystem?.addMessage(msg.name + ': ' + msg.text, 'normal');
                }
                break;
            case 'room_full':
                this.engine.chatSystem?.addMessage('Sala cheia (max 20).', 'error');
                this.disconnect();
                break;
            default:
                break;
        }

        this.engine.uiSystem?.setOnlineCount(1 + this.remotePlayers.size);
    }

    applySnapshot(players) {
        players.forEach((p) => {
            if (p.id === this.playerId) return;
            this.addRemotePlayer(p);
            this.applyRemoteState(p.id, p);
            if (p.skin) this.applyRemoteTransform(p.id, p.skin);
        });
    }

    addRemotePlayer(playerData) {
        if (!playerData || !playerData.id || playerData.id === this.playerId) return;
        if (this.remotePlayers.has(playerData.id)) return;

        const avatar = new RemotePlayerAvatar(this.engine.scene, playerData.id, playerData.name);
        avatar.setTargetState(playerData);
        this.remotePlayers.set(playerData.id, avatar);

        if (playerData.skin) avatar.applyTransform(playerData.skin);
    }

    removeRemotePlayer(playerId) {
        const avatar = this.remotePlayers.get(playerId);
        if (!avatar) return;
        avatar.destroy();
        this.remotePlayers.delete(playerId);
    }

    applyRemoteState(playerId, state) {
        if (playerId === this.playerId) return;
        const avatar = this.remotePlayers.get(playerId);
        if (!avatar) return;
        avatar.setTargetState(state);
    }

    applyRemoteTransform(playerId, skinId) {
        const avatar = this.remotePlayers.get(playerId);
        if (!avatar) return;
        avatar.applyTransform(skinId);
    }

    clearRemotePlayers() {
        this.remotePlayers.forEach((avatar) => avatar.destroy());
        this.remotePlayers.clear();
    }
}

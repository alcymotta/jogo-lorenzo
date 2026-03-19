/**
 * npc.js - NPCs e Capivaras Animadas
 * Personagens não-jogáveis que habitam a ilha
 */

class NPC {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.type = options.type || 'capybara';
        
        // Posição e movimento
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, z: 0 };
        this.rotation = 0;
        
        // Comportamento
        this.moveSpeed = 0.02 + Math.random() * 0.02;
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 200 + Math.random() * 200;
        this.targetRotation = 0;
        this.state = 'walk'; // walk, idle, rest, look, flee
        this.stateTimer = 0;
        this.fleeSpeed = 0.085;
        
        // Modelo 3D
        this.model = null;
        this.bodyParts = {};
        
        // Estados
        this.isWalking = true;
        
        this.createModel();
    }

    /**
     * Criar modelo 3D do NPC
     */
    createModel() {
        if (this.type === 'capybara') {
            this.createCapybaraModel();
        } else {
            this.createGenericModel();
        }
    }

    /**
     * Criar modelo da Capivara
     */
    createCapybaraModel() {
        // Grupo principal
        this.model = new THREE.Group();
        this.scene.add(this.model);
        
        // Corpo (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B6F47, // Marrom de capivara
            flatShading: true
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        this.model.add(body);
        this.bodyParts.body = body;
        
        // Cabeça (esfera)
        const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0.6, 0.8, 0);
        head.castShadow = true;
        head.receiveShadow = true;
        this.model.add(head);
        this.bodyParts.head = head;
        
        // Olhos
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.85, 1, 0.3);
        head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.85, 1, -0.3);
        head.add(rightEye);
        
        // Pernas (cilindros)
        const legGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8);
        const legMaterial = new THREE.MeshPhongMaterial({
            color: 0x7A5F3F,
            flatShading: true
        });
        
        const positions = [
            { x: -0.4, z: -0.4 },
            { x: -0.4, z: 0.4 },
            { x: 0.4, z: -0.4 },
            { x: 0.4, z: 0.4 }
        ];
        
        positions.forEach((pos, idx) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 0.2, pos.z);
            leg.castShadow = true;
            this.model.add(leg);
            this.bodyParts[`leg${idx}`] = leg;
        });
        
        // Cauda
        const tailGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-0.7, 0.6, 0);
        tail.rotation.z = Math.PI / 2;
        tail.castShadow = true;
        this.model.add(tail);
        this.bodyParts.tail = tail;
        
        // Posição inicial
        this.model.position.set(this.position.x, this.position.y, this.position.z);
    }

    /**
     * Criar modelo genérico para outros NPCs
     */
    createGenericModel() {
        // Grupo principal
        this.model = new THREE.Group();
        this.scene.add(this.model);
        
        // Cubo simples
        const geometry = new THREE.BoxGeometry(0.8, 1, 0.6);
        const material = new THREE.MeshPhongMaterial({
            color: 0x9932CC, // Roxo para NPCs genéricos
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.model.add(mesh);
        this.bodyParts.main = mesh;
        
        this.model.position.set(this.position.x, this.position.y, this.position.z);
    }

    /**
     * Atualizar NPC a cada frame
     */
    update(player, delta = 0.016) {
        this.stateTimer += delta;

        // Detectar jogador correndo perto e fugir.
        let distanceToPlayer = 999;
        let playerIsRunningFast = false;
        if (player) {
            const dx = player.position.x - this.position.x;
            const dz = player.position.z - this.position.z;
            distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
            playerIsRunningFast = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.z * player.velocity.z) > 0.28;

            if (distanceToPlayer < 16 && playerIsRunningFast) {
                this.state = 'flee';
                this.stateTimer = 0;
                this.targetRotation = Math.atan2(-dx, -dz);
            } else if (distanceToPlayer < 8 && this.state !== 'flee' && Math.random() < 0.006) {
                this.state = 'look';
                this.stateTimer = 0;
                this.targetRotation = Math.atan2(dx, dz);
            }
        }

        if (this.state === 'flee' && this.stateTimer > 2.4) {
            this.state = 'walk';
            this.stateTimer = 0;
        }

        if ((this.state === 'walk' || this.state === 'idle') && this.stateTimer > 2.5) {
            const roll = Math.random();
            if (roll < 0.15) this.state = 'rest';
            else if (roll < 0.38) this.state = 'idle';
            else this.state = 'walk';
            this.stateTimer = 0;
            this.targetRotation = Math.random() * Math.PI * 2;
        }

        if ((this.state === 'rest' || this.state === 'look') && this.stateTimer > 2.0) {
            this.state = 'walk';
            this.stateTimer = 0;
            this.targetRotation = Math.random() * Math.PI * 2;
        }

        this.changeDirectionTimer++;
        if (this.changeDirectionTimer > this.changeDirectionInterval && this.state === 'walk') {
            this.targetRotation = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = 0;
            this.changeDirectionInterval = 150 + Math.random() * 300;
        }

        // Suavizar rotação
        let angleDiff = this.targetRotation - this.rotation;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        this.rotation += angleDiff * 0.08;

        // Velocidade por estado
        let currentSpeed = 0;
        if (this.state === 'walk') currentSpeed = this.moveSpeed;
        if (this.state === 'flee') currentSpeed = this.fleeSpeed;

        this.velocity.x = Math.sin(this.rotation) * currentSpeed;
        this.velocity.z = Math.cos(this.rotation) * currentSpeed;

        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        // Limitar ao mapa
        const mapBounds = 140;
        if (this.position.x > mapBounds) this.position.x = -mapBounds;
        if (this.position.x < -mapBounds) this.position.x = mapBounds;
        if (this.position.z > mapBounds) this.position.z = -mapBounds;
        if (this.position.z < -mapBounds) this.position.z = mapBounds;
        
        // Atualizar modelo
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.y = this.rotation;

        // Pose de deitar
        if (this.bodyParts.body) {
            const targetBodyZ = this.state === 'rest' ? Math.PI * 0.45 : 0;
            this.bodyParts.body.rotation.z += (targetBodyZ - this.bodyParts.body.rotation.z) * 0.08;
        }

        // Animar pernas
        this.animateLegs();
        
        // Animar cauda
        if (this.bodyParts.tail) {
            const time = Date.now() * 0.005;
            this.bodyParts.tail.rotation.z = Math.PI / 2 + Math.sin(time) * 0.3;
        }
    }

    /**
     * Animar pernas do NPC
     */
    animateLegs() {
        const time = Date.now() * 0.005;
        const amp = (this.state === 'walk' || this.state === 'flee') ? 0.2 : 0.04;
        
        for (let i = 0; i < 4; i++) {
            const leg = this.bodyParts[`leg${i}`];
            if (leg) {
                leg.position.y = 0.2 + Math.sin(time + i) * amp * 0.5;
                leg.rotation.z = Math.sin(time + i) * amp;
            }
        }
    }

    /**
     * Emitir som (visual feedback)
     */
    makeSound() {
        console.log('🐹 Capivara faz som!');
    }

    /**
     * Destruir NPC
     */
    destroy() {
        if (this.model) {
            this.scene.remove(this.model);
        }
    }
}

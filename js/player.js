/**
 * player.js - Sistema do Jogador (Personagem, Movimento, Transformações)
 * Responsável pela lógica, modelo 3D e controle do jogador
 */

class Player {
    constructor(scene, startPosition = { x: 0, y: 2, z: 0 }) {
        this.scene = scene;
        this.position = { x: startPosition.x, y: startPosition.y, z: startPosition.z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        
        // Stats do jogador
        this.playerName = 'Capibara Exploradora';
        this.health = 100;
        this.maxHealth = 100;
        this.inventory = [];
        
        // Estados
        this.isJumping = false;
        this.isFlying = false;
        this.isMortiing = false;
        this.isRunning = false;
        this.currentTransform = 'normal'; // normal, nube, c00lkidd, capybara, guarda
        this.skinId = 'normal';
        this.moveSpeed = 0.25;       // aumentado de 0.15
        this.runMultiplier = 1.8;    // Shift = correr
        this.jumpForce = 0.50;       // aumentado de 0.35
        this.flySpeed = 0.28;
        this.deceleration = 0.80;    // fator de desaceleração (0-1, menor = mais deslizamento)
        this.activeEmote = null;
        this.emoteEndAt = 0;
        
        // Modelos 3D
        this.bodyGroup = null;
        this.headModel = null;
        this.bodyModel = null;
        this.armsModel = [];
        this.legsModel = [];
        this.tailModel = null;
        this.hairModel = null;
        this.chestStripeModel = null;
        
        // Referências
        this.engine = null;
        
        this.createCharacter();
    }

    /**
     * Criar modelo 3D do personagem
     */
    createCharacter() {
        this.armsModel = [];
        this.legsModel = [];

        // Grupo principal do jogador
        this.bodyGroup = new THREE.Group();
        this.bodyGroup.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.bodyGroup);

        const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xFFB347, flatShading: true });
        const shirtMaterial = new THREE.MeshPhongMaterial({ color: 0xF4A460, flatShading: true });
        const pantsMaterial = new THREE.MeshPhongMaterial({ color: 0x3A5F8A, flatShading: true });
        const shoeMaterial = new THREE.MeshPhongMaterial({ color: 0x2E2E2E, flatShading: true });

        // Cabeca (humanoide low-poly)
        const headGeometry = new THREE.BoxGeometry(0.55, 0.6, 0.5);
        const headMaterial = skinMaterial;
        this.headModel = new THREE.Mesh(headGeometry, headMaterial);
        this.headModel.position.y = 0.72;
        this.headModel.castShadow = true;
        this.headModel.receiveShadow = true;
        this.bodyGroup.add(this.headModel);

        // Olhos
        const eyeGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.04);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.13, 0.05, 0.24);
        this.headModel.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.13, 0.05, 0.24);
        this.headModel.add(rightEye);

        // Cabelo
        const hair = new THREE.Mesh(
            new THREE.BoxGeometry(0.58, 0.12, 0.52),
            new THREE.MeshPhongMaterial({ color: 0x3B2A1E, flatShading: true })
        );
        hair.position.set(0, 0.37, 0);
        this.headModel.add(hair);
        this.hairModel = hair;

        // Corpo (tronco)
        const bodyGeometry = new THREE.BoxGeometry(0.72, 0.9, 0.42);
        const bodyMaterial = shirtMaterial;
        this.bodyModel = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyModel.position.y = 0.05;
        this.bodyModel.castShadow = true;
        this.bodyModel.receiveShadow = true;
        this.bodyGroup.add(this.bodyModel);

        // Faixa da camisa para dar mais detalhe visual
        const chestStripe = new THREE.Mesh(
            new THREE.BoxGeometry(0.74, 0.18, 0.44),
            new THREE.MeshPhongMaterial({ color: 0xE08A4B, flatShading: true })
        );
        chestStripe.position.set(0, 0.2, 0.01);
        this.bodyGroup.add(chestStripe);
        this.chestStripeModel = chestStripe;

        // Bracos
        const armGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.75, 8);
        const armMaterial = skinMaterial;

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.52, 0.02, 0);
        leftArm.castShadow = true;
        this.bodyGroup.add(leftArm);
        this.armsModel.push(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.52, 0.02, 0);
        rightArm.castShadow = true;
        this.bodyGroup.add(rightArm);
        this.armsModel.push(rightArm);

        // Maos
        const handGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const leftHand = new THREE.Mesh(handGeometry, armMaterial);
        leftHand.position.set(-0.52, -0.36, 0.08);
        leftHand.castShadow = true;
        this.bodyGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, armMaterial);
        rightHand.position.set(0.52, -0.36, 0.08);
        rightHand.castShadow = true;
        this.bodyGroup.add(rightHand);

        // Pernas
        const legGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.82, 8);
        const legMaterial = pantsMaterial;

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.66, 0);
        leftLeg.castShadow = true;
        this.bodyGroup.add(leftLeg);
        this.legsModel.push(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, -0.66, 0);
        rightLeg.castShadow = true;
        this.bodyGroup.add(rightLeg);
        this.legsModel.push(rightLeg);

        // Pes
        const footGeometry = new THREE.BoxGeometry(0.24, 0.12, 0.36);
        const leftFoot = new THREE.Mesh(footGeometry, shoeMaterial);
        leftFoot.position.set(-0.2, -1.1, 0.1);
        leftFoot.castShadow = true;
        this.bodyGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeometry, shoeMaterial);
        rightFoot.position.set(0.2, -1.1, 0.1);
        rightFoot.castShadow = true;
        this.bodyGroup.add(rightFoot);

        // Acessorio nas costas (mantem compatibilidade com animacao existente)
        const backpackGeometry = new THREE.BoxGeometry(0.28, 0.4, 0.14);
        const backpackMaterial = new THREE.MeshPhongMaterial({ color: 0x5A3A2A, flatShading: true });
        this.tailModel = new THREE.Mesh(backpackGeometry, backpackMaterial);
        this.tailModel.position.set(0, 0.04, -0.3);
        this.tailModel.castShadow = true;
        this.bodyGroup.add(this.tailModel);
    }

    /**
     * Atualizar posição e física do jogador
     */
    update() {
        // Aplicar velocidade à posição
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
        
        // Limitar ao mapa
        const mapBounds = 150;
        if (Math.abs(this.position.x) > mapBounds) {
            this.position.x = Math.sign(this.position.x) * mapBounds;
        }
        if (Math.abs(this.position.z) > mapBounds) {
            this.position.z = Math.sign(this.position.z) * mapBounds;
        }
        
        // Sincronizar grupo 3D com posição
        this.bodyGroup.position.copy(this.position);
        
        // Animar pernas
        this.animateLegs();
        
        // Animar cauda
        this.animateTail();

        // Animar emotes extras
        this.animateEmote();
    }

    /**
     * Aplicar skin (cores + escala) ao personagem.
     */
    applySkinConfig(skin) {
        if (!skin || !skin.colors) return;

        this.skinId = skin.id || 'normal';
        this.currentTransform = this.skinId;

        const colors = skin.colors;
        const setColor = (mesh, hex) => {
            if (mesh && mesh.material && typeof hex === 'number') {
                mesh.material.color.setHex(hex);
            }
        };

        setColor(this.headModel, colors.skin);
        setColor(this.bodyModel, colors.shirt);
        setColor(this.hairModel, colors.hair);
        setColor(this.tailModel, colors.accessory);

        this.armsModel.forEach((arm) => setColor(arm, colors.skin));
        this.legsModel.forEach((leg) => setColor(leg, colors.pants));

        if (this.chestStripeModel && this.chestStripeModel.material && typeof colors.shirt === 'number') {
            const stripeColor = new THREE.Color(colors.shirt);
            stripeColor.offsetHSL(0, 0.05, 0.08);
            this.chestStripeModel.material.color.copy(stripeColor);
        }

        if (skin.scale) {
            this.bodyGroup.scale.set(skin.scale.x, skin.scale.y, skin.scale.z);
        }
    }

    /**
     * Mover jogador — recebe vetor já no espaço mundo (calculado pelo controls).
     * A rotação do corpo já foi aplicada antes desta chamada.
     * @param {{ x: number, z: number }} direction
     * @param {boolean} running
     */
    move(direction, running = false) {
        this.isRunning = running;
        const speed = this.moveSpeed * (running ? this.runMultiplier : 1);
        const accel = 0.20; // aceleração suave
        this.velocity.x += (direction.x * speed - this.velocity.x) * accel;
        this.velocity.z += (direction.z * speed - this.velocity.z) * accel;
    }

    /**
     * Pular
     */
    jump() {
        if (!this.isJumping && !this.isFlying) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
        }
    }

    /**
     * Ativar/Desativar vôo
     */
    toggleFly(state) {
        this.isFlying = state;
        if (state) {
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }

    /**
     * Voar em direção (quando ativo)
     */
    flyInDirection(direction) {
        if (!this.isFlying) return;
        
        // Normalizar
        const len = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        if (len > 0) {
            direction.x /= len;
            direction.z /= len;
        }
        
        this.velocity.x = direction.x * this.flySpeed;
        this.velocity.z = direction.z * this.flySpeed;
        
        // Permitir movimento vertical ao voar
        if (direction.y !== 0) {
            this.velocity.y = direction.y * this.flySpeed * 0.8;
        }
    }

    /**
     * Animar pernas baseado em movimento (mais rápido ao correr)
     */
    animateLegs() {
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
        const time = Date.now() * 0.001;

        if (speed > 0.01) {
            // Frequência e amplitude maiores ao correr
            const freq = this.isRunning ? 12 : 7;
            const amp  = this.isRunning ? 0.5 : 0.35;
            this.legsModel[0].rotation.z = Math.sin(time * freq) * amp;
            this.legsModel[1].rotation.z = Math.sin(time * freq + Math.PI) * amp;
            // Balançar braços
            if (this.armsModel.length >= 2) {
                this.armsModel[0].rotation.z = Math.sin(time * freq + Math.PI) * amp * 0.6;
                this.armsModel[1].rotation.z = Math.sin(time * freq) * amp * 0.6;
            }
        } else {
            this.legsModel[0].rotation.z *= 0.85;
            this.legsModel[1].rotation.z *= 0.85;
            if (this.armsModel.length >= 2) {
                this.armsModel[0].rotation.z *= 0.85;
                this.armsModel[1].rotation.z *= 0.85;
            }
        }
    }

    /**
     * Animar cauda
     */
    animateTail() {
        if (!this.tailModel) return;

        const time = Date.now() * 0.003;
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
        const sway = speed > 0.01 ? 0.08 : 0.03;

        this.tailModel.rotation.x = Math.sin(time * 0.7) * 0.04;
        this.tailModel.rotation.y = Math.sin(time) * sway;
    }

    /**
     * Play emote
     */
    playEmote(emoteType) {
        switch(emoteType) {
            case 'laugh':
                this.headModel.scale.set(1.1, 1.1, 1.1);
                console.log('😂 Rindo... mwahahaha!');
                this.engine?.chatSystem?.addMessage('😂 Que engraçado!', 'system');
                setTimeout(() => {
                    this.headModel.scale.set(1, 1, 1);
                }, 500);
                break;

            case 'dance':
                this.activeEmote = 'dance';
                this.emoteEndAt = Date.now() + 2200;
                this.engine?.chatSystem?.addMessage('🕺 Danca ativada!', 'system');
                break;

            case 'wave':
                this.activeEmote = 'wave';
                this.emoteEndAt = Date.now() + 1500;
                this.engine?.chatSystem?.addMessage('👋 Tchauzinho!', 'system');
                break;

            case 'sit':
                this.activeEmote = 'sit';
                this.emoteEndAt = Date.now() + 3000;
                this.engine?.chatSystem?.addMessage('🪑 Sentando...', 'system');
                break;
                
            case 'mortis':
                // Simular flip (rotação)
                this.isMortiing = true;
                let rotations = 0;
                const rotateInterval = setInterval(() => {
                    this.bodyGroup.rotation.z += Math.PI / 4;
                    rotations++;
                    if (rotations >= 8) {
                        clearInterval(rotateInterval);
                        this.bodyGroup.rotation.z = 0;
                        this.isMortiing = false;
                    }
                }, 50);
                console.log('🤸 Fazendo uma pirueta!');
                this.engine?.chatSystem?.addMessage('🤸 Em movimento!', 'system');
                break;
        }
    }

    animateEmote() {
        if (!this.activeEmote) return;

        const now = Date.now();
        if (now > this.emoteEndAt) {
            this.activeEmote = null;
            this.armsModel.forEach((arm) => {
                arm.rotation.x = 0;
                arm.rotation.y = 0;
            });
            this.legsModel.forEach((leg) => {
                leg.rotation.x = 0;
            });
            this.bodyModel.position.y = 0.05;
            return;
        }

        const t = now * 0.01;

        if (this.activeEmote === 'dance') {
            this.bodyModel.position.y = 0.05 + Math.sin(t * 0.5) * 0.05;
            this.armsModel[0].rotation.x = Math.sin(t) * 1.1;
            this.armsModel[1].rotation.x = Math.cos(t) * 1.1;
            this.armsModel[0].rotation.y = Math.cos(t * 0.8) * 0.25;
            this.armsModel[1].rotation.y = -Math.cos(t * 0.8) * 0.25;
        }

        if (this.activeEmote === 'wave') {
            this.armsModel[1].rotation.x = -0.8 + Math.sin(t * 1.9) * 0.8;
            this.armsModel[1].rotation.y = -0.3;
            this.armsModel[0].rotation.x = 0.2;
        }

        if (this.activeEmote === 'sit') {
            this.bodyModel.position.y = -0.1;
            this.legsModel[0].rotation.x = -1.25;
            this.legsModel[1].rotation.x = -1.25;
            this.armsModel[0].rotation.x = -0.25;
            this.armsModel[1].rotation.x = -0.25;
        }
    }

    /**
     * Transformar em outro personagem/forma
     */
    transform(transformType) {
        const targetSkin = transformType || 'normal';

        if (this.engine && this.engine.skinSystem) {
            this.engine.skinSystem.applySkinToPlayer(this, targetSkin);
        } else {
            this.currentTransform = targetSkin;
        }

        const label = {
            normal: 'Normal',
            nube: 'Nube',
            c00lkidd: 'c00lkidd',
            capybara: 'Capivara',
            guarda: 'Guarda'
        }[targetSkin] || targetSkin;

        this.engine?.chatSystem?.addMessage('✨ Transformado em: ' + label, 'system');
    }

    /**
     * Espaço no inventário
     */
    addToInventory(item) {
        this.inventory.push(item);
        console.log(`📦 Adicionado ao inventário: ${item}`);
    }

    /**
     * Usar item (ex: voador)
     */
    useItem(item) {
        switch(item) {
            case 'hd_voador':
                console.log('🛸 Montado no HD Voador!');
                this.engine?.toggleFly(true);
                break;
            case 'tapete_voador':
                console.log('🧞 Montado no Tapete Voador!');
                this.engine?.toggleFly(true);
                break;
            case 'martelo_banimento':
                console.log('🔨 Equipado com Martelo do Banimento!');
                break;
        }
    }

    /**
     * Receber dano
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
            console.log('💀 Você foi derrotado!');
        }
        console.log(`❤️ Vida: ${this.health}/${this.maxHealth}`);
    }

    /**
     * Curar
     */
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    /**
     * Parar movimento — desaceleração suave
     */
    stopMovement() {
        this.isRunning = false;
        this.velocity.x *= this.deceleration;
        this.velocity.z *= this.deceleration;
        if (Math.abs(this.velocity.x) < 0.001) this.velocity.x = 0;
        if (Math.abs(this.velocity.z) < 0.001) this.velocity.z = 0;
    }
}

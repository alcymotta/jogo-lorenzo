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
        this.currentTransform = 'normal'; // normal, nube, c00lkidd, capybara, guarda
        this.moveSpeed = 0.15;
        this.jumpForce = 0.35;
        this.flySpeed = 0.2;
        
        // Modelos 3D
        this.bodyGroup = null;
        this.headModel = null;
        this.bodyModel = null;
        this.armsModel = [];
        this.legsModel = [];
        this.tailModel = null;
        
        // Referências
        this.engine = null;
        
        this.createCharacter();
    }

    /**
     * Criar modelo 3D do personagem
     */
    createCharacter() {
        // Grupo principal do jogador
        this.bodyGroup = new THREE.Group();
        this.bodyGroup.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.bodyGroup);
        
        // Cabeça (esfera)
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB347,
            flatShading: true
        });
        this.headModel = new THREE.Mesh(headGeometry, headMaterial);
        this.headModel.position.y = 0.6;
        this.headModel.castShadow = true;
        this.headModel.receiveShadow = true;
        this.bodyGroup.add(this.headModel);
        
        // Olhos
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.8, 0.3);
        this.headModel.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.8, 0.3);
        this.headModel.add(rightEye);
        
        // Corpo (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xF4A460,
            flatShading: true
        });
        this.bodyModel = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyModel.position.y = 0;
        this.bodyModel.castShadow = true;
        this.bodyModel.receiveShadow = true;
        this.bodyGroup.add(this.bodyModel);
        
        // Braços (cilindros)
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB347,
            flatShading: true
        });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.2, 0);
        leftArm.castShadow = true;
        this.bodyGroup.add(leftArm);
        this.armsModel.push(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.2, 0);
        rightArm.castShadow = true;
        this.bodyGroup.add(rightArm);
        this.armsModel.push(rightArm);
        
        // Pernas (cilindros)
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xA0755F,
            flatShading: true
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, -0.6, 0);
        leftLeg.castShadow = true;
        this.bodyGroup.add(leftLeg);
        this.legsModel.push(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, -0.6, 0);
        rightLeg.castShadow = true;
        this.bodyGroup.add(rightLeg);
        this.legsModel.push(rightLeg);
        
        // Cauda (simples)
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
        const tailMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xA0755F,
            flatShading: true
        });
        this.tailModel = new THREE.Mesh(tailGeometry, tailMaterial);
        this.tailModel.position.set(0, -0.2, -0.5);
        this.tailModel.rotation.z = Math.PI / 2;
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
    }

    /**
     * Mover jogador em direção
     */
    move(direction) {
        // Normalizar direção
        const len = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        if (len > 0) {
            direction.x /= len;
            direction.z /= len;
        }
        
        // Aplicar velocidade
        const speed = this.isFlying ? this.flySpeed : this.moveSpeed;
        this.velocity.x = direction.x * speed;
        this.velocity.z = direction.z * speed;
        
        // Rotacionar para direção
        if (len > 0) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            // Suavizar rotação
            this.rotation.y += (targetRotation - this.rotation.y) * 0.1;
            this.bodyGroup.rotation.y = this.rotation.y;
        }
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
     * Animar pernas baseado em movimento
     */
    animateLegs() {
        const moveSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
        const time = Date.now() * 0.005;
        
        if (moveSpeed > 0.01) {
            this.legsModel[0].rotation.z = Math.sin(time * 3) * 0.3;
            this.legsModel[1].rotation.z = Math.sin(time * 3 + Math.PI) * 0.3;
        } else {
            this.legsModel[0].rotation.z *= 0.9;
            this.legsModel[1].rotation.z *= 0.9;
        }
    }

    /**
     * Animar cauda
     */
    animateTail() {
        const time = Date.now() * 0.003;
        this.tailModel.rotation.x = Math.sin(time) * 0.2;
        this.tailModel.rotation.z = Math.PI / 2 + Math.sin(time * 0.8) * 0.1;
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

    /**
     * Transformar em outro personagem/forma
     */
    transform(transformType) {
        // Guardar transformação anterior
        const previousTransform = this.currentTransform;
        this.currentTransform = transformType;
        
        // Mudar cores/tamanhos baseado no tipo
        switch(transformType) {
            case 'nube':
                this.headModel.material.color.setHex(0xFFFFFF); // Branco
                this.bodyModel.material.color.setHex(0xFFFFFF);
                this.bodyGroup.scale.set(1.2, 1.2, 1.2);
                console.log('☁️ Você é Nube agora! Flutuante!');
                this.engine?.chatSystem?.addMessage('☁️ Transformado em: Nube', 'system');
                break;
                
            case 'c00lkidd':
                this.headModel.material.color.setHex(0xFF1493); // Rosa
                this.bodyModel.material.color.setHex(0xFF1493);
                this.bodyGroup.scale.set(0.9, 1.1, 0.9);
                console.log('😎 Você é c00lkidd! Chique!');
                this.engine?.chatSystem?.addMessage('😎 Transformado em: c00lkidd', 'system');
                break;
                
            case 'capybara':
                this.headModel.material.color.setHex(0x8B4513); // Marrom
                this.bodyModel.material.color.setHex(0x8B4513);
                this.bodyGroup.scale.set(1.5, 0.8, 1.5); // Mais larga
                console.log('🐹 Você é uma Capivara!');
                this.engine?.chatSystem?.addMessage('🐹 Transformado em: Capivara', 'system');
                break;
                
            case 'guarda':
                this.headModel.material.color.setHex(0x1E90FF); // Azul
                this.bodyModel.material.color.setHex(0x000080); // Azul escuro
                this.bodyGroup.scale.set(1.1, 1.3, 1.1); // Mais alta
                console.log('👮 Você é um Guarda! Certero!');
                this.engine?.chatSystem?.addMessage('👮 Transformado em: Guarda', 'system');
                break;
                
            default:
                // Voltar ao normal
                this.headModel.material.color.setHex(0xFFB347);
                this.bodyModel.material.color.setHex(0xF4A460);
                this.bodyGroup.scale.set(1, 1, 1);
                this.currentTransform = 'normal';
                console.log('✨ Voltou ao normal!');
                this.engine?.chatSystem?.addMessage('✨ Transformação cancelada', 'system');
        }
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
     * Parar movimento
     */
    stopMovement() {
        this.velocity.x = 0;
        this.velocity.z = 0;
    }
}

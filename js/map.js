/**
 * map.js - Geração do Mapa "Ilha de Capibara"
 * Cria todo o ambiente: terreno, água, árvores, montanhas, etc.
 */

class MapGenerator {
    constructor(scene) {
        this.scene = scene;
        this.terrain = null;
        this.water = null;
        this.trees = [];
        this.rocks = [];
        this.mountains = [];
    }

    /**
     * Gerar mapa completo
     */
    generate() {
        console.log('🌍 Gerando mapa...');
        this.createTerrain();
        this.createWater();
        this.plantTrees();
        this.placeRocks();
        this.createMountains();
        this.addDecorations();
        console.log('✅ Mapa gerado com sucesso!');
    }

    /**
     * Criar terreno (grama)
     */
    createTerrain() {
        // Plano base
        const terrainGeometry = new THREE.PlaneGeometry(300, 300);
        const terrainMaterial = new THREE.MeshPhongMaterial({
            color: 0x00AA00, // Verde
            flatShading: true
        });
        
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.y = 0;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
        
        // Adicionar detalhes ao terreno com Perlin noise simulado
        this.addTerrainDetails();
    }

    /**
     * Adicionar detalhes ao terreno
     */
    addTerrainDetails() {
        // Grama decorativa em patches
        const grassPatches = 20;
        for (let i = 0; i < grassPatches; i++) {
            const x = (Math.random() - 0.5) * 280;
            const z = (Math.random() - 0.5) * 280;
            
            const patchGeometry = new THREE.PlaneGeometry(10, 10);
            const patchMaterial = new THREE.MeshPhongMaterial({
                color: 0x00CC00 + Math.random() * 0x002200
            });
            
            const patch = new THREE.Mesh(patchGeometry, patchMaterial);
            patch.rotation.x = -Math.PI / 2;
            patch.position.set(x, 0.01, z);
            this.scene.add(patch);
        }
    }

    /**
     * Criar lago (água)
     */
    createWater() {
        // Lago simples
        const waterGeometry = new THREE.CircleGeometry(40, 32);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x1E90FF, // Azul
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });
        
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.set(-60, 0.1, -40);
        this.water.receiveShadow = true;
        this.scene.add(this.water);
        
        // Animar água (ondulação simples)
        this.waterWaveOffset = 0;
    }

    /**
     * Plantar árvores
     */
    plantTrees() {
        const treePositions = [
            { x: -80, z: -80 },
            { x: -60, z: -60 },
            { x: -40, z: -90 },
            { x: 0, z: -100 },
            { x: 40, z: -95 },
            { x: 80, z: -70 },
            { x: 100, z: -40 },
            { x: 90, z: 20 },
            { x: 60, z: 60 },
            { x: 20, z: 80 },
            { x: -30, z: 90 },
            { x: -80, z: 50 },
            { x: -100, z: 10 },
            { x: 0, z: 40 },
            { x: 50, z: 30 }
        ];
        
        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });
    }

    /**
     * Criar uma árvore individual
     */
    createTree(x, z) {
        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(2, 3, 10, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x654321, // Marrom
            flatShading: true
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);
        this.trees.push(trunk);
        
        // Folhagem (cone)
        const leavesGeometry = new THREE.ConeGeometry(6, 12, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({
            color: 0x00AA00, // Verde
            flatShading: true
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, 13, z);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        this.scene.add(leaves);
        this.trees.push(leaves);
    }

    /**
     * Colocar pedras
     */
    placeRocks() {
        const rockPositions = [
            { x: 30, z: -60, size: 2 },
            { x: -50, z: 30, size: 1.5 },
            { x: 70, z: 50, size: 2.5 },
            { x: -80, z: -20, size: 1.8 },
            { x: 25, z: 5, size: 1.2 },
            { x: -30, z: -50, size: 2.2 },
            { x: 60, z: -30, size: 1.5 },
            { x: -60, z: 70, size: 2.8 }
        ];
        
        rockPositions.forEach(pos => {
            this.createRock(pos.x, pos.z, pos.size);
        });
    }

    /**
     * Criar pedra individual
     */
    createRock(x, z, size) {
        const rockGeometry = new THREE.OctahedronGeometry(size, 2);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080, // Cinza
            flatShading: true
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, size * 0.6, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
        this.rocks.push(rock);
    }

    /**
     * Criar montanhas
     */
    createMountains() {
        const mountainPositions = [
            { x: -120, z: -100, height: 30, size: 50 },
            { x: 130, z: 80, height: 25, size: 45 },
            { x: -50, z: 120, height: 20, size: 40 }
        ];
        
        mountainPositions.forEach(pos => {
            this.createMountain(pos.x, pos.z, pos.height, pos.size);
        });
    }

    /**
     * Criar montanha individual
     */
    createMountain(centerX, centerZ, height, size) {
        // Montanha é um cone
        const mountainGeometry = new THREE.ConeGeometry(size, height, 16);
        const mountainMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B7355, // Marrom de montanha
            flatShading: true
        });
        
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(centerX, height / 2, centerZ);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        this.scene.add(mountain);
        this.mountains.push(mountain);
        
        // Topo nevado
        const snowGeometry = new THREE.ConeGeometry(size * 0.5, height * 0.3, 16);
        const snowMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, // Branco
            flatShading: true
        });
        
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.set(centerX, height * 0.85, centerZ);
        snow.castShadow = true;
        this.scene.add(snow);
    }

    /**
     * Adicionar decorações
     */
    addDecorations() {
        // Flores/plantas decorativas
        this.createFlowerField(40, 40, 50);
        
        // Sinais/placas
        this.createSign(-100, 60, "Bem-vindo à Ilha de Capibara!");
        this.createSign(80, -80, "Cuidado com as Capivaras!");
    }

    /**
     * Criar campo de flores
     */
    createFlowerField(centerX, centerZ, count) {
        for (let i = 0; i < count; i++) {
            const x = centerX + (Math.random() - 0.5) * 50;
            const z = centerZ + (Math.random() - 0.5) * 50;
            
            // Flores simples (esferas coloridas)
            const flowerGeometry = new THREE.SphereGeometry(0.3, 4, 4);
            const flowerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
            });
            
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.set(x, 0.3, z);
            this.scene.add(flower);
        }
    }

    /**
     * Criar placa/sinal
     */
    createSign(x, z, text) {
        // Poste
        const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 2, z);
        post.castShadow = true;
        this.scene.add(post);
        
        // Placa (será implementada com canvas 3D em versão melhorada)
        const signGeometry = new THREE.BoxGeometry(4, 2, 0.2);
        const signMaterial = new THREE.MeshPhongMaterial({ color: 0xEADC82 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(x, 4, z);
        sign.castShadow = true;
        this.scene.add(sign);
    }

    /**
     * Atualizar efeitos de animação do mapa
     */
    update() {
        if (this.water) {
            this.waterWaveOffset += 0.01;
            this.water.position.y = 0.1 + Math.sin(this.waterWaveOffset) * 0.05;
        }
    }

    /**
     * Verificar colisão simples
     */
    checkCollision(position, radius = 1) {
        // Colisões simples com árvores
        for (let tree of this.trees) {
            if (tree.geometry.type === 'CylinderGeometry') {
                const distance = Math.sqrt(
                    Math.pow(position.x - tree.position.x, 2) +
                    Math.pow(position.z - tree.position.z, 2)
                );
                
                if (distance < radius + 2) {
                    return true;
                }
            }
        }
        
        // Colisões com rochas
        for (let rock of this.rocks) {
            const distance = Math.sqrt(
                Math.pow(position.x - rock.position.x, 2) +
                Math.pow(position.z - rock.position.z, 2)
            );
            
            if (distance < radius + 2) {
                return true;
            }
        }
        
        return false;
    }
}

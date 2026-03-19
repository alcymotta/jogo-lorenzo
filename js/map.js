/**
 * map.js - Mundo evoluido da Ilha de Capibara
 * Visual low poly vibrante + estruturas exploraveis + otimizacao para mobile.
 */

class MapGenerator {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.quality = options.quality || 'desktop';
        this.worldRadius = 170;
        this.isMobile = this.quality === 'mobile';

        this.terrain = null;
        this.ocean = null;
        this.lake = null;
        this.skyDome = null;
        this.waterUniforms = [];

        this.vegetation = {
            trees: null,
            bushes: null,
            flowers: null,
            grass: null
        };

        this.rocks = [];
        this.structures = [];
        this.obstacles = [];

        this.ducks = [];
        this.fishes = [];
        this.leafParticles = null;
        this.leafBase = [];

        this.lakeCenter = { x: -34, z: 26 };
        this.lakeRadius = 30;

        this.time = 0;
    }

    generate() {
        this.createSkyDome();
        this.createOcean();
        this.createIslandTerrain();
        this.createBeachRing();
        this.createForest();
        this.createRocks();
        this.createMainMountain();
        this.createLake();
        this.createCave();
        this.createTreeHouse();
        this.createBridge();
        this.createSmallIsland();
        this.createAmbientAnimals();
        this.createLeafParticles();
        this.createDecorativeSigns();
    }

    createSkyDome() {
        const uniforms = {
            topColor: { value: new THREE.Color(0x74caff) },
            bottomColor: { value: new THREE.Color(0xd9f7ff) },
            offset: { value: 60.0 },
            exponent: { value: 0.6 }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: [
                'varying vec3 vWorldPosition;',
                'void main() {',
                '  vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
                '  vWorldPosition = worldPosition.xyz;',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 topColor;',
                'uniform vec3 bottomColor;',
                'uniform float offset;',
                'uniform float exponent;',
                'varying vec3 vWorldPosition;',
                'void main() {',
                '  float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;',
                '  float factor = max(pow(max(h, 0.0), exponent), 0.0);',
                '  gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);',
                '}'
            ].join('\n'),
            side: THREE.BackSide,
            depthWrite: false
        });

        this.skyDome = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), material);
        this.scene.add(this.skyDome);
    }

    createOcean() {
        const geometry = new THREE.CircleGeometry(460, 96);
        const material = this.createWaterShader(0x2f9fe7, 0x1f7fcd, 0.78, 0.085);

        this.ocean = new THREE.Mesh(geometry, material);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.y = -1.25;
        this.ocean.receiveShadow = true;
        this.scene.add(this.ocean);
    }

    createIslandTerrain() {
        const segments = 140;
        const geometry = new THREE.CircleGeometry(this.worldRadius, segments);
        geometry.rotateX(-Math.PI / 2);

        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const normalized = r / this.worldRadius;

            const noise =
                Math.sin(x * 0.08) * 0.8 +
                Math.cos(z * 0.06) * 0.7 +
                Math.sin((x + z) * 0.04) * 1.2;

            const centerBump = Math.max(0, 1 - normalized * 1.1) * 7.2;
            const edgeDrop = -Math.pow(normalized, 2.7) * 4.8;
            let y = centerBump + edgeDrop + noise * 0.7;

            // faixa de praia
            if (r > 134 && r < 168) y = Math.min(y, 0.7 + (Math.sin(i * 0.3) * 0.2));

            pos.setY(i, y);
        }
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x56ba65,
            roughness: 0.92,
            metalness: 0.02,
            flatShading: true
        });

        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.position.y = -0.25;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
    }

    createBeachRing() {
        const beach = new THREE.Mesh(
            new THREE.RingGeometry(this.worldRadius - 28, this.worldRadius - 2, 96),
            new THREE.MeshStandardMaterial({
                color: 0xf5d69a,
                roughness: 0.95,
                metalness: 0.01,
                flatShading: true
            })
        );
        beach.rotation.x = -Math.PI / 2;
        beach.position.y = -0.05;
        beach.receiveShadow = true;
        this.scene.add(beach);

        const shallowWater = new THREE.Mesh(
            new THREE.RingGeometry(this.worldRadius - 3, this.worldRadius + 20, 96),
            this.createWaterShader(0x4fb7f4, 0x2d9ae0, 0.45, 0.04)
        );
        shallowWater.rotation.x = -Math.PI / 2;
        shallowWater.position.y = -0.9;
        this.scene.add(shallowWater);
    }

    createForest() {
        const treeCount = this.isMobile ? 140 : 290;
        const bushCount = this.isMobile ? 110 : 180;
        const flowerCount = this.isMobile ? 140 : 260;
        const grassCount = this.isMobile ? 380 : 920;

        this.vegetation.trees = this.buildInstancedTrees(treeCount);
        this.vegetation.bushes = this.buildInstancedBushes(bushCount);
        this.vegetation.flowers = this.buildInstancedFlowers(flowerCount);
        this.vegetation.grass = this.buildInstancedGrass(grassCount);
    }

    buildInstancedTrees(count) {
        const trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, 3.6, 6);
        const leavesGeo = new THREE.ConeGeometry(1.8, 3.8, 7);

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c2f, roughness: 1, flatShading: true });
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x33a24d, roughness: 0.9, flatShading: true });

        const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
        const leavesMesh = new THREE.InstancedMesh(leavesGeo, leavesMat, count);

        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        leavesMesh.castShadow = true;

        const matrix = new THREE.Matrix4();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const pos = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const p = this.randomPointInForest();
            const h = 0.8 + Math.random() * 1.2;
            pos.set(p.x, 1.7 + h * 0.2, p.z);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
            scale.set(1, h, 1);
            matrix.compose(pos, quat, scale);
            trunkMesh.setMatrixAt(i, matrix);

            pos.set(p.x, 4.2 + h * 0.6, p.z);
            scale.set(0.95 + h * 0.25, 0.95 + h * 0.25, 0.95 + h * 0.25);
            matrix.compose(pos, quat, scale);
            leavesMesh.setMatrixAt(i, matrix);

            this.obstacles.push({ x: p.x, z: p.z, r: 1.8 });
        }

        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;

        this.scene.add(trunkMesh);
        this.scene.add(leavesMesh);

        return { trunkMesh, leavesMesh };
    }

    buildInstancedBushes(count) {
        const geo = new THREE.DodecahedronGeometry(0.9, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x3bb061, roughness: 0.95, flatShading: true });
        const mesh = new THREE.InstancedMesh(geo, mat, count);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const matrix = new THREE.Matrix4();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const pos = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const p = this.randomPointOnIsland(15, this.worldRadius - 25);
            if (this.isPointNearLake(p.x, p.z, 7)) continue;

            const s = 0.6 + Math.random() * 1.5;
            pos.set(p.x, 0.2 + Math.random() * 0.2, p.z);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
            scale.set(s, s * 0.7, s);
            matrix.compose(pos, quat, scale);
            mesh.setMatrixAt(i, matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(mesh);
        return mesh;
    }

    buildInstancedFlowers(count) {
        const geo = new THREE.ConeGeometry(0.18, 0.45, 5);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff90b6, roughness: 0.8, flatShading: true });
        const mesh = new THREE.InstancedMesh(geo, mat, count);

        const matrix = new THREE.Matrix4();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const pos = new THREE.Vector3();

        const flowerPalette = [0xff90b6, 0xffd166, 0x7ad8ff, 0xf4ff79, 0xffa3a3];

        for (let i = 0; i < count; i++) {
            const p = this.randomPointOnIsland(14, this.worldRadius - 18);
            if (this.isPointNearLake(p.x, p.z, 6)) continue;

            const s = 0.6 + Math.random() * 0.9;
            pos.set(p.x, 0.25, p.z);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
            scale.set(s, s, s);
            matrix.compose(pos, quat, scale);
            mesh.setMatrixAt(i, matrix);
            mesh.setColorAt(i, new THREE.Color(flowerPalette[(Math.random() * flowerPalette.length) | 0]));
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        this.scene.add(mesh);
        return mesh;
    }

    buildInstancedGrass(count) {
        const geo = new THREE.ConeGeometry(0.11, 0.55, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x4ebd61, roughness: 0.95, flatShading: true });
        const mesh = new THREE.InstancedMesh(geo, mat, count);

        const matrix = new THREE.Matrix4();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const pos = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const p = this.randomPointOnIsland(12, this.worldRadius - 8);
            if (this.isPointNearLake(p.x, p.z, 4)) continue;

            const s = 0.55 + Math.random() * 0.8;
            pos.set(p.x, 0.08, p.z);
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
            scale.set(s, s, s);
            matrix.compose(pos, quat, scale);
            mesh.setMatrixAt(i, matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(mesh);
        return mesh;
    }

    createRocks() {
        const count = this.isMobile ? 35 : 58;
        for (let i = 0; i < count; i++) {
            const p = this.randomPointOnIsland(22, this.worldRadius - 15);
            if (this.isPointNearLake(p.x, p.z, 8)) continue;

            const size = 0.7 + Math.random() * 2.1;
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(size, 0),
                new THREE.MeshStandardMaterial({ color: 0x8c8b86, roughness: 1, flatShading: true })
            );
            mesh.position.set(p.x, size * 0.32, p.z);
            mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.4);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.rocks.push(mesh);
            this.obstacles.push({ x: p.x, z: p.z, r: size * 0.8 });
        }
    }

    createMainMountain() {
        const mountain = new THREE.Mesh(
            new THREE.ConeGeometry(38, 58, 9),
            new THREE.MeshStandardMaterial({ color: 0x8f7a63, roughness: 0.95, flatShading: true })
        );
        mountain.position.set(42, 26, -52);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        this.scene.add(mountain);
        this.structures.push(mountain);

        const top = new THREE.Mesh(
            new THREE.ConeGeometry(17, 14, 9),
            new THREE.MeshStandardMaterial({ color: 0xf4f3ee, roughness: 0.85, flatShading: true })
        );
        top.position.set(42, 52, -52);
        top.castShadow = true;
        this.scene.add(top);
        this.structures.push(top);
    }

    createLake() {
        this.lake = new THREE.Mesh(
            new THREE.CircleGeometry(this.lakeRadius, 60),
            this.createWaterShader(0x54c4ff, 0x2f94df, 0.82, 0.12)
        );
        this.lake.rotation.x = -Math.PI / 2;
        this.lake.position.set(this.lakeCenter.x, 0.14, this.lakeCenter.z);
        this.scene.add(this.lake);

        const edge = new THREE.Mesh(
            new THREE.RingGeometry(this.lakeRadius - 1.8, this.lakeRadius + 4.5, 60),
            new THREE.MeshStandardMaterial({ color: 0xe1d49e, roughness: 1, flatShading: true })
        );
        edge.rotation.x = -Math.PI / 2;
        edge.position.set(this.lakeCenter.x, 0.08, this.lakeCenter.z);
        edge.receiveShadow = true;
        this.scene.add(edge);
    }

    createCave() {
        const outer = new THREE.Mesh(
            new THREE.CylinderGeometry(12, 14, 9, 12),
            new THREE.MeshStandardMaterial({ color: 0x705a48, roughness: 1, flatShading: true })
        );
        outer.position.set(-96, 3.2, -34);
        outer.castShadow = true;
        outer.receiveShadow = true;
        this.scene.add(outer);

        const caveHole = new THREE.Mesh(
            new THREE.CylinderGeometry(3.2, 3.6, 4, 12),
            new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 1, flatShading: true })
        );
        caveHole.position.set(-90.5, 2.3, -34);
        caveHole.rotation.z = Math.PI / 2;
        this.scene.add(caveHole);

        this.structures.push(outer, caveHole);
        this.obstacles.push({ x: -96, z: -34, r: 10 });
    }

    createTreeHouse() {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(2.2, 2.7, 22, 8),
            new THREE.MeshStandardMaterial({ color: 0x704728, roughness: 1, flatShading: true })
        );
        trunk.position.set(74, 10.5, 58);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);

        const house = new THREE.Mesh(
            new THREE.BoxGeometry(11, 6.5, 9),
            new THREE.MeshStandardMaterial({ color: 0xd39f66, roughness: 0.9, flatShading: true })
        );
        house.position.set(74, 17.5, 58);
        house.castShadow = true;
        house.receiveShadow = true;
        this.scene.add(house);

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(8.5, 4.6, 4),
            new THREE.MeshStandardMaterial({ color: 0xbf5933, roughness: 0.9, flatShading: true })
        );
        roof.position.set(74, 23, 58);
        roof.rotation.y = Math.PI * 0.25;
        roof.castShadow = true;
        this.scene.add(roof);

        const ladder = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 13, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x8a5b35, roughness: 1, flatShading: true })
        );
        ladder.position.set(79.2, 6.7, 58);
        this.scene.add(ladder);

        this.structures.push(trunk, house, roof, ladder);
        this.obstacles.push({ x: 74, z: 58, r: 6.2 });
    }

    createBridge() {
        const bridgeGroup = new THREE.Group();
        const plankMat = new THREE.MeshStandardMaterial({ color: 0x9c6c3f, roughness: 0.95, flatShading: true });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x6f4a2b, roughness: 1, flatShading: true });

        for (let i = 0; i < 12; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 3.8), plankMat);
            plank.position.set(-10 + i * 2.15, 0.65 + Math.sin(i * 0.45) * 0.15, -18 + i * 0.25);
            plank.castShadow = true;
            plank.receiveShadow = true;
            bridgeGroup.add(plank);

            if (i % 2 === 0) {
                const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.8, 6), postMat);
                postL.position.set(plank.position.x - 1.1, plank.position.y + 0.9, plank.position.z - 1.5);
                bridgeGroup.add(postL);

                const postR = postL.clone();
                postR.position.x += 2.2;
                bridgeGroup.add(postR);
            }
        }

        this.scene.add(bridgeGroup);
        this.structures.push(bridgeGroup);
    }

    createSmallIsland() {
        const island = new THREE.Mesh(
            new THREE.CylinderGeometry(22, 30, 6, 26),
            new THREE.MeshStandardMaterial({ color: 0x5ab868, roughness: 1, flatShading: true })
        );
        island.position.set(-145, 0.7, 124);
        island.castShadow = true;
        island.receiveShadow = true;
        this.scene.add(island);

        const beach = new THREE.Mesh(
            new THREE.CylinderGeometry(24, 32, 0.9, 26),
            new THREE.MeshStandardMaterial({ color: 0xf2d49d, roughness: 1, flatShading: true })
        );
        beach.position.set(-145, -1.4, 124);
        this.scene.add(beach);

        this.structures.push(island, beach);
    }

    createAmbientAnimals() {
        const duckCount = this.isMobile ? 5 : 9;
        const fishCount = this.isMobile ? 9 : 16;

        const duckBodyGeo = new THREE.SphereGeometry(0.65, 8, 6);
        const duckMat = new THREE.MeshStandardMaterial({ color: 0xffef88, roughness: 0.7, flatShading: true });

        for (let i = 0; i < duckCount; i++) {
            const duck = new THREE.Mesh(duckBodyGeo, duckMat);
            const angle = (i / duckCount) * Math.PI * 2;
            const radius = this.lakeRadius * (0.35 + Math.random() * 0.5);
            duck.position.set(
                this.lakeCenter.x + Math.cos(angle) * radius,
                0.36,
                this.lakeCenter.z + Math.sin(angle) * radius
            );
            duck.userData = {
                angle,
                radius,
                speed: 0.28 + Math.random() * 0.24,
                bobOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(duck);
            this.ducks.push(duck);
        }

        const fishGeo = new THREE.ConeGeometry(0.28, 1.0, 6);
        const fishMat = new THREE.MeshStandardMaterial({ color: 0xff8c67, roughness: 0.7, flatShading: true });

        for (let i = 0; i < fishCount; i++) {
            const fish = new THREE.Mesh(fishGeo, fishMat);
            const angle = (i / fishCount) * Math.PI * 2;
            const radius = this.lakeRadius * (0.15 + Math.random() * 0.68);
            fish.position.set(
                this.lakeCenter.x + Math.cos(angle) * radius,
                0.08,
                this.lakeCenter.z + Math.sin(angle) * radius
            );
            fish.rotation.z = Math.PI * 0.5;
            fish.userData = {
                angle,
                radius,
                speed: 0.9 + Math.random() * 0.5,
                bobOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(fish);
            this.fishes.push(fish);
        }
    }

    createLeafParticles() {
        const count = this.isMobile ? 120 : 240;
        const positions = new Float32Array(count * 3);
        this.leafBase = [];

        for (let i = 0; i < count; i++) {
            const p = this.randomPointInForest();
            const y = 2 + Math.random() * 16;
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = p.z;
            this.leafBase.push({ x: p.x, y, z: p.z, offset: Math.random() * Math.PI * 2 });
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffcc6b,
            size: this.isMobile ? 0.28 : 0.35,
            transparent: true,
            opacity: 0.72,
            depthWrite: false
        });

        this.leafParticles = new THREE.Points(geometry, material);
        this.scene.add(this.leafParticles);
    }

    createDecorativeSigns() {
        this.createSign(-124, 56, 'Bem-vindo a Ilha de Capibara');
        this.createSign(96, -78, 'Ponte para a pequena ilha');
        this.createSign(-88, -42, 'Caverna secreta');
    }

    createSign(x, z, text) {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 3.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x84552f, roughness: 1, flatShading: true })
        );
        post.position.set(x, 1.6, z);
        post.castShadow = true;
        this.scene.add(post);

        const board = new THREE.Mesh(
            new THREE.BoxGeometry(4.6, 1.9, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xf0dc9a, roughness: 0.9, flatShading: true })
        );
        board.position.set(x, 3.3, z);
        board.castShadow = true;
        this.scene.add(board);

        // rotulo simples
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        const ctx = labelCanvas.getContext('2d');
        ctx.fillStyle = '#2d251f';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#f7e8bb';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 33);

        const labelMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(labelCanvas), transparent: true });
        const label = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.1), labelMat);
        label.position.set(x, 3.35, z + 0.12);
        this.scene.add(label);

        this.structures.push(post, board, label);
    }

    createWaterShader(lightHex, deepHex, opacity, waveAmp) {
        const uniforms = {
            uTime: { value: 0 },
            uLight: { value: new THREE.Color(lightHex) },
            uDeep: { value: new THREE.Color(deepHex) },
            uOpacity: { value: opacity },
            uWaveAmp: { value: waveAmp }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            vertexShader: [
                'uniform float uTime;',
                'uniform float uWaveAmp;',
                'varying float vWave;',
                'varying vec2 vUv;',
                'void main() {',
                '  vUv = uv;',
                '  vec3 p = position;',
                '  float waveA = sin((p.x + uTime * 9.0) * 0.06) * uWaveAmp;',
                '  float waveB = cos((p.y + uTime * 7.0) * 0.05) * (uWaveAmp * 0.7);',
                '  p.z += waveA + waveB;',
                '  vWave = (waveA + waveB) * 8.0;',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 uLight;',
                'uniform vec3 uDeep;',
                'uniform float uOpacity;',
                'varying float vWave;',
                'varying vec2 vUv;',
                'void main() {',
                '  float grad = clamp(vUv.y + vWave * 0.06, 0.0, 1.0);',
                '  vec3 col = mix(uDeep, uLight, grad);',
                '  gl_FragColor = vec4(col, uOpacity);',
                '}'
            ].join('\n')
        });

        this.waterUniforms.push(uniforms);
        return material;
    }

    update(delta, playerPosition) {
        this.time += delta;

        this.waterUniforms.forEach((u) => {
            u.uTime.value = this.time;
        });

        this.animateDucks();
        this.animateFishes();
        this.animateLeafParticles();

        // LOD simples de particulas: em mobile, some quando jogador esta longe da floresta.
        if (this.leafParticles && playerPosition && this.isMobile) {
            const dx = playerPosition.x - 30;
            const dz = playerPosition.z - 20;
            const dist = Math.sqrt(dx * dx + dz * dz);
            this.leafParticles.visible = dist < 180;
        }
    }

    animateDucks() {
        for (let i = 0; i < this.ducks.length; i++) {
            const duck = this.ducks[i];
            const d = duck.userData;
            d.angle += 0.0035 * d.speed;

            duck.position.x = this.lakeCenter.x + Math.cos(d.angle) * d.radius;
            duck.position.z = this.lakeCenter.z + Math.sin(d.angle) * d.radius;
            duck.position.y = 0.33 + Math.sin(this.time * 2.2 + d.bobOffset) * 0.03;
            duck.rotation.y = -d.angle + Math.PI * 0.5;
        }
    }

    animateFishes() {
        for (let i = 0; i < this.fishes.length; i++) {
            const fish = this.fishes[i];
            const f = fish.userData;
            f.angle -= 0.009 * f.speed;

            fish.position.x = this.lakeCenter.x + Math.cos(f.angle) * f.radius;
            fish.position.z = this.lakeCenter.z + Math.sin(f.angle) * f.radius;
            fish.position.y = 0.08 + Math.sin(this.time * 5 + f.bobOffset) * 0.04;
            fish.rotation.y = -f.angle - Math.PI * 0.5;
        }
    }

    animateLeafParticles() {
        if (!this.leafParticles) return;
        const pos = this.leafParticles.geometry.attributes.position;

        for (let i = 0; i < this.leafBase.length; i++) {
            const b = this.leafBase[i];
            pos.setX(i, b.x + Math.sin(this.time * 0.9 + b.offset) * 0.9);
            pos.setY(i, b.y + Math.sin(this.time * 1.4 + b.offset) * 0.5);
            pos.setZ(i, b.z + Math.cos(this.time * 1.1 + b.offset) * 0.7);
        }

        pos.needsUpdate = true;
    }

    randomPointOnIsland(minR, maxR) {
        const angle = Math.random() * Math.PI * 2;
        const r = minR + Math.random() * (maxR - minR);
        return {
            x: Math.cos(angle) * r,
            z: Math.sin(angle) * r
        };
    }

    randomPointInForest() {
        // Floresta principal em faixa nordeste/oeste da ilha
        const region = Math.random() < 0.5 ? 1 : -1;
        const xBase = region > 0 ? 55 : -65;
        const zBase = region > 0 ? 40 : -25;
        const x = xBase + (Math.random() - 0.5) * 70;
        const z = zBase + (Math.random() - 0.5) * 70;
        return { x, z };
    }

    isPointNearLake(x, z, margin = 0) {
        const dx = x - this.lakeCenter.x;
        const dz = z - this.lakeCenter.z;
        return Math.sqrt(dx * dx + dz * dz) < this.lakeRadius + margin;
    }

    getSpawnPoint() {
        return { x: 0, y: 2.2, z: 62 };
    }

    getCapybaraSpawnPoints(count = 6) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const p = this.randomPointOnIsland(18, this.worldRadius - 38);
            points.push({ x: p.x, z: p.z, type: 'capybara' });
        }
        return points;
    }

    checkCollision(position, radius = 1) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const o = this.obstacles[i];
            const dx = position.x - o.x;
            const dz = position.z - o.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < radius + o.r) return true;
        }
        return false;
    }
}

// script/petals.js
let petals = [];
let scene; // Will be initialized from main.js

// Physics Configuration (Adjust these values)
const PETAL_CONFIG = {
    baseSpeed: 0.006,
    speedVariation: 0.003,
    swayAmplitude: 0.18,
    swayFrequency: 0.45,
    rotationMultiplier: 0.12,
    twistIntensity: 0.015,
    acceleration: 0.0001
};

async function initPetals(sceneRef) {
    scene = sceneRef;
    const hasTexture = await checkPetalsTexture();
    hasTexture ? await createTexturePetals() : createProceduralPetals();
}

async function checkPetalsTexture() {
    try {
        const [res1, res2] = await Promise.all([
            fetch('assets/textures/petals.png', { method: 'HEAD' }),
            fetch('assets/textures/petal.png', { method: 'HEAD' })
        ]);
        return res1.ok || res2.ok;
    } catch {
        return false;
    }
}

async function createTexturePetals() {
    const texturePath = await getCorrectTexturePath();
    
    const texture = new THREE.TextureLoader().load(
        `${texturePath}?v=${Date.now()}`,
        undefined,
        undefined,
        (err) => {
            console.error('Texture load failed:', err);
            createProceduralPetals();
        }
    );

    const geometry = new THREE.PlaneGeometry(0.18, 0.25);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    });

    for(let i = 0; i < 60; i++) {
        const petal = new THREE.Mesh(geometry, material.clone());
        initializePetalPhysics(petal);
        scene.add(petal);
        petals.push(petal);
    }
}

function initializePetalPhysics(petal) {
    petal.userData = {
        speed: PETAL_CONFIG.baseSpeed + Math.random() * PETAL_CONFIG.speedVariation,
        sway: {
            amplitude: PETAL_CONFIG.swayAmplitude * (0.8 + Math.random() * 0.4),
            frequency: PETAL_CONFIG.swayFrequency * (0.7 + Math.random() * 0.6),
            phase: Math.random() * Math.PI * 2
        },
        rotation: {
            x: THREE.MathUtils.degToRad(PETAL_CONFIG.rotationMultiplier * (0.5 + Math.random())),
            y: THREE.MathUtils.degToRad(PETAL_CONFIG.rotationMultiplier * (0.3 + Math.random())),
            z: THREE.MathUtils.degToRad(PETAL_CONFIG.rotationMultiplier * (0.7 + Math.random()))
        },
        twist: PETAL_CONFIG.twistIntensity * (0.5 + Math.random()),
        timeOffset: Math.random() * 1000
    };
    
    resetPetalPosition(petal);
    petal.scale.set(0.8 + Math.random() * 0.3, 0.8 + Math.random() * 0.3, 1);
}

function createProceduralPetals() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(200 * 3);
    
    for(let i = 0; i < vertices.length; i += 3) {
        vertices[i] = Math.random() * 10 - 5;
        vertices[i + 1] = Math.random() * 10 + 5;
        vertices[i + 2] = Math.random() * 8 - 4;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    petals = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.07,
            color: 0xff69b4,
            transparent: true,
            opacity: 0.7
        })
    );
    
    scene.add(petals);
}

function updatePetals() {
    const time = Date.now() * 0.001;
    
    petals.forEach(petal => {
        if(!petal.isMesh) return; // Skip procedural points
        
        const data = petal.userData;
        const t = time + data.timeOffset;
        
        // Vertical fall with acceleration
        data.speed += PETAL_CONFIG.acceleration;
        petal.position.y -= data.speed;
        
        // Horizontal pendulum motion
        petal.position.x += Math.sin(t * data.sway.frequency + data.sway.phase) 
                          * data.sway.amplitude;
        
        // Spiral trajectory
        petal.position.x += Math.cos(t) * data.twist;
        petal.position.z += Math.sin(t) * data.twist;
        
        // Natural rotation
        petal.rotation.x += data.rotation.x;
        petal.rotation.y += data.rotation.y;
        petal.rotation.z += data.rotation.z;
        
        // Reset when below view
        if(petal.position.y < -12) {
            resetPetalPosition(petal);
            data.speed = PETAL_CONFIG.baseSpeed + Math.random() * PETAL_CONFIG.speedVariation;
        }
    });
}

function resetPetalPosition(petal) {
    petal.position.set(
        Math.random() * 8 - 4,
        10 + Math.random() * 5,
        Math.random() * 6 - 3
    );
    petal.userData.timeOffset = Math.random() * 1000;
}

async function getCorrectTexturePath() {
    const petalsExist = await checkPetalsTexture();
    return petalsExist ? 'assets/textures/petals.png' : 'assets/textures/petal.png';
}

export { initPetals, updatePetals };

import { HeartGeometry } from './heart-geometry.js';

let petals = [];

// Custom heart shape geometry
class HeartGeometry extends THREE.BufferGeometry {
    constructor(scale = 1) {
        super();
        // Vertex data for heart shape
        const vertices = new Float32Array([...]);
        this.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        // Add face indices...
    }
}

// Initialize petal system
export function initPetals() {
    const hasTexture = await checkPetalsTexture();
    hasTexture ? createTexturePetals() : createProceduralPetals();
}

async function checkPetalsTexture() {
    return await assetExists('assets/textures/petals.png') || 
           await assetExists('assets/textures/petal.png');
}

function createTexturePetals() {
    const texturePath = 'assets/textures/' + 
        (await assetExists('assets/textures/petals.png') ? 'petals.png' : 'petal.png');
    
    const texture = new THREE.TextureLoader().load(texturePath);
    const geometry = new THREE.PlaneGeometry(0.2, 0.3);

    for(let i = 0; i < 50; i++) {
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8
        });
        
        const petal = new THREE.Mesh(geometry, material);
        resetPetalPosition(petal);
        petal.userData = {
            speed: 0.015 + Math.random() * 0.01,
            rotationSpeed: THREE.MathUtils.degToRad(0.5 + Math.random() * 2)
        };
        
        petals.push(petal);
        scene.add(petal);
    }
}

function createProceduralPetals() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(150);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xff69b4,
        transparent: true
    });
    
    petals = new THREE.Points(geometry, material);
    scene.add(petals);
}

function updatePetals() {
    petals.forEach(petal => {
        petal.position.y -= petal.userData.speed;
        petal.rotation.z += petal.userData.rotationSpeed;
        
        if(petal.position.y < -5) {
            resetPetalPosition(petal);
        }
    });
}

function resetPetalPosition(petal) {
    petal.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 + 5,
        Math.random() * 10 - 5
    );
}

// Add to animation loop
function animate() {
    updatePetals();
    // Existing animation code...
}

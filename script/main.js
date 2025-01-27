import { initPetals, updatePetals } from './script/petals.js';
let scene, camera, renderer, model;
let usingDefaultModel = true;

// Base64 encoded heart texture
const heartTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAA...'); // Keep full base64 string from previous

async function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Model loading
    const hasCustomModel = await assetExists('assets/models/model.glb');
    
    if(hasCustomModel) {
        usingDefaultModel = false;
        new THREE.GLTFLoader().load('assets/models/model.glb', gltf => {
            model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            scene.add(model);
            document.getElementById('loading').style.display = 'none';
        });
    } else {
        createDefaultModel();
        document.getElementById('loading').style.display = 'none';
    }

    camera.position.z = 5;
    window.addEventListener('resize', onWindowResize);
    initPetals(scene);
}

function createDefaultModel() {
    const geometry = new THREE.HeartGeometry(1.5); // Use custom geometry from petals.js
    const material = new THREE.MeshPhongMaterial({
        map: heartTexture,
        transparent: true,
        opacity: 0.9
    });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
}

async function assetExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    updatePetals();
    requestAnimationFrame(animate);
    
    if(model) {
        const rotationSpeed = usingDefaultModel ? 0.02 : 0.005;
        model.rotation.y += rotationSpeed;
    }
    
    renderer.render(scene, camera);
}

// Initialize and start
init();
animate();

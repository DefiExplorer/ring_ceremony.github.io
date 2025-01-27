let renderer, scene, camera, petals = [];

function initPetals() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector('#petals-canvas')
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Petal parameters
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for(let i = 0; i < 200; i++) {
        vertices.push(
            Math.random() * 10 - 5,
            Math.random() * 10 + 5,
            Math.random() * 10 - 5
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xff69b4,
        transparent: true,
        opacity: 0.7
    });
    
    petals = new THREE.Points(geometry, material);
    scene.add(petals);
    
    camera.position.z = 15;
    document.getElementById('loading').style.display = 'none';
}

function animatePetals() {
    requestAnimationFrame(animatePetals);
    
    const positions = petals.geometry.attributes.position.array;
    for(let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.08;
        if(positions[i + 1] < -5) {
            positions[i + 1] = 15;
            positions[i] = Math.random() * 10 - 5;
        }
    }
    petals.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

// Initialize on window load
window.addEventListener('load', () => {
    initPetals();
    animatePetals();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

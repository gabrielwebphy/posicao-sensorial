import * as THREE from "three";

export default function Scene({ canvasRef, coordinates, rotation }) {
    let scene = new THREE.Scene();

    // Cria a câmera
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Cria o renderer
    let renderer = new THREE.WebGLRenderer(canvasRef);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Cria a geometria
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    let cube = new THREE.Mesh(geometry, material);
    let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe:true });
    let wiredCube = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(cube)
    scene.add(wiredCube)

    // Posiciona a câmera
    camera.position.z = 5;

    // Cria um loop de renderização
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        wiredCube.rotation.x += 0.01;
        wiredCube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

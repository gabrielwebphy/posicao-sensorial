import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

function ThreeScene({ x, y, z, quaternion }) {
    const containerRef = useRef(null)
    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(500, 500);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);

        // Cria a geometria
        let geometry = new THREE.BoxGeometry();
        let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        let cube = new THREE.Mesh(geometry, material);
        let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        let wiredCube = new THREE.Mesh(geometry, wireframeMaterial);
        console.log(quaternion);
        if (quaternion.isQuaternion) {
            cube.quaternion.copy(quaternion.normalize());
            wiredCube.quaternion.copy(quaternion.normalize());
        }
        else {
            console.log('oi');
        }
        scene.add(cube)
        scene.add(wiredCube)

        // Posiciona a câmera
        camera.position.x = 5;
        camera.position.y = 5;
        camera.position.z = 5;
        camera.lookAt(new THREE.Vector3(0, 0, 0))
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
        // Cria um loop de renderização
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate()
        return () => {
            containerRef.current.removeChild(renderer.domElement);
        };
    }, [x, y, z, quaternion])
    return (
        <div ref={containerRef}></div>
    )
}
export default ThreeScene
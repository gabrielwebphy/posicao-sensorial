import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

function ThreeScene({ x, y, z, quaternion }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(500, 500);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    let materials = [];
    for (let i = 0; i < 6; i++) {
      materials.push(new THREE.MeshStandardMaterial({ color: colors[i] }));
    }

    // Cria a geometria
    let geometry = new THREE.BoxGeometry(2,0.5,1);
    let cube = new THREE.Mesh(geometry, materials);
    let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    let wiredCube = new THREE.Mesh(geometry, wireframeMaterial);
    console.log(quaternion);
    if (quaternion.isQuaternion) {
      cube.quaternion.copy(quaternion.normalize());
      wiredCube.quaternion.copy(quaternion.normalize());
    } else {
      console.log("oi");
    }
    scene.add(cube);
    scene.add(wiredCube);

    // Posiciona a câmera
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    // Cria um loop de renderização
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    return () => {
      containerRef.current.removeChild(renderer.domElement);
    };
  }, [x, y, z, quaternion]);
  return <div ref={containerRef}></div>;
}
export default ThreeScene;

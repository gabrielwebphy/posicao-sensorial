import { Canvas } from '@react-three/fiber';
import * as THREE from "three";
import { OrbitControls } from '@react-three/drei';
import Box from './box';

export default function Scene({ x, y, z }) {
    return (
        <Canvas dpr={window.devicePixelRatio} camera={{ position: new THREE.Vector3(2, 2, 2) }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[x, y, z]}/>
            <color attach="background" args={["#06092c"]} />
            <OrbitControls />
            <axesHelper args={[25]} />
        </Canvas>
    );
}

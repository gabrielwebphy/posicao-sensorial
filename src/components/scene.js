import { Canvas } from '@react-three/fiber';
import * as THREE from "three";
import { OrbitControls } from '@react-three/drei';
import Box from './box';

export default function Scene({ coordinates, rotationAngle }) {
    return (
        <Canvas dpr={window.devicePixelRatio} camera={{ position: new THREE.Vector3(2, 2, 2) }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[coordinates.x, coordinates.y, coordinates.z]} rotation={[rotationAngle.x*Math.PI/180, rotationAngle.y*Math.PI/180, rotationAngle.z*Math.PI/180]}/>
            <color attach="background" args={["#06092c"]} />
            <OrbitControls />
            <gridHelper args={[20, 20, 0xff0000, 'teal']} position={[0,-1,0]}/>
        </Canvas>
    );
}

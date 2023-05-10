import { useEffect, useRef, useState } from 'react';
import useInterval from './components/useInterval';
import ThreeScene from './components/scene'
import './App.css';
import * as THREE from 'three'

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 })
  const [accelerations, setAccelerations] = useState({ x: 0, y: 0, z: 0 })
  const [velocities, setVelocities] = useState({ x: 0, y: 0, z: 0 })
  const [quaternion, setQuaternion] = useState([0, 0, 0, 0])
  const [movementStarted, setStart] = useState(false)
  const [initialAngles, setInitial] = useState({ x: 0, y: 0, z: 0 })
  const anglesRef = useRef(null)
  anglesRef.current = initialAngles
  const isMobile = navigator.userAgentData.mobile;

  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientation, true);
  }, [])

  // Handle device orientation data
  function handleOrientation(event) {
    const alpha = event.alpha || 0; // rotation around z-axis
    const beta = event.beta || 0;   // rotation around x-axis
    const gamma = event.gamma || 0; // rotation around y-axis

    // Convert Euler angles to quaternion
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    const c1 = Math.cos(alphaRad / 2);
    const s1 = Math.sin(alphaRad / 2);
    const c2 = Math.cos(betaRad / 2);
    const s2 = Math.sin(betaRad / 2);
    const c3 = Math.cos(gammaRad / 2);
    const s3 = Math.sin(gammaRad / 2);

    const w = c1 * c2 * c3 - s1 * s2 * s3;
    const x = s1 * s2 * c3 + c1 * c2 * s3;
    const y = s1 * c2 * c3 + c1 * s2 * s3;
    const z = c1 * s2 * c3 - s1 * c2 * s3;

    const magnitude = Math.sqrt(x * x + y * y + z * z + w * w);
    const quaternionObject = { x: x/magnitude, y: y/magnitude, z: z/magnitude, w: w/magnitude };
    const quaternionArray = [quaternionObject.x, quaternionObject.y, quaternionObject.z, quaternionObject.w];

    // Use the quaternion as needed
    console.log(quaternionObject);
    const quaternion = new THREE.Quaternion()
    quaternion.fromArray(quaternionArray)
    setQuaternion(quaternion)
  }

  function updateCoordinates() {
    if (movementStarted) {
    }
    else {

    }
  }

  useInterval(() => { updateCoordinates(coordinates.x, coordinates.y, coordinates.z, velocities.x, velocities.y, velocities.z, accelerations.x, accelerations.y, accelerations.z) }, 1000 / 60)

  return (
    <div className="app">
      <div>
        <div>
          <ThreeScene x={coordinates.x} y={coordinates.y} z={coordinates.z} quaternion={quaternion} />
          <button onClick={() => setStart(!movementStarted)}>{movementStarted ? 'Parar' : 'Iniciar'}</button>
          <div>aceleração horizontal<input value={accelerations.x} onChange={e => setAccelerations(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>aceleração vertical<input value={accelerations.y} onChange={e => setAccelerations(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>aceleração perpendicular<input value={accelerations.z} onChange={e => setAccelerations(prevState => { return { ...prevState, z: e.target.value } })} /></div>
        </div>
        <div>
          <div>Quatêrnio: {quaternion}</div>
          <div>Aceleração x: {accelerations.x}</div>
          <div>Aceleração y: {accelerations.y}</div>
          <div>Aceleração z: {accelerations.z}</div>

          <div>Posição x: {coordinates.x}</div>
          <div>Posição y: {coordinates.y}</div>
          <div>Posição z: {coordinates.z}</div>

          <div>Velocidade x: {velocities.x}</div>
          <div>Velocidade y: {velocities.y}</div>
          <div>Velocidade z: {velocities.z}</div>

          <div>Ângulo estabilização x: {initialAngles.x}</div>
          <div>Ângulo estabilização y: {initialAngles.y}</div>
          <div>Ângulo estabilização z: {initialAngles.z}</div>
        </div>
      </div>
    </div>
  );
}

export default App;

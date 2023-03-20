import { useEffect, useRef, useState } from 'react';
import useInterval from './components/useInterval';
import Scene from './components/scene';
import './App.css';

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 })
  const [accelerations, setAccelerations] = useState({ x: 0, y: 0, z: 0 })
  const [velocities, setVelocities] = useState({ x: 0, y: 0, z: 0 })
  const [rotationAngle, setAngle] = useState({ x: 0, y: 0, z: 0 })
  const [movementStarted, setStart] = useState(false)
  const [timeInterval, setTimeInterval] = useState(60)

  const isMobile = navigator.userAgentData.mobile;

  useEffect(() => {
    if (isMobile) {
      window.addEventListener("devicemotion", handleMotion);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }, [])

  function handleOrientation(event) {
    if (event.alpha) { setAngle({ x: event.alpha, y: event.beta, z: event.gamma }) }
  }

  function handleMotion(event) {
    if (event.acceleration) {
      setAccelerations({ x: event.acceleration.x, y: event.acceleration.y, z: event.acceleration.z })
      //setVelocities({ x: event.acceleration.x, y: event.acceleration.y, z: event.acceleration.z })
      setTimeInterval(event.interval)
    }
  }

  function updateCoordinates(x, y, z, vx, vy, vz, ax, ay, az, thetvx, thetvy, thetvz) {
    if (movementStarted) {
      const roll = thetvx / 180 * Math.PI;
      const pitch = thetvz / 180 * Math.PI;
      const yaw = thetvy / 180 * Math.PI;

      const newXVelocity = vx + ((ax * Math.cos(yaw) * Math.cos(pitch)) + (ay * (Math.sin(roll) * Math.sin(yaw) * Math.cos(pitch) - Math.cos(roll) * Math.sin(pitch))) + (az * (Math.cos(roll) * Math.sin(yaw) * Math.cos(pitch) + Math.sin(roll) * Math.sin(pitch)))) / timeInterval
      const newYVelocity = vy + ((ax * Math.cos(yaw) * Math.sin(pitch)) + (ay * (Math.sin(roll) * Math.sin(yaw) * Math.sin(pitch) + Math.cos(roll) * Math.cos(pitch))) + (az * (Math.cos(roll) * Math.sin(yaw) * Math.sin(pitch) - Math.sin(roll) * Math.cos(pitch)))) / timeInterval
      const newZVelocity = vz + ((-ax * Math.sin(yaw)) + (ay * Math.sin(roll) * Math.cos(yaw)) + (az * Math.cos(roll) * Math.cos(yaw))) / timeInterval
      setVelocities({ x: newXVelocity, y: newYVelocity, z: newZVelocity })

      const newX = x + newXVelocity / timeInterval
      const newY = y + newYVelocity / timeInterval
      const newZ = z + newZVelocity / timeInterval
      /*const newX = x + ((vx * Math.cos(yaw) * Math.cos(pitch)) + (vy * (Math.sin(roll) * Math.sin(yaw) * Math.cos(pitch) - Math.cos(roll) * Math.sin(pitch))) + (vz * (Math.cos(roll) * Math.sin(yaw) * Math.cos(pitch) + Math.sin(roll) * Math.sin(pitch)))) / timeInterval
      const newY = y + ((vx * Math.cos(yaw) * Math.sin(pitch)) + (vy * (Math.sin(roll) * Math.sin(yaw) * Math.sin(pitch) + Math.cos(roll) * Math.cos(pitch))) + (vz * (Math.cos(roll) * Math.sin(yaw) * Math.sin(pitch) - Math.sin(roll) * Math.cos(pitch)))) / timeInterval
      const newZ = z + ((-vx * Math.sin(yaw)) + (vy * Math.sin(roll) * Math.cos(yaw)) + (vz * Math.cos(roll) * Math.cos(yaw))) / timeInterval
      */
      setCoordinates({ x: newX, y: newY, z: newZ })
    }
    else {
      setCoordinates({ x: 0, y: 0, z: 0 })
      setVelocities({ x: 0, y: 0, z: 0 })
    }
  }

  useInterval(() => { updateCoordinates(coordinates.x, coordinates.y, coordinates.z, velocities.x, velocities.y, velocities.z, accelerations.x, accelerations.y, accelerations.z, rotationAngle.x, rotationAngle.y, rotationAngle.z,/*angle*Math.PI/180*/) }, 1000 / 60)

  return (
    <div className="app">
      <Scene coordinates={coordinates} rotationAngle={rotationAngle}/>
      <div>
        <div>
          <button onClick={() => setStart(!movementStarted)}>{movementStarted ? 'Parar' : 'Iniciar'}</button>
          <div>aceleração horizontal<input value={accelerations.x} onChange={e => setAccelerations(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>aceleração vertical<input value={accelerations.y} onChange={e => setAccelerations(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>aceleração perpendicular<input value={accelerations.z} onChange={e => setAccelerations(prevState => { return { ...prevState, z: e.target.value } })} /></div>
          <div>ângulo de rotação horizontal<input value={rotationAngle.x} onChange={e => setAngle(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>ângulo de rotação vertical<input value={rotationAngle.y} onChange={e => setAngle(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>ângulo de rotação perpendicular<input value={rotationAngle.z} onChange={e => setAngle(prevState => { return { ...prevState, z: e.target.value } })} /></div>
        </div>
        <div>
          <div>Aceleração x: {accelerations.x}</div>
          <div>Aceleração y: {accelerations.y}</div>
          <div>Aceleração z: {accelerations.z}</div>

          <div>ts: {timeInterval}</div>

          <div>Posição x: {coordinates.x}</div>
          <div>Posição y: {coordinates.y}</div>
          <div>Posição z: {coordinates.z}</div>

          <div>Velocidade x: {velocities.x}</div>
          <div>Velocidade y: {velocities.y}</div>
          <div>Velocidade z: {velocities.z}</div>

          <div>Ângulo x: {rotationAngle.x}</div>
          <div>Ângulo y: {rotationAngle.y}</div>
          <div>Ângulo z: {rotationAngle.z}</div>
        </div>
      </div>
    </div>
  );
}

export default App;

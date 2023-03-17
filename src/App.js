import { useEffect, useRef, useState } from 'react';
import useInterval from './components/useInterval';
import './App.css';

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 })
  const [accelerations, setAccelerations] = useState({ x: 0, y: 0, z: 0 })
  const [velocities, setVelocities] = useState({ x: 0, y: 0, z: 0 })
  const [rotationAngle, setAngle] = useState({ x: 0, y: 0, z: 0 })
  const [accelerometer, setAccelerometers] = useState({ x: 0, y: 0, z: 0 })
  const [gravitySensors, setGravity] = useState({ x: 0, y: 0, z: 0 })
  const [angularSensors, setAngular] = useState({ x: 0, y: 0, z: 0 })
  const [movementStarted, setStart] = useState(false)
  const [gyts, setts] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    const acl = new window.Accelerometer({ frequency: 60 });
    acl.addEventListener("reading", () => {
      setAccelerometers({ x: acl.x, y: acl.y, z: acl.z })
    });
    acl.start();

    const grs = new window.GravitySensor({ frequency: 60 });
    grs.addEventListener("reading", () => {
      setGravity({ x: grs.x, y: grs.y, z: grs.z })
    });
    grs.start();

    let gys = new window.Gyroscope({ frequency: 60 });

    gys.addEventListener("reading", (e) => {
      handleOrientation({ timeStamp: e.timeStamp, x: gys.x * 1.1023, y: gys.y * 1.1023, z: gys.z * 1.1023 })
      setts(e.timeStamp)
    });
    gys.start();

  }, [])

  function handleOrientation(angles) {
    // Get the current time
    const now = performance.now();
    // Integrate the angular velocities to obtain the orientation
    const alpha = angles.x % (2 * Math.PI)
    const beta = angles.y % (2 * Math.PI)
    const gamma = angles.z % (2 * Math.PI)
    setAngular(prevOrientation => ({
      x: prevOrientation.x + alpha / 60,
      y: prevOrientation.y + beta / 60,
      z: prevOrientation.z + gamma / 60
    }))
  }


  useEffect(() => {
    setAccelerations({ x: accelerometer.x - gravitySensors.x, y: accelerometer.y - gravitySensors.y, z: accelerometer.z - gravitySensors.z })
  }, [accelerometer, gravitySensors])

  useEffect(() => {
    setAngle({ ...angularSensors })
  }, [angularSensors])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let scaledBase = 20
    //let scaledBase = 20 * (1 - coordinates.z)
    //scaledBase = scaledBase <= 0 ? 0 : scaledBase
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save()
    ctx.translate(canvas.width / 2 - scaledBase / 2, canvas.height / 2 - scaledBase)
    ctx.fillStyle = 'rgba(134, 251, 207, 1)'
    ctx.beginPath()
    ctx.moveTo(coordinates.x, coordinates.y)
    ctx.lineTo(coordinates.x + scaledBase, coordinates.y)
    ctx.lineTo(coordinates.x + scaledBase / 2, coordinates.y + scaledBase * 2)
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }, [coordinates])

  function updateCoordinates(x, y, z, vx, vy, vz, ax, ay, az, thetax, thetay, thetaz) {
    if (movementStarted) {
      const xAngle = thetax * Math.PI / 180;
      const yAngle = thetay * Math.PI / 180;
      const zAngle = thetaz * Math.PI / 180;

      // Calculate velocities using kinematic equations
      const newXVelocity = vx + ax * Math.cos(yAngle) * Math.cos(zAngle) / 60
      const newYVelocity = vy + ax * Math.sin(zAngle) / 60 + ay * Math.cos(zAngle) * Math.sin(xAngle) / 60
      const newZVelocity = vz + -ax * Math.sin(yAngle) * Math.cos(zAngle) / 60 + az * Math.cos(yAngle) / 60

      // Output velocities
      //console.log(`Velocity x: ${vx}`);
      //console.log(`Velocity y: ${vy}`);
      //console.log(`Velocity z: ${vz}`);

      setVelocities({ x: newXVelocity, y: newYVelocity, z: newZVelocity })
      const newX = x + newXVelocity / 60
      const newY = y + newYVelocity / 60
      const newZ = z + newZVelocity / 60
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
      <canvas ref={canvasRef} width='350' height='350'></canvas>
      <div>
        <div>
          <button onClick={() => setStart(!movementStarted)}>{movementStarted ? 'Parar' : 'Iniciar'}</button>
          <div>aceleração vertical<input value={accelerations.y} onChange={e => setAccelerations(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>aceleração horizontal<input value={accelerations.x} onChange={e => setAccelerations(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>aceleração perpendicular para dentro<input value={accelerations.z} onChange={e => setAccelerations(prevState => { return { ...prevState, z: e.target.value } })} /></div>
          <div>ângulo de rotação vertical<input value={rotationAngle.y} onChange={e => setAngle(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>ângulo de rotação horizontal<input value={rotationAngle.x} onChange={e => setAngle(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>ângulo de rotação perpendicular<input value={rotationAngle.z} onChange={e => setAngle(prevState => { return { ...prevState, z: e.target.value } })} /></div>
        </div>
        <div>
          <div>Aceleração x: {accelerations.x}</div>
          <div>Aceleração y: {accelerations.y}</div>
          <div>Aceleração z: {accelerations.z}</div>

          <div>ts: {gyts}</div>

          <div>Posição x: {coordinates.x}</div>
          <div>Posição y: {coordinates.y}</div>
          <div>Posição z: {coordinates.z}</div>

          <div>Velocidade x: {velocities.x}</div>
          <div>Velocidade y: {velocities.y}</div>
          <div>Velocidade z: {velocities.z}</div>

          <div>Ângulo x: {rotationAngle.x}</div>
          <div>Ângulo y: {rotationAngle.y}</div>
          <div>Ângulo z: {rotationAngle.z}</div>

          <div>Aceleração celular x: {accelerometer.x}</div>
          <div>Aceleração celular y: {accelerometer.y}</div>
          <div>Aceleração celular z: {accelerometer.z}</div>

          <div>Gravidade celular x: {gravitySensors.x}</div>
          <div>Gravidade celular y: {gravitySensors.y}</div>
          <div>Gravidade celular z: {gravitySensors.z}</div>
        </div>
      </div>
    </div>
  );
}

export default App;

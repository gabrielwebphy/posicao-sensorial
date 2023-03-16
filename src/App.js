import { useEffect, useRef, useState } from 'react';
import useInterval from './components/useInterval';
import './App.css';

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 })
  const [accelerations, setAccelerations] = useState({ x: 0, y: 0, z: 0 })
  const [velocities, setVelocities] = useState({ x: 0, y: 0, z: 0 })
  const [rotationAngle, setAngle] = useState(0)
  const [accelerometer, setAccelerometers] = useState({ x: 0, y: 0, z: 0 })
  const [movementStarted, setStart] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const acl = new window.Accelerometer({ frequency: 60 });
    acl.addEventListener("reading", () => {
      setAccelerometers({ x: acl.x, y: acl.y, z: acl.z });
    });
    acl.start();
  }, [])

  useEffect(() => {
    setAccelerations({ ...accelerometer })
  }, [accelerometer])

  /*
  const triangleBase = 30;
  const triangleHeight = 60;
  const scalingFactor = 2
  
    useEffect(() => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const scaledBase = triangleBase / (scalingFactor * coordinates.z + 1);
      const scaledHeight = triangleHeight / (scalingFactor * coordinates.z + 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.fillStyle = 'rgba(134, 251, 207, 1)'
      ctx.rotate(rotationAngle * Math.PI / 180)
      ctx.beginPath()
      ctx.moveTo(coordinates.x, coordinates.y)
      ctx.lineTo(coordinates.x + scaledBase, coordinates.y)
      ctx.lineTo(coordinates.x + scaledBase / 2, coordinates.y + scaledHeight)
      ctx.fill()
      ctx.closePath()
      ctx.restore()
  
    }, [coordinates])
  */

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save()
    ctx.translate(canvas.width / 2 - 10, canvas.height / 2 - 20)
    ctx.fillStyle = 'rgba(134, 251, 207, 1)'
    ctx.beginPath()
    ctx.moveTo(coordinates.x, coordinates.y)
    ctx.lineTo(coordinates.x + 20, coordinates.y)
    ctx.lineTo(coordinates.x + 10, coordinates.y + 40)
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }, [coordinates])

  function updateCoordinates(x, y, z, vx, vy, vz, ax, ay, az) {
    if (movementStarted) {
      const newXVelocity = vx + ax / 60
      const newYVelocity = vy + ay / 60
      const newZVelocity = vz + az / 60
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

  useInterval(() => { updateCoordinates(coordinates.x, coordinates.y, coordinates.z, velocities.x, velocities.y, velocities.z, accelerations.x, accelerations.y, accelerations.z,/*angle*Math.PI/180*/) }, 1000 / 60)

  return (
    <div className="app">
      <canvas ref={canvasRef} width='350' height='350'></canvas>
      <div>
        <div>
          <button onClick={() => setStart(!movementStarted)}>{movementStarted ? 'Parar' : 'Iniciar'}</button>
          <div>aceleração vertical ou frontal<input value={accelerations.y} onChange={e => setAccelerations(prevState => { return { ...prevState, y: e.target.value } })} /></div>
          <div>aceleração horizontal ou lateral<input value={accelerations.x} onChange={e => setAccelerations(prevState => { return { ...prevState, x: e.target.value } })} /></div>
          <div>aceleração perpendicular para dentro<input value={accelerations.z} onChange={e => setAccelerations(prevState => { return { ...prevState, z: e.target.value } })} /></div>
          <div>ângulo de rotação<input value={rotationAngle} onChange={e => setAngle(e.target.value)} /></div>
        </div>
        <div>
          <div>Aceleração x: {accelerations.x}</div>
          <div>Aceleração y: {accelerations.y}</div>
          <div>Aceleração z: {accelerations.z}</div>
          <div>Velocidade x: {velocities.x}</div>
          <div>Velocidade y: {velocities.y}</div>
          <div>Velocidade z: {velocities.z}</div>
          <div>Posição x: {coordinates.x}</div>
          <div>Posição y: {coordinates.y}</div>
          <div>Posição z: {coordinates.z}</div>
          <div>Ângulo de rotação: {rotationAngle + '°'}</div>
          <div>Aceleração celular x: {accelerometer.x}</div>
          <div>Aceleração celular y: {accelerometer.y}</div>
          <div>Aceleração celular z: {accelerometer.z}</div>
        </div>
      </div>
    </div>
  );
}

export default App;

import { useEffect, useRef, useState } from 'react';
import useInterval from './components/useInterval';
import './App.css';

function App() {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
  const [accelerations, setAccelerations] = useState({ x: 0, y: 0 })
  const [velocities, setVelocities] = useState({ x: 0, y: 0 })
  const [rotationAngle, setAngle] = useState(0)
  const [movementStarted, setStart] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save()
    ctx.translate(290,290)
    ctx.fillStyle = 'rgba(134, 251, 207, 1)'
    ctx.rotate(rotationAngle * Math.PI / 180)
    ctx.beginPath()
    ctx.moveTo(coordinates.x, coordinates.y)
    ctx.lineTo(coordinates.x+30, coordinates.y)
    ctx.lineTo(coordinates.x+15, coordinates.y+45)
    ctx.moveTo(coordinates.x, coordinates.y)
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }, [coordinates])

  function updateCoordinates(x, y, vx, vy, ax, ay) {
    if (movementStarted) {
      const newXVelocity = vx + ax / 60
      const newYVelocity = vy + ay / 60
      setVelocities({ x: newXVelocity, y: newYVelocity })
      const newX = x + newXVelocity / 60
      const newY = y + newYVelocity / 60
      setCoordinates({ x: newX, y: newY })
    }
    else {
      setCoordinates({ x: 0, y: 0 })
      setVelocities({ x: 0, y: 0 })
    }
  }

  useInterval(() => { updateCoordinates(coordinates.x, coordinates.y, velocities.x, velocities.y, accelerations.x, accelerations.y, /*angle*Math.PI/180*/) }, 1000 / 60)

  return (
    <div className="app">
      <canvas ref={canvasRef} width='600' height='600'></canvas>
      <div>
        <button onClick={() => setStart(!movementStarted)}>{movementStarted ? 'Parar' : 'Iniciar'}</button>
        <div>aceleração horizontal ou lateral<input value={accelerations.x} onChange={e => setAccelerations(prevState => { return { ...prevState, x: e.target.value } })} /></div>
        <div>aceleração vertical ou frontal<input value={accelerations.y} onChange={e => setAccelerations(prevState => { return { ...prevState, y: e.target.value } })} /></div>
        <div>ângulo de rotação<input value={rotationAngle} onChange={e => setAngle(e.target.value)} /></div>
      </div>
      <div>{accelerations.x}</div>
      <div>{accelerations.y}</div>
      <div>{velocities.x}</div>
      <div>{velocities.y}</div>
      <div>{coordinates.x}</div>
      <div>{coordinates.y}</div>
      <div>{rotationAngle + '°'}</div>
    </div>
  );
}

export default App;

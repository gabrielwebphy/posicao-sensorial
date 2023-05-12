window.addEventListener("deviceorientation", handleOrientation, true);
window.addEventListener("devicemotion", handleMotion, true);
const button = document.getElementById("botao");
button.addEventListener("click", iniciarMovimento);
const axDisplay = document.getElementById("ax");
let movementRegister = true;
let frameCount = 0;
const ayDisplay = document.getElementById("ay");
const azDisplay = document.getElementById("az");
let fps = document.getElementById("fps");
let movementStarted = false;
let lastTimestamp = 0;

function iniciarMovimento() {
  movementStarted = !movementStarted;
  button.innerHTML = movementStarted ? "Parar movimento" : "Iniciar movimento";
}

let cubeData = {
  x: 0,
  y: 0,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
};

// Handle device motion data
function handleMotion(event) {
  lastTimestamp = event.timestamp;
  if (movementRegister) {
    frameCount++;
  } else {
    fps.innerHTML = frameCount + " i/s";
    movementRegister = true;
    frameCount = 0;
  }
  if (!movementStarted) {
    return;
  }
  const ax = event ? event.acceleration.x : 0;
  const ay = event ? event.acceleration.y : 0;
  const az = event ? event.acceleration.z : 0;

  axDisplay.innerHTML = ax;
  ayDisplay.innerHTML = ay;
  azDisplay.innerHTML = az;

  const accel = new THREE.Vector3(ax, ay, az);
  accel.applyQuaternion(quart.normalize());
  let timeDivision = 1000 / (event.timestamp - lastTimestamp);

  cubeData.vx += accel.x / timeDivision;
  cubeData.vy += accel.y / timeDivision;
  cubeData.vz += accel.z / timeDivision;

  cubeData.vx = accel.x === 0 ? 0 : cubeData.vx;
  cubeData.vy = accel.y === 0 ? 0 : cubeData.vy;
  cubeData.vz = accel.z === 0 ? 0 : cubeData.vz;

  cubeData.x += cubeData.vx / timeDivision;
  cubeData.y += cubeData.vy / timeDivision;
  cubeData.z += cubeData.vz / timeDivision;
}
setInterval(() => {
  movementRegister = false;
}, 1000);
let quart = new THREE.Quaternion();

// Handle device orientation data
function handleOrientation(event) {
  console.log(event);
  const alpha = event.alpha || 0; // rotation around z-axis
  const beta = event.beta || 0; // rotation around x-axis
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
  const quaternionObject = { x: x / magnitude, y: y / magnitude, z: z / magnitude, w: w / magnitude };
  const quaternionArray = [quaternionObject.x, quaternionObject.y, quaternionObject.z, quaternionObject.w];

  const quaternion = new THREE.Quaternion();
  quaternion.fromArray(quaternionArray);
  quart = quaternion.normalize();
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const aspect = size.width / size.height;
const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.z = 0;
camera.position.y = 0;
camera.position.x = -0.2;
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const threeCanvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas: threeCanvas,
  alpha: true,
});
renderer.setSize(size.width, size.height);
// const grid = new THREE.GridHelper(50, 30);
// scene.add(grid);
const axes = new THREE.AxesHelper(10);
scene.add(axes);
const controls = new THREE.OrbitControls(camera, threeCanvas);

let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
let materials = [];
for (let i = 0; i < 6; i++) {
  materials.push(new THREE.MeshStandardMaterial({ color: colors[i] }));
}

// Cria a geometria
let geometry = new THREE.BoxGeometry(0.16, 0.01, 0.07);
let cube = new THREE.Mesh(geometry, materials);
let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
let wiredCube = new THREE.Mesh(geometry, wireframeMaterial);

scene.add(cube);
scene.add(wiredCube);

const animate = () => {
  controls.update();
  cube.position.set(cubeData.x, cubeData.y, cubeData.z);
  wiredCube.position.set(cubeData.x, cubeData.y, cubeData.z);
  cube.quaternion.copy(quart.normalize());
  wiredCube.quaternion.copy(quart.normalize());
  renderer.render(scene, camera);
};

setInterval(animate, 1000 / 60);

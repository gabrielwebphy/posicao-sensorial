window.addEventListener("deviceorientation", handleOrientation, true);
window.addEventListener("devicemotion", handleMotion, true);
const button = document.getElementById("botao");
button.addEventListener("click", iniciarMovimento);
const axDisplay = document.getElementById("ax");
let movementRegister = true;
let frameCount = 0;
const ayDisplay = document.getElementById("ay");
const azDisplay = document.getElementById("az");
const vxDisplay = document.getElementById("vx");
const vyDisplay = document.getElementById("vy");
const vzDisplay = document.getElementById("vz");
const xDisplay = document.getElementById("x");
const yDisplay = document.getElementById("y");
const zDisplay = document.getElementById("z");
const ts = document.getElementById("ts");
let fps = document.getElementById("fps");
let movementStarted = false;
let lastFrameCount = 0;
let lastTimestamp = 0;

let kalmanFilters = {
  kfx: new KalmanFilter({R: 0.001, Q:0.01}),
  kfy: new KalmanFilter({R: 0.001, Q:0.01}),
  kfz: new KalmanFilter({R: 0.001, Q:0.01}),
}

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
  if (movementRegister) {
    frameCount++;
  } else {
    fps.innerHTML = frameCount + " i/s";
    movementRegister = true;
    lastFrameCount = frameCount;
    frameCount = 0;
  }

  const ax = event ? kalmanFilters.kfx.filter(event.acceleration.y) : 1;
  const ay = event ? kalmanFilters.kfy.filter(event.acceleration.z) : 0;
  const az = event ? kalmanFilters.kfz.filter(event.acceleration.x) : 0;

  if (!movementStarted) {
    return;
  }

  axDisplay.innerHTML = ax;
  ayDisplay.innerHTML = ay;
  azDisplay.innerHTML = az;
  vxDisplay.innerHTML = cubeData.vx;
  vyDisplay.innerHTML = cubeData.vy;
  vzDisplay.innerHTML = cubeData.vz;
  xDisplay.innerHTML = cubeData.x;
  yDisplay.innerHTML = cubeData.y;
  zDisplay.innerHTML = cubeData.z;

  const accel = new THREE.Vector3(ax, ay, az);
  accel.applyQuaternion(quart);

  cubeData.vx += accel.x * 0.016;
  cubeData.vy += accel.y * 0.016;
  cubeData.vz += accel.z * 0.016;

  cubeData.x += Math.abs(ax) <= 0.05 ? 0 : cubeData.vx * 0.016;
  cubeData.z += Math.abs(az) <= 0.05 ? 0 : cubeData.vz * 0.016;

  arrowHelper.setLength(accel.length())
  arrowHelper.setDirection(accel.normalize())
  arrowHelper.position.set(new THREE.Vector3(cubeData.x, cubeData.y, cubeData.z))
}
setInterval(() => {
  movementRegister = false;
}, 1000);

let quart = new THREE.Quaternion();

// Handle device orientation data
function handleOrientation(event) {
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
const lineMaterial = new THREE.LineBasicMaterial({color : 0x26f7fd})
const redLineMaterial = new THREE.LineBasicMaterial({color : 0xff0000})
const purpleLineMaterial = new THREE.LineBasicMaterial({color : 0xaa00ff})

scene.background = new THREE.Color(0x000000);
const points = [
  new THREE.Vector3(-0.3,0,-0.3),
  new THREE.Vector3(-0.3,0,-0.9),
  new THREE.Vector3(0.3,0,-0.9),
  new THREE.Vector3(0.3,0,-0.3),
  new THREE.Vector3(0.9,0,-0.3),
  new THREE.Vector3(0.9,0,-0.9),
  new THREE.Vector3(0.9,0,0.3),
  new THREE.Vector3(0.3,0,0.3),
  new THREE.Vector3(1.5,0,0.3),
  new THREE.Vector3(1.5,0,-0.3),
  new THREE.Vector3(0.9,0,-0.3),
  new THREE.Vector3(0.9,0,-0.9),
  new THREE.Vector3(1.5,0,-0.9),

  new THREE.Vector3(0.3,0,-0.9),
  new THREE.Vector3(0.3,0,-0.3),
  new THREE.Vector3(1.5,0,-0.3),
  new THREE.Vector3(1.5,0,0.3),
  new THREE.Vector3(2.1,0,0.3),
  new THREE.Vector3(2.1,0,-0.3),

];
const points2 = [
  new THREE.Vector3(0.3,0,0.3),
  new THREE.Vector3(0.3,0,-0.3),
  new THREE.Vector3(-0.3,0,-0.3),
  new THREE.Vector3(-0.3,0,0.3),
  new THREE.Vector3(0.3,0,0.3),
];
const points3 = [
  new THREE.Vector3(2.1,0,-0.3),
  new THREE.Vector3(2.1,0,-0.9),
  new THREE.Vector3(1.5,0,-0.9),
  new THREE.Vector3(1.5,0,-0.3),
  new THREE.Vector3(2.1,0,-0.3),
];
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
const lineGeometry3 = new THREE.BufferGeometry().setFromPoints(points3); 
const newLine = new THREE.Line(lineGeometry, lineMaterial);
const startLine = new THREE.Line(lineGeometry2, redLineMaterial);
const endLine = new THREE.Line(lineGeometry3, purpleLineMaterial);
scene.add(newLine, startLine, endLine);

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const aspect = size.width / size.height;
const camera = new THREE.PerspectiveCamera(102, aspect);
camera.position.z = -0.3;
camera.position.y = 1.25;
camera.position.x = -0.2;
camera.lookAt(new THREE.Vector3(0.6,0,-0.3))
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
//scene.add(axes);
//const controls = new THREE.OrbitControls(camera, threeCanvas);

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
const dir = new THREE.Vector3( 1, 2, 0 );

//normalize the direction vector (convert to vector of length 1)
dir.normalize();

let origin = new THREE.Vector3( 0, 0, 0 );
let length = 0;

const arrowHelper = new THREE.ArrowHelper( dir, origin, length, 0xffffff );
scene.add( arrowHelper );

const animate = () => {
  cube.position.set(cubeData.x, cubeData.y, cubeData.z);
  wiredCube.position.set(cubeData.x, cubeData.y, cubeData.z);
  cube.quaternion.copy(quart);
  wiredCube.quaternion.copy(quart);
  handleMotion()
  renderer.render(scene, camera);
};

setInterval(animate, 1000 / 60);

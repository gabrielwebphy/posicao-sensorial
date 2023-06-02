import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
let materials = [];
for (let i = 0; i < colors.length; i++) {
  materials.push(new THREE.MeshBasicMaterial({ color: colors[i] }));
}
let geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
let transparent = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.25, color: 0x00ff00 });
let wireframe = new THREE.MeshStandardMaterial({ wireframe: true, color: 0x00ff00 });
let scene = new THREE.Scene();
let allObjects = [];
let arObject = new THREE.Mesh(geometry, materials);
let worldQuaternion = new THREE.Quaternion();
let worldPosition = new THREE.Vector3();
let calibrateMode = true;

const firebaseConfig = {
  apiKey: "AIzaSyAMZuXaEq8himScCF7JyyNV3TCtl76TR7c",
  authDomain: "posicao-sensorial.firebaseapp.com",
  databaseURL: "https://posicao-sensorial-default-rtdb.firebaseio.com",
  projectId: "posicao-sensorial",
  storageBucket: "posicao-sensorial.appspot.com",
  messagingSenderId: "880971324399",
  appId: "1:880971324399:web:c16bf72ba5aaa73949b41a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const objectsRef = ref(database, "sala1/objects");
onValue(objectsRef, (snapshot) => {
  allObjects.forEach((obj) => {
    scene.remove(obj);
  });
  const data = snapshot.val();
  allObjects = [];
  Object.entries(data).forEach((objArray) => {
    const objData = objArray[1];
    drawCube(objData);
    allObjects.push(newCube);
  });
});

const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
let xrButton = document.getElementById("ar-button");
let SSButton = document.getElementById("ss-button");
let calibrateButton = document.getElementById("calibrate-button");
let xrSession = null;
let xrRefSpace = null;
let xrViewerSpace = null;
let gl = null;
let binding = null;
let renderer = null;
let screenshotCapture = false;
let camera = new THREE.PerspectiveCamera();
let reticle = null;
let calibrateReticle = null;
let reticleWireframe = null;
let xrHitTestSource = null;

SSButton.addEventListener("click", downloadImage);
calibrateButton.addEventListener("click", changeCalibrationMode);

function drawCube(data) {
  const newCube = arObject.clone();
  let quaternion = new THREE.Quaternion().fromArray([data.quaternion.x, data.quaternion.y, data.quaternion.z, data.quaternion.w]);
  newCube.position.set(data.position.x - worldPosition.x, data.position.y - worldPosition.y, data.position.z - worldPosition.z);
  newCube.quaternion.copy(worldQuaternion.multiply(quaternion));
  scene.add(newCube);
}

// Função para virar a imagem da câmera verticalmente (ela vem invertida)
function flipImageVertically(imageData) {
  const { width, height, data } = imageData;

  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width; x++) {
      const topPixelIndex = (y * width + x) * 4;
      const bottomPixelIndex = ((height - y - 1) * width + x) * 4;

      swapPixels(data, topPixelIndex, bottomPixelIndex);
    }
  }
}
function swapPixels(data, indexA, indexB) {
  for (let i = 0; i < 4; i++) {
    const temp = data[indexA + i];
    data[indexA + i] = data[indexB + i];
    data[indexB + i] = temp;
  }
}

function checkSupportedState() {
  navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
    if (supported) {
      xrButton.innerHTML = "Começar WebXR";
    } else {
      xrButton.innerHTML = "AR não achado";
    }
    xrButton.disabled = !supported;
  });
}

// Assim que o website é aberto
function initXR() {
  if (navigator.xr) {
    xrButton.addEventListener("click", onButtonClicked);
    navigator.xr.addEventListener("devicechange", checkSupportedState);
    checkSupportedState();
  }
}

// Quando o botão de começar é clicado
function onButtonClicked() {
  if (!xrSession) {
    navigator.xr
      .requestSession("immersive-ar", {
        requiredFeatures: ["camera-access", "hit-test", "local"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById("overlay") },
      })
      .then(onSessionStarted, onRequestSessionError);
  } else {
    xrSession.end();
  }
}

// Quando a sessão AR é iniciada
function onSessionStarted(session) {
  xrSession = session;
  xrButton.innerHTML = "Parar WebXR";
  session.addEventListener("end", onSessionEnded);
  session.addEventListener("select", onTouch);
  let canvas = document.createElement("canvas");
  gl = canvas.getContext("webgl", {
    xrCompatible: true,
  });
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
  
  const points = [
    new THREE.Vector3( - 0.1, 0, -0.1 ),
    new THREE.Vector3( 0.1, 0, -0.1 ),
    new THREE.Vector3( 0.1, 0, 0.1 ),
    new THREE.Vector3(  -0.1, 0, 0.1 ),
    new THREE.Vector3( - 0.1, 0, -0.1 ),
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  calibrateReticle = new THREE.Line( geometry, material );
  reticle = new THREE.Mesh(geometry, transparent);
  reticleWireframe = new THREE.Mesh(geometry, wireframe);
  reticle.visible = false;
  reticleWireframe.visible = false;
  scene.add(reticle, reticleWireframe, calibrateReticle);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl,
  });
  renderer.autoClear = false;
  camera.matrixAutoUpdate = false;
  binding = new XRWebGLBinding(session, gl);
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });
  session.requestReferenceSpace("viewer").then((refSpace) => {
    xrViewerSpace = refSpace;
    session.requestHitTestSource({ space: xrViewerSpace }).then((hitTestSource) => {
      xrHitTestSource = hitTestSource;
    });
  });
  session.requestReferenceSpace("local").then((refSpace) => {
    xrRefSpace = refSpace;
    session.requestAnimationFrame(onXRFrame); // Chamando a função a cada frame
  });
}

function onRequestSessionError(ex) {
  alert("A sessão AR falhou.");
  console.error(ex.message);
}

function onSessionEnded(event) {
  xrHitTestSource = null;
  xrSession = null;
  xrButton.innerHTML = "Começar WebXR";
  gl = null;
}

function downloadImage() {
  screenshotCapture = true;
}

// Função que roda a cada frame
function onXRFrame(time, frame) {
  renderer.render(scene, camera);
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

  let pose = frame.getViewerPose(xrRefSpace);
  reticle.visible = false;
  calibrateReticle.visible = false;
  reticleWireframe.visible = false;
  if (pose) {
    if (xrHitTestSource) {
      let hitTestResults = frame.getHitTestResults(xrHitTestSource);
      if (hitTestResults.length > 0) {
        let target = hitTestResults[0].getPose(xrRefSpace);
        let newMatrix = new THREE.Matrix4().fromArray(target.transform.matrix);
        let quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(newMatrix);
        let position = new THREE.Vector3();
        position.setFromMatrixPosition(newMatrix);
        if (calibrateMode) {
          calibrateReticle.visible = true;
          calibrateReticle.position.copy(position);
          calibrateReticle.quaternion.copy(quaternion);
        } else {
          reticle.visible = true;
          reticleWireframe.visible = true;
          reticle.position.copy(position);
          reticle.quaternion.copy(quaternion);
          reticleWireframe.position.copy(position);
          reticleWireframe.quaternion.copy(quaternion);
        }
      }
    }

    const firstView = pose.views[0];
    const viewport = session.renderState.baseLayer.getViewport(firstView);
    renderer.setSize(viewport.width, viewport.height);

    camera.matrix.fromArray(firstView.transform.matrix);
    camera.projectionMatrix.fromArray(firstView.projectionMatrix);
    camera.updateMatrixWorld(true);

    for (let view of pose.views) {
      if (view.camera && screenshotCapture) {
        const cameraTexture = binding.getCameraImage(view.camera);
        createImageFromTexture(gl, cameraTexture, view.camera.width, view.camera.height);
        screenshotCapture = false;
      }
    }
    const p = pose.transform.position;
    xCoord.innerHTML = "x: " + p.x.toFixed(4);
    yCoord.innerHTML = "y: " + p.y.toFixed(4);
    zCoord.innerHTML = "z: " + p.z.toFixed(4);
  } else {
    xCoord.innerHTML = "No pose";
    yCoord.innerHTML = "No pose";
    zCoord.innerHTML = "No pose";
  }
}

function onTouch() {
  if(calibrateMode){
    calibrateWorld()
  }
  else{
    addCube()
  }
}

function calibrateWorld(){
  if(calibrateReticle.visible){
    worldPosition = calibrateReticle.position
    worldQuaternion = calibrateReticle.quaternion
    allObjects.forEach(obj => {
      scene.remove(obj);
      drawCube(obj)
    })
  }
}

function addCube() {
  if (reticle.visible) {
    set(ref(database, "sala1/objects/" + String(Math.floor(Math.random() * 100000))), {
      position: { x: reticle.position.x, y: reticle.position.y, z: reticle.position.z },
      quaternion: { w: reticle.quaternion.w, x: reticle.quaternion.x, y: reticle.quaternion.y, z: reticle.quaternion.z },
    });
  }
}

// Passar a textura WebGL para imagem para mostrar no celular
function createImageFromTexture(gl, texture, width, height) {
  let framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  let data = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

  gl.deleteFramebuffer(framebuffer);

  myCanvas.width = width;
  myCanvas.height = height;

  let imageData = ctx.createImageData(width, height);
  imageData.data.set(data);
  flipImageVertically(imageData);
  ctx.putImageData(imageData, 0, 0);
}

function changeCalibrationMode() {
  calibrateMode = !calibrateMode;
  calibrateButton.innerHTML = calibrateMode ? "Calibrar posição" : "Alternar para calibração";
}

initXR();

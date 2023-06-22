import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const video = document.getElementById("video1");
const videoTexture = new THREE.VideoTexture(video);
// Possível solução do bug do vídeo sem tirar acesso à câmera: Inicializar vídeo junto com a cena do three (quando webxr for iniciado)
let transparent = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.25, color: 0x00ff00 });
let wireframe = new THREE.MeshStandardMaterial({ wireframe: true, color: 0x00ff00 });
let scene = new THREE.Scene();
let allRawObjects = [];
let allSceneObjects = [];
const geometry = new THREE.BoxGeometry(0.34, 0.01, 0.48)
const transparentMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1 });
const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture }); //side: THREE.DoubleSide });

const materials = [
  transparentMaterial, // Face 0 (front)
  transparentMaterial, // Face 1 (back)
  videoMaterial, // Face 2 (top)
  transparentMaterial, // Face 3 (bottom)
  transparentMaterial, // Face 4 (right)
  transparentMaterial, // Face 5 (left)
];


let arObject = new THREE.Mesh(geometry, materials);
arObject.name = "videoplane";
let worldQuaternion = new THREE.Quaternion().identity();
let worldPosition = new THREE.Vector3();
let calibrateMode = true;
let worldYRotation = 0

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
  allSceneObjects.forEach((obj) => {
    scene.remove(obj);
  });
  const data = snapshot.val();
  allRawObjects = [];
  allSceneObjects = [];
  Object.entries(data).forEach((objArray) => {
    const objData = objArray[1];
    const newCube = arObject.clone();
    let rawQuaternion = new THREE.Quaternion().fromArray([objData.quaternion.x, objData.quaternion.y, objData.quaternion.z, objData.quaternion.w]);
    let rawPosition = new THREE.Vector3(objData.position.x, objData.position.y, objData.position.z);
    newCube.position.copy(rawPosition);
    newCube.quaternion.copy(rawQuaternion);
    allRawObjects.push(newCube);
  });
  allRawObjects.forEach((obj) => {
    const newCube = obj.clone();
    let offsetQuaternion = newCube.quaternion.clone().multiply(worldQuaternion);
    let offsetPosition = newCube.position.clone().applyQuaternion(worldQuaternion).add(worldPosition);
    newCube.quaternion.copy(offsetQuaternion);
    newCube.position.copy(offsetPosition);
    allSceneObjects.push(newCube);
    scene.add(newCube);
  });
});

const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const pauseButton = document.getElementById("pause-button")
let worldScale = new THREE.Vector3(1,1,1)
const rotateButton = document.getElementById("rotate-button")
pauseButton.addEventListener('click', onPause)
const ctx = myCanvas.getContext("2d");
let xrButton = document.getElementById("ar-button");
//let SSButton = document.getElementById("ss-button");
let calibrateButton = document.getElementById("calibrate-button");
let addButton = document.getElementById('add-button')
let xrSession = null;
let xrRefSpace = null;
let xrViewerSpace = null;
let gl = null;
let binding = null;
let renderer = null;
let intersections = [];
let screenshotCapture = false;
let camera = new THREE.PerspectiveCamera();
let reticle = null;
let calibrateReticle = null;
let reticleWireframe = null;
let xrHitTestSource = null;
let marker = null;
rotateButton.addEventListener('click', adjustYRotation)
//SSButton.addEventListener("click", downloadImage);
addButton.addEventListener('click', onTouch)
calibrateButton.addEventListener("click", changeCalibrationMode);

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
        requiredFeatures: [/*"camera-access",*/ "hit-test", "local"],
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
  //session.addEventListener("select", onTouch);
  let canvas = document.createElement("canvas");
  gl = canvas.getContext("webgl", {
    xrCompatible: true,
  });
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });

  const points = [new THREE.Vector3(-0.1, 0, -0.1), new THREE.Vector3(0.1, 0, -0.1), new THREE.Vector3(0.1, 0, 0.1), new THREE.Vector3(-0.1, 0, 0.1), new THREE.Vector3(-0.1, 0, -0.1)];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  marker = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5, color: 0xff00ff }));
  marker.position.y = 0.25;
  scene.add(marker);
  calibrateReticle = new THREE.Line(lineGeometry, material);
  reticle = new THREE.Mesh(geometry, transparent);
  reticleWireframe = new THREE.Mesh(geometry, wireframe);
  reticle.visible = false;
  reticleWireframe.visible = false;
  calibrateReticle.visible = false;
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
  //raycaster = new THREE.Raycaster().setFromCamera(new THREE.Vector2(0, 0), camera);

  //binding = new XRWebGLBinding(session, gl);
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
  //intersections = raycaster.intersectObjects(scene.children, true);
  if (pose) {
    if (xrHitTestSource) {
      let hitTestResults = frame.getHitTestResults(xrHitTestSource);
      if (hitTestResults.length > 0) {
        let target = hitTestResults[0].getPose(xrRefSpace);
        let newMatrix = new THREE.Matrix4().fromArray(target.transform.matrix);
        let quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(newMatrix);
        //quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), worldYRotation))
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

    //for (let view of pose.views) {
    //if (view.camera && screenshotCapture) {
    //const cameraTexture = binding.getCameraImage(view.camera);
    //createImageFromTexture(gl, cameraTexture, view.camera.width, view.camera.height);
    //screenshotCapture = false;
    //}
    //}
    const p = pose.transform.position;
    xCoord.innerHTML = "x: " + (p.x - worldPosition.x).toFixed(4);
    yCoord.innerHTML = "y: " + (p.y - worldPosition.y).toFixed(4);
    zCoord.innerHTML = "z: " + (p.z - worldPosition.z).toFixed(4);
  } else {
    xCoord.innerHTML = "No pose";
    yCoord.innerHTML = "No pose";
    zCoord.innerHTML = "No pose";
  }
}

function onPause(){
  if (!video.paused) {
    video.pause();
  }
  else{
    video.play()
  }
}

function onTouch() {
  if (intersections.length) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.name === "videoplane") {
      if (!videoElement.paused) {
        video.pause();
      } else {
        video.play();
      }
    }
  }
  if (calibrateMode) {
    calibrateWorld();
  } else {
    addCube();
  }
}

function calibrateWorld() {
  if (calibrateReticle.visible) {
    let referenceMatrix = new THREE.Matrix4().compose(worldPosition, worldQuaternion, worldScale)
    marker.matrix.copy(referenceMatrix);
    allSceneObjects.forEach((obj) => {
      scene.remove(obj);
    });
    allSceneObjects = [];
    allRawObjects.forEach((obj) => {
      const newCube = obj.clone();
      let offsetMatrix = new THREE.Matrix4().compose(newCube.position, newCube.quaternion, newCube.scale)
      offsetMatrix.multiply(referenceMatrix)
      newCube.matrix.copy(offsetMatrix);
      allSceneObjects.push(newCube);
      scene.add(newCube);
    });
  }
}

function addCube() {
  // todo: salvar posição do cubo ajustada sem o quatérnio global
  if (reticle.visible) {
    let originalQuaternion = reticle.quaternion.clone().multiply(worldQuaternion.clone().conjugate())
    let originalPosition = reticle.position.clone().sub(worldPosition).applyQuaternion(worldQuaternion.clone().conjugate());
    set(ref(database, "sala1/objects/00001"), { //+ String(Math.floor(Math.random() * 100000))), {
      position: { x: originalPosition.x, y: originalPosition.y, z: originalPosition.z },
      quaternion: { w: originalQuaternion.w, x: originalQuaternion.x, y: originalQuaternion.y, z: originalQuaternion.z },
    });
  }
}

function adjustYRotation(){
  worldYRotation += Math.PI/18
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
  calibrateButton.innerHTML = calibrateMode ? "Modo atual: Calibração" : "Modo atual: Adicionar cubos";
}

initXR();

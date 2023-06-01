const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
let cubeButton = document.getElementById("cube-button")
cubeButton.addEventListener('click', addCube)
let xrButton = document.getElementById("ar-button");
let SSButton = document.getElementById("ss-button");
let xrSession = null;
let xrRefSpace = null;
let xrViewerSpace = null;
let gl = null;
let binding = null;
let renderer = null;
let screenshotCapture = false;
let camera = null;
let scene = null;
let cube = null;
let sphere = null;
let loader = null;
let arObject = null
let reticle = null;
let xrHitTestSource = null;
let raycaster = new THREE.Raycaster();

SSButton.addEventListener("click", downloadImage);

// Função para virar a imagem da câmera verticalmente (ela vem invertida)
function flipImageVertically(imageData) {
  const { width, height, data } = imageData;

  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width; x++) {
      const topPixelIndex = (y * width + x) * 4;
      const bottomPixelIndex = ((height - y - 1) * width + x) * 4;

      // Swap the pixel values for R, G, B, and A channels
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

  let canvas = document.createElement("canvas");
  gl = canvas.getContext("webgl", {
    xrCompatible: true,
  });
  scene = new THREE.Scene();

  let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  let materials = [];
  for (let i = 0; i < colors.length; i++) {
    materials.push(new THREE.MeshBasicMaterial({ color: colors[i] }));
  }
  let geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  arObject = new THREE.Mesh(geometry, materials);
  let transparent = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.4, color: 0x00ff00 })
  reticle = new THREE.Mesh(geometry, transparent)

  camera = new THREE.PerspectiveCamera();
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
  session.requestReferenceSpace('viewer').then((refSpace) => {
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
  renderer.render(scene, camera)
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

  let pose = frame.getViewerPose(xrRefSpace);
  reticle.visible = false

  if (pose) {
    if (xrHitTestSource) {
      let hitTestResults = frame.getHitTestResults(xrHitTestSource);
      if (hitTestResults.length > 0) {
        console.log('tem hit');
        let target = hitTestResults[0].getPose(xrRefSpace);
        reticle.visible = true;
        reticle.matrix = new THREE.Matrix3();
        console.log(target.transform.matrix);
        reticle.matrix.copy(target.transform.matrix);
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

function addARObjectAt(matrix) {
  let newCube = arObject.clone();
  newCube.visible = true;
  newCube.matrix = matrix;
  scene.add(newCube);
}
function addCube() {
  console.log(reticle);
  if (reticle.visible) {
    console.log('oi');
    addARObjectAt(reticle.matrix);
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

initXR();
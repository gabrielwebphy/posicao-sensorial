const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
let xrButton = document.getElementById("ar-button");
let SSButton = document.getElementById("ss-button");
let xrSession = null;
let xrRefSpace = null;
let gl = null;
let binding = null;
let renderer = null;
let screenshotCapture = false;
let camera = null;
let scene = null;
let cube = null;
const loader = new GLTFLoader();

SSButton.addEventListener("click", downloadImage);

function checkSupportedState() {
  navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
    if (supported) {
      xrButton.innerHTML = "Start Hello WebXR";
    } else {
      xrButton.innerHTML = "AR not found";
    }
    xrButton.disabled = !supported;
  });
}

function initXR() {
  if (navigator.xr) {
    xrButton.addEventListener("click", onButtonClicked);
    navigator.xr.addEventListener("devicechange", checkSupportedState);
    checkSupportedState();
  }
}

function onButtonClicked() {
  if (!xrSession) {
    // Ask for an optional DOM Overlay, see https://immersive-web.github.io/dom-overlays/
    navigator.xr
      .requestSession("immersive-ar", {
        requiredFeatures: ["camera-access"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById("overlay") },
      })
      .then(onSessionStarted, onRequestSessionError);
  } else {
    xrSession.end();
  }
}

function onSessionStarted(session) {
  xrSession = session;
  xrButton.innerHTML = "Start Hello WebXR";

  session.addEventListener("end", onSessionEnded);
  let canvas = document.createElement("canvas");
  gl = canvas.getContext("webgl", {
    xrCompatible: true,
  });
  scene = new THREE.Scene();
  loader.load("./textures/apart_06.glb", (object) => {
    scene.add(object.scene);
  });
  let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  let materials = [];
  for (let i = 0; i < colors.length; i++) {
    materials.push(new THREE.MeshBasicMaterial({ color: colors[i] }));
  }
  let geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  cube = new THREE.Mesh(geometry, materials);
  cube.position.z = -2;
  scene.add(cube);

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

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  binding = new XRWebGLBinding(session, gl);
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });
  session.requestReferenceSpace("local").then((refSpace) => {
    xrRefSpace = refSpace;
    session.requestAnimationFrame(onXRFrame);
  });
}

function onRequestSessionError(ex) {
  alert("Failed to start immersive AR session.");
  console.error(ex.message);
}

function onSessionEnded(event) {
  xrSession = null;
  xrButton.innerHTML = "Start Hello WebXR";
  gl = null;
}

function downloadImage() {
  screenshotCapture = true;
}

function onXRFrame(time, frame) {
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

  let pose = frame.getViewerPose(xrRefSpace);

  if (pose) {
    for (let view of pose.views) {
      if (view.camera && screenshotCapture) {
        const cameraTexture = binding.getCameraImage(view.camera);
        createImageFromTexture(gl, cameraTexture, view.camera.width, view.camera.height);
        screenshotCapture = false;
      }
    }
    const firstView = pose.views[0];
    const viewport = session.renderState.baseLayer.getViewport(firstView);
    renderer.setSize(viewport.width, viewport.height);

    camera.matrix.fromArray(firstView.transform.matrix);
    camera.projectionMatrix.fromArray(firstView.projectionMatrix);
    camera.updateMatrixWorld(true);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);

    const p = pose.transform.position;
    xCoord.innerHTML = "x: " + p.x;
    yCoord.innerHTML = "y: " + p.y;
    zCoord.innerHTML = "z: " + p.z;
  } else {
    xCoord.innerHTML = "No pose";
    yCoord.innerHTML = "No pose";
    zCoord.innerHTML = "No pose";
  }
}

function createImageFromTexture(gl, texture, width, height) {
  // Create a framebuffer backed by the texture
  let framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  // Read the contents of the framebuffer
  let data = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

  gl.deleteFramebuffer(framebuffer);

  // Create a 2D canvas to store the result
  myCanvas.width = width;
  myCanvas.height = height;

  // Copy the pixels to a 2D canvas
  let imageData = ctx.createImageData(width, height);
  imageData.data.set(data);
  ctx.putImageData(imageData, 0, 0);
}

initXR();

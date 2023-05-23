const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
/*const button = document.getElementById('ar-button')
button.addEventListener('click', activateXR)
async function activateXR() {
  // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl", { xrCompatible: true });

  // To be continued in upcoming steps.
  const scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x26f7fd });
  const redLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const purpleLineMaterial = new THREE.LineBasicMaterial({ color: 0xaa00ff });

  const points = [
    new THREE.Vector3(-0.3, -1.5, -0.3),
    new THREE.Vector3(-0.3, -1.5, -0.9),
    new THREE.Vector3(0.3, -1.5, -0.9),
    new THREE.Vector3(0.3, -1.5, -0.3),
    new THREE.Vector3(0.9, -1.5, -0.3),
    new THREE.Vector3(0.9, -1.5, -0.9),
    new THREE.Vector3(0.9, -1.5, 0.3),
    new THREE.Vector3(0.3, -1.5, 0.3),
    new THREE.Vector3(1.5, -1.5, 0.3),
    new THREE.Vector3(1.5, -1.5, -0.3),
    new THREE.Vector3(0.9, -1.5, -0.3),
    new THREE.Vector3(0.9, -1.5, -0.9),
    new THREE.Vector3(1.5, -1.5, -0.9),
    new THREE.Vector3(0.3, -1.5, -0.9),
    new THREE.Vector3(0.3, -1.5, -0.3),
    new THREE.Vector3(1.5, -1.5, -0.3),
    new THREE.Vector3(1.5, -1.5, 0.3),
    new THREE.Vector3(2.1, -1.5, 0.3),
    new THREE.Vector3(2.1, -1.5, -0.3),
  ];
  const points2 = [new THREE.Vector3(0.3, -1.5, 0.3), new THREE.Vector3(0.3, -1.5, -0.3), new THREE.Vector3(-0.3, -1.5, -0.3), new THREE.Vector3(-0.3, -1.5, 0.3), new THREE.Vector3(0.3, -1.5, 0.3)];
  const points3 = [new THREE.Vector3(2.1, -1.5, -0.3), new THREE.Vector3(2.1, -1.5, -0.9), new THREE.Vector3(1.5, -1.5, -0.9), new THREE.Vector3(1.5, -1.5, -0.3), new THREE.Vector3(2.1, -1.5, -0.3)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
  const lineGeometry3 = new THREE.BufferGeometry().setFromPoints(points3);
  const newLine = new THREE.Line(lineGeometry, lineMaterial);
  const startLine = new THREE.Line(lineGeometry2, redLineMaterial);
  const endLine = new THREE.Line(lineGeometry3, purpleLineMaterial);
  let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  let materials = [];
  for (let i = 0; i < 6; i++) {
    materials.push(new THREE.MeshStandardMaterial({ color: colors[i] }));
  }
  //const cube = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.01, 0.07), materials)
  scene.add(newLine, startLine, endLine); //, cube);

  const camera = new THREE.PerspectiveCamera();
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Set up the WebGLRenderer, which handles rendering to the session's base layer.
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl,
  });
  renderer.autoClear = false;
  camera.matrixAutoUpdate = false;

  navigator.xr.requestSession('immersive-ar', {
    optionalFeatures: ['dom-overlay'],
    domOverlay: {root: document.getElementById('overlay')}
  })
  session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl),
  });
  const referenceSpace = await session.requestReferenceSpace("local");

  const onXRFrame = (time, frame) => {
    session.requestAnimationFrame(onXRFrame);

    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);
    const pose = frame.getViewerPose(referenceSpace);
    if (pose) {
      const view = pose.views[0];

      xCoord.innerHTML = "x: " + view.transform.position.x;
      yCoord.innerHTML = "x: " + view.transform.position.y;
      zCoord.innerHTML = "x: " + view.transform.position.z;

      console.log(view.transform.position.x, view.transform.position.y, view.transform.position.z);
      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height);

      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);

      renderer.render(scene, camera);
    } else {
      xCoord.innerHTML = "x: No pose";
      yCoord.innerHTML = "y: No pose";
      zCoord.innerHTML = "z: No pose";
    }
  };
  session.requestAnimationFrame(onXRFrame);
}*/

let xrButton = document.getElementById("ar-button");
let xrSession = null;
let xrRefSpace = null;

// WebGL scene globals.
let gl = null;

function checkSupportedState() {
  navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
    if (supported) {
      xrButton.innerHTML = "Enter AR";
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
  xrButton.innerHTML = "Exit AR";

  session.addEventListener("end", onSessionEnded);
  let canvas = document.createElement("canvas");
  gl = canvas.getContext("webgl", {
    xrCompatible: true,
  });
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

function onEndSession(session) {
  session.end();
}

function onSessionEnded(event) {
  xrSession = null;
  xrButton.innerHTML = "Enter AR";
  gl = null;
}

function onXRFrame(t, frame) {
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

  // Update the clear color so that we can observe the color in the
  // headset changing over time. Use a scissor rectangle to keep the AR
  // scene visible.
  const width = session.renderState.baseLayer.framebufferWidth;
  const height = session.renderState.baseLayer.framebufferHeight;
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(width / 4, height / 4, width / 2, height / 2);
  let time = Date.now();
  gl.clearColor(Math.cos(time / 2000), Math.cos(time / 4000), Math.cos(time / 6000), 0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let pose = frame.getViewerPose(xrRefSpace);
  if (pose) {
    const p = pose.transform.position;
    document.getElementById("pose").innerText = "Position: " + p.x.toFixed(3) + ", " + p.y.toFixed(3) + ", " + p.z.toFixed(3);
  } else {
    document.getElementById("pose").innerText = "Position: (null pose)";
  }
}

initXR();

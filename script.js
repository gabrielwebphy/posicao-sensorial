const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
let xrButton = document.getElementById("ar-button");
let xrSession = null;
let xrRefSpace = null;
let gl = null;

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

function onXRFrame(time, frame) {
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

  let pose = frame.getViewerPose(xrRefSpace);
  if (pose) {
    const p = pose.transform.position;
    xCoord.innerHTML = 'x: '+p.x
    yCoord.innerHTML = 'x: '+p.y
    zCoord.innerHTML = 'x: '+p.z
  } else {
    xCoord.innerHTML = 'No pose'
    yCoord.innerHTML = 'No pose'
    zCoord.innerHTML = 'No pose'
  }
}

initXR();
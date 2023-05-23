const xCoord = document.getElementById("xcoord");
const yCoord = document.getElementById("ycoord");
const zCoord = document.getElementById("zcoord");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

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
}

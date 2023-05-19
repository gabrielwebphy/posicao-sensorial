const xCoord = document.getElementById('xcoord')
const yCoord = document.getElementById('ycoord')
const zCoord = document.getElementById('zcoord')

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
    new THREE.Vector3(-0.3, 0, -0.3),
    new THREE.Vector3(-0.3, 0, -0.9),
    new THREE.Vector3(0.3, 0, -0.9),
    new THREE.Vector3(0.3, 0, -0.3),
    new THREE.Vector3(0.9, 0, -0.3),
    new THREE.Vector3(0.9, 0, -0.9),
    new THREE.Vector3(0.9, 0, 0.3),
    new THREE.Vector3(0.3, 0, 0.3),
    new THREE.Vector3(1.5, 0, 0.3),
    new THREE.Vector3(1.5, 0, -0.3),
    new THREE.Vector3(0.9, 0, -0.3),
    new THREE.Vector3(0.9, 0, -0.9),
    new THREE.Vector3(1.5, 0, -0.9),

    new THREE.Vector3(0.3, 0, -0.9),
    new THREE.Vector3(0.3, 0, -0.3),
    new THREE.Vector3(1.5, 0, -0.3),
    new THREE.Vector3(1.5, 0, 0.3),
    new THREE.Vector3(2.1, 0, 0.3),
    new THREE.Vector3(2.1, 0, -0.3),
  ];
  const points2 = [new THREE.Vector3(0.3, 0, 0.3), new THREE.Vector3(0.3, 0, -0.3), new THREE.Vector3(-0.3, 0, -0.3), new THREE.Vector3(-0.3, 0, 0.3), new THREE.Vector3(0.3, 0, 0.3)];
  const points3 = [new THREE.Vector3(2.1, 0, -0.3), new THREE.Vector3(2.1, 0, -0.9), new THREE.Vector3(1.5, 0, -0.9), new THREE.Vector3(1.5, 0, -0.3), new THREE.Vector3(2.1, 0, -0.3)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
  const lineGeometry3 = new THREE.BufferGeometry().setFromPoints(points3);
  const newLine = new THREE.Line(lineGeometry, lineMaterial);
  const startLine = new THREE.Line(lineGeometry2, redLineMaterial);
  const endLine = new THREE.Line(lineGeometry3, purpleLineMaterial);
  scene.add(newLine, startLine, endLine);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight.position.set(10, 15, 10);
  // scene.add(directionalLight);

  // Set up the WebGLRenderer, which handles rendering to the session's base layer.
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl,
  });
  renderer.autoClear = false;
  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = false;

  const session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ["hit-test"] });
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
      console.log(view.transform.position.x,view.transform.position.y,view.transform.position.z )
      xCoord.innerHTML = 'x: '+view.transform.position.x
      yCoord.innerHTML = 'y: '+view.transform.position.y
      zCoord.innerHTML = 'z: '+view.transform.position.z
      
      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height);

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);

      renderer.render(scene, camera);
    }
    else{
      xCoord.innerHTML = 'x: No pose'
      yCoord.innerHTML = 'y: No pose'
      zCoord.innerHTML = 'z: No pose'
    }
  };
  session.requestAnimationFrame(onXRFrame);
}

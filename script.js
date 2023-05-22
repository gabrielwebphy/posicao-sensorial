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
  scene.add(newLine, startLine, endLine)//, cube);

  const camera = new THREE.PerspectiveCamera();
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const container = new ThreeMeshUI.Block({
    width: 1.2,
    height: 0.7,
    padding: 0.2,
    fontFamily: './assets/Roboto-msdf.json',
    fontTexture: './assets/Roboto-msdf.png',
   });
   const xCoordinate = new ThreeMeshUI.Text({
    content: "x: 0"
   });
   const yCoordinate = new ThreeMeshUI.Text({
    content: "y: 0"
   });
   const zCoordinate = new ThreeMeshUI.Text({
    content: "z: 0"
   });

   container.add( xCoordinate );
   container.add( yCoordinate );
   container.add( zCoordinate );
   
   // scene is a THREE.Scene (see three.js)
   scene.add( container );

  // Set up the WebGLRenderer, which handles rendering to the session's base layer.
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl,
  });
  renderer.autoClear = false;
  camera.matrixAutoUpdate = false;

  const session = await navigator.xr.requestSession("immersive-ar", {});
  session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl),
  });
  const binding = new XRWebGLBinding(session, gl)

  const referenceSpace = await session.requestReferenceSpace("local");

  const onXRFrame = (time, frame) => {
    session.requestAnimationFrame(onXRFrame);

    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);
    const pose = frame.getViewerPose(referenceSpace);
    if (pose) {
      const view = pose.views[0];
      if (view.camera) {
        console.log('tem câmera')
        //const cameraTexture = binding.getCameraImage(view.camera);
        //ctx.drawImage(cameraTexture, 0,0)
      }
    
      console.log(view.transform.position.x, view.transform.position.y, view.transform.position.z)
      //xCoordinate.set({content: `x: ${view.transform.position.x}`})
      //yCoordinate.set({content: `y: ${view.transform.position.y}`})
      //zCoordinate.set({content: `z: ${view.transform.position.z}`})

      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height);

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);

      ThreeMeshUI.update()

      renderer.render(scene, camera);
    }
    else {
      xCoord.innerHTML = 'x: No pose'
      yCoord.innerHTML = 'y: No pose'
      zCoord.innerHTML = 'z: No pose'
    }
  };
  session.requestAnimationFrame(onXRFrame);
}

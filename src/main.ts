import * as THREE from "three";
import SetScene from "./SetScene";
import SetListeners from "./SetListeners";

import {
  sendPhysicsUpdate,
  physicsWorker,
  setCreate,
  numberOfSpheres,
  geometryData,
} from "./PhysicsUtils";

export let spheres = []; // Array to hold the sphere objects

let timeSinceLast = 0;
let maxTime = 5; // Seconds in between sphere creation

// Check if device is touchscreen
export const isOnTouchScreen = "ontouchstart" in window;

// Get canvas container
export const container = document.querySelector(
  ".canvas-container"
) as HTMLElement;

// Set up the Scene using the setScene function
export var {
  scene,
  camera,
  topLight,
  plane,
  spheresCenter,
  mouseBall,
  mouse,
  mouseTarget,
  mouseScaleTarget,
  move,
  tmpM,
  offset,
  orientation,
  scale,
  time,
  raycaster,
  mesh,
  instanceScaleAttribute,
  geometry,
} = SetScene();

export var scrollPercent = 0;
export const mouseState = {
  mouseOverLink: false,
};

const CreateSpheres = () => {
  // Create new spheres at regular intervals
  if (spheres.length < numberOfSpheres && timeSinceLast > maxTime) {
    setCreate(true);
    spheres.push(1);
    timeSinceLast = 0;
  }
};

const HandleMouse = () => {
  // Mouse Logic:
  if (isOnTouchScreen) {
    mouseTarget.set(Math.cos(time * Math.PI) * 0.25, Math.cos(time) * 0.5);
  }

  mouse.lerp(mouseTarget, 0.15); // Lagging of spheres before they follow mouse
  mouseBall.position.copy(move);

  // Scale and rotate the mouseBall based on mouse interactions
  mouseScaleTarget.setScalar(
    mouseState.mouseOverLink
      ? 0.25 + mouse.distanceToSquared(mouseTarget) * 0.5
      : 0.1
  );
  mouseBall.rotateZ(-0.2 * mouseBall.scale.x);

  mouseBall.rotateZ(-0.2 * mouseBall.scale.x);

  mouseBall.scale.lerp(mouseScaleTarget, 0.06);
};

const HandleScrolling = () => {
  // scrolling data
  var doc = document.documentElement;
  var cachedClientHeight = doc.clientHeight;
  var cachedScrollHeight = doc.scrollHeight;

  var targetScollPercent =
    doc.scrollTop / (cachedScrollHeight - cachedClientHeight);

  // Update scroll percentage based on scrolling position
  targetScollPercent =
    doc.scrollTop / (cachedScrollHeight - cachedClientHeight);
  scrollPercent += (targetScollPercent - scrollPercent) * 0.01;
};

// Create Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  premultipliedAlpha: false,
  powerPreference: "high-performance",
  precision: "lowp",
  depth: false,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.physicallyCorrectLights = true;
container.appendChild(renderer.domElement);

(
  (renderer.domElement.getContext("webgl") ||
    renderer.domElement.getContext(
      "experimental-webgl"
    )) as WebGLRenderingContext
).getExtension("OES_standard_derivatives");


// Animation loop
const animate = () => {
  time += 0.01;
  timeSinceLast++;
  requestAnimationFrame(animate);

  CreateSpheres();
  // Update positions, orientations, and scales of spheres
  spheres.forEach((s, i) => {
    offset.set(
      geometryData.positions[3 * i + 0],
      geometryData.positions[3 * i + 1],
      geometryData.positions[3 * i + 2]
    );
    orientation.set(
      geometryData.quaternions[4 * i + 0],
      geometryData.quaternions[4 * i + 1],
      geometryData.quaternions[4 * i + 2],
      geometryData.quaternions[4 * i + 3]
    );
    scale.setScalar(geometryData.scales[4 * i + 0]);
    tmpM.compose(offset, orientation, scale);
    mesh.setMatrixAt(i, tmpM);

    instanceScaleAttribute.setX(i, geometryData.scales[4 * i + 3] / 4);
  });

  instanceScaleAttribute.needsUpdate = true;
  geometry.setAttribute("instanceScale", instanceScaleAttribute);
  mesh.instanceMatrix.needsUpdate = true;

  // Cast a ray from the mouse position and intersect with the plane
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, move);

  HandleScrolling();
  HandleMouse();

  // Render the scene
  renderer.render(scene, camera);
};

export const main = () => {
  // Start the update process for the physics worker
  sendPhysicsUpdate(physicsWorker);

  // Start the animation loop
  animate();

  // Set up event listeners
  SetListeners(renderer);
}

export default main();
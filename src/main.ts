// Import required modules
import * as THREE from "three";
import SetScene from "./SetScene";
import SetListeners from "./SetListeners";

// Utility function to map a value from one range to another
const map = (
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number
): number => {
  return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
};

const dt = 1 / 60;
export const numberOfSpheres = Math.round(
  map(window.innerWidth, 300, 2000, 5, 30)
);

let timeSinceLast = 0;
let maxTime = 5; // Seconds in between sphere creation

let spheres = []; // Array to hold the sphere objects

// Check if device is touchscreen
export const isOnTouchScreen = "ontouchstart" in window;

// Get canvas container
export const container = document.querySelector(
  ".canvas-container"
) as HTMLElement;

// Data containers for physics and geometry information
let physicsData = {
  positions: new Float32Array(numberOfSpheres * 3),
  quaternions: new Float32Array(numberOfSpheres * 4),
  scales: new Float32Array(numberOfSpheres * 4),
};
export const geometryData = {
  positions: new Float32Array(numberOfSpheres * 3),
  quaternions: new Float32Array(numberOfSpheres * 4),
  scales: new Float32Array(numberOfSpheres * 4),
};

// Set up the Scene using the setScene function
export var {
  scene,
  camera,
  renderer,
  topLight,
  plane,
  spheresCenter,
  mouseBall,
  mouse,
  mouseTarget,
  mouseScaleTarget,
  mosueOverLink,
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

// Start physics engine/worker
const physicsWorker = new Worker("/src/worker-physics.js");

let sendTime;
let create = false;
let needsupdate = true;

// Event handler for receiving messages from the physics worker
physicsWorker.onmessage = function (e) {
  // Update physics data with the received positions, quaternions, and scales
  physicsData.positions = e.data.positions;
  physicsData.quaternions = e.data.quaternions;
  physicsData.scales = e.data.scales;

  // Update geometry data with the physics data
  geometryData.positions.set(physicsData.positions);
  geometryData.quaternions.set(physicsData.quaternions);
  geometryData.scales.set(physicsData.scales);

  needsupdate = true;
  // Schedule the next update based on the time difference
  setTimeout(
    UpdatePhysicsWorker,
    Math.max(dt * 1000 - (Date.now() - sendTime), 0)
  );
};

// Function to send update to the physics worker
const UpdatePhysicsWorker = () => {
  if (!needsupdate) {
    return;
  }
  needsupdate = false;

  // Record the current time and send the updated data to the physics worker
  sendTime = Date.now();
  physicsWorker.postMessage(
    {
      create: create,
      numberOfSpheres: spheres.length,
      dt: dt,
      positions: physicsData.positions,
      quaternions: physicsData.quaternions,
      scales: physicsData.scales,
      mouse: move,
    },
    [
      physicsData.positions.buffer,
      physicsData.quaternions.buffer,
      physicsData.scales.buffer,
    ]
  );
  create = false;
};


// Animation loop
export var scrollPercent = 0;
const animate = () => {
  time += 0.01;
  timeSinceLast++;
  requestAnimationFrame(animate);

  // scrolling data
  var doc = document.documentElement;
  var cachedClientHeight = doc.clientHeight;
  var cachedScrollHeight = doc.scrollHeight;

  var targetScollPercent =
    doc.scrollTop / (cachedScrollHeight - cachedClientHeight);

  // Create new spheres at regular intervals
  if (spheres.length < numberOfSpheres && timeSinceLast > maxTime) {
    create = true;
    spheres.push(1);
    timeSinceLast = 0;
  }

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

  // Update scroll percentage based on scrolling position
  targetScollPercent =
    doc.scrollTop / (cachedScrollHeight - cachedClientHeight);
  scrollPercent += (targetScollPercent - scrollPercent) * 0.01;

  if (isOnTouchScreen) {
    mouseTarget.set(Math.cos(time * Math.PI) * 0.25, Math.cos(time) * 0.5);
  }

  mouse.lerp(mouseTarget, 0.15); // Lagging of spheres before they follow mouse

  // Cast a ray from the mouse position and intersect with the plane
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, move);
  mouseBall.position.copy(move);

  // Scale and rotate the mouseBall based on mouse interactions
  mouseScaleTarget.setScalar(
    mosueOverLink ? 0.25 + mouse.distanceToSquared(mouseTarget) * 0.5 : 0.1
  );
  mouseBall.rotateZ(-0.2 * mouseBall.scale.x);
  mouseBall.scale.lerp(mouseScaleTarget, 0.06);

  // Render the scene
  renderer.render(scene, camera);
};

// Start the update process for the physics worker
UpdatePhysicsWorker();

// Start the animation loop
animate();

// Set up event listeners
SetListeners();

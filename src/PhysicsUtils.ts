// PhysicsUtils.ts

// Import any required variables from main.ts here
import { move, spheres } from "./main";


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

export const numberOfSpheres = Math.round(
  map(window.innerWidth, 300, 2000, 5, 30)
);

const dt = 1 / 60;
export let sendTime;
export let needsupdate = true;
export let physicsData = {
  positions: new Float32Array(numberOfSpheres * 3),
  quaternions: new Float32Array(numberOfSpheres * 4),
  scales: new Float32Array(numberOfSpheres * 4),
};

export let create = false;
export const getCreate = () => create;
export const setCreate = (value: boolean) => {
  create = value;
};

// Data containers for physics and geometry information
export const geometryData = {
  positions: new Float32Array(numberOfSpheres * 3),
  quaternions: new Float32Array(numberOfSpheres * 4),
  scales: new Float32Array(numberOfSpheres * 4),
};

export const PhysicsEngine = (onMessage) => {
  // Start physics engine/worker
  const physicsWorker = new Worker("/src/physics.worker.js");

  // Event handler for receiving messages from the physics worker
  physicsWorker.onmessage = onMessage;

  return physicsWorker;
};

export const onPhysicsWorkerMessage = (e) => {
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
    () => sendPhysicsUpdate(physicsWorker),
    Math.max(dt * 1000 - (Date.now() - sendTime), 0)
  );
};

export const physicsWorker = PhysicsEngine(onPhysicsWorkerMessage);

export const sendPhysicsUpdate = (worker) => {
  if (!needsupdate) {
    return;
  }
  needsupdate = false;

  // Record the current time and send the updated data to the physics worker
  sendTime = Date.now();
  worker.postMessage(
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

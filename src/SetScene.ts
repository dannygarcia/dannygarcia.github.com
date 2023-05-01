import * as THREE from "three";

import { PBRSkin } from "./Classes";
import {
  isOnTouchScreen,
  scrollPercent,
} from "./main";

import { geometryData, numberOfSpheres } from "./PhysicsUtils";

export const SetScene = () => {
  // Create Scene
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    10,
    50
  );
  camera.position.z = 30;

  // Create a center object to hold the spheres and add it to the scene
  const spheresCenter = new THREE.Object3D();
  scene.add(spheresCenter);

  // Top light
  let topLight = new THREE.DirectionalLight(0xffffff, 3);
  topLight.color.setHSL(0.1, 1, 0.95);
  topLight.position.set(-1, 1.75, 1);
  topLight.position.multiplyScalar(2);
  scene.add(topLight);
  topLight.castShadow = true;
  topLight.shadow.mapSize.width = topLight.shadow.mapSize.height = 2048;
  let d = 4;
  topLight.shadow.camera.left = -d;
  topLight.shadow.camera.right = d;
  topLight.shadow.camera.top = d;
  topLight.shadow.camera.bottom = -d;
  topLight.shadow.camera.far = 8;

  // mouse intersect plane data
  const planeNormal = new THREE.Vector3(0, 0, 1);
  const plane = new THREE.Plane(planeNormal, 0);

  // Setup MouseBall
  let mouseGeometry = new THREE.CircleGeometry(1, 10);
  mouseGeometry.vertices.shift(); // removes center vertex
  let mouseBall = new THREE.LineLoop(
    mouseGeometry,
    new THREE.LineBasicMaterial({
      color: getComputedStyle(document.documentElement)
        .getPropertyValue("--c-primary")
        .trim(),
    })
  );

  // Add the mouseBall to the scene if not on a touch screen
  if (!isOnTouchScreen) {
    scene.add(mouseBall);
  }

  let mouse = new THREE.Vector2(0, -2);

  let mouseTarget = new THREE.Vector2(0, 0);
  let mouseScaleTarget = new THREE.Vector3();
  let move = new THREE.Vector3();

  var tmpM = new THREE.Matrix4();
  let offset = new THREE.Vector3();
  let orientation = new THREE.Quaternion();
  let scale = new THREE.Vector3();
  let time = 0;

  const raycaster = new THREE.Raycaster();

  // Create an instance buffer geometry and set attributes
  var geometry = new THREE.InstancedBufferGeometry();

  var ballGeometry = new THREE.IcosahedronBufferGeometry(1, 3);
  geometry.copy(ballGeometry);

  // Generate random data for each sphere
  var randomData = new Float32Array(numberOfSpheres).map((_) => Math.random());
  let instanceRandomAttribute = new THREE.InstancedBufferAttribute(
    randomData,
    1
  );
  geometry.setAttribute("instanceRandom", instanceRandomAttribute);

  // Create scale data for each sphere based on the geometry data
  var scaleData = new Float32Array(numberOfSpheres).map(
    (s, i) => geometryData.scales[i * 4 + 4]
  );
  let instanceScaleAttribute = new THREE.InstancedBufferAttribute(
    scaleData,
    1
  ).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("instanceScale", instanceScaleAttribute);

  // Create a material for the spheres
  let material = new PBRSkin(scrollPercent).material;

  // Create an instanced mesh using the geometry and material
  let mesh = new THREE.InstancedMesh(geometry, material, numberOfSpheres);
  spheresCenter.add(mesh);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return {
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
  };
};

export default SetScene;

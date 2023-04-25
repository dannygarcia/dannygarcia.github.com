import * as THREE from 'three';
import PBRSkin from './PBRSkin';

const createSpheres = (
  scene: THREE.Scene,
  numberOfSpheres: number,
  geometryData: {
    positions: Float32Array;
    quaternions: Float32Array;
    scales: Float32Array;
  },
  isOnTouchScreen: boolean,
  scrollPercent: number
): {
  spheresCenter: THREE.Object3D;
  mesh: THREE.InstancedMesh;
  mouseBall: THREE.LineLoop | null;
} => {
  const spheresCenter = new THREE.Object3D();
  scene.add(spheresCenter);
  let spheres = [];
  var geometry = new THREE.InstancedBufferGeometry();
  var ballGeometry = new THREE.IcosahedronBufferGeometry(1, 3);
  geometry.copy(ballGeometry);
  var randomData = new Float32Array(numberOfSpheres).map(_ => Math.random());
  let instanceRandomAttribute = new THREE.InstancedBufferAttribute(randomData, 1);
  geometry.setAttribute('instanceRandom', instanceRandomAttribute);
  var scaleData = new Float32Array(numberOfSpheres).map((s, i) => geometryData.scales[i * 4 + 4]);
  let instanceScaleAttribute = new THREE.InstancedBufferAttribute(scaleData, 1).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('instanceScale', instanceScaleAttribute);
  let material = new PBRSkin(scrollPercent).material;
  let mesh = new THREE.InstancedMesh(geometry, material, numberOfSpheres);
  spheresCenter.add(mesh);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  let mouseGeometry = new THREE.CircleGeometry(1, 10);
  mouseGeometry.vertices.shift(); // removes center vertex
  let mouseBall = null;
  if (!isOnTouchScreen) {
    mouseBall = new THREE.LineLoop(
      mouseGeometry,
      new THREE.LineBasicMaterial({
        color: getComputedStyle(document.documentElement).getPropertyValue('--c-primary').trim(),
      })
    );
    scene.add(mouseBall);
  }

  return {
    spheresCenter,
    mesh,
    mouseBall,
  };
};

export default createSpheres;
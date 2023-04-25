import * as THREE from 'three';

import PBRSkin from './PBRSkin';
import setScene from './SetScene';
// import createSpheres from './CreateSpheres';
import setupListeners from './setupListeners';

// Check if device is touchscreen:
export const isOnTouchScreen = 'ontouchstart' in window;

// Get canvas container:
export var container = document.querySelector('.canvas-container') as HTMLElement;

// Set up the Scene:
export const { scene, camera, renderer, topLight, container: updatedContainer } = setScene();
container = updatedContainer;

function map(value: number, min1: number, max1: number, min2: number, max2: number): number {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// N is the number of spheres:
const dt = 1/60, numberOfSpheres = Math.round(map(window.innerWidth, 300, 2000, 5, 30));
let physicsData = {
    positions: new Float32Array(numberOfSpheres*3),
    quaternions: new Float32Array(numberOfSpheres*4),
    scales: new Float32Array(numberOfSpheres*4)
};
let geometryData = {
    positions: new Float32Array(numberOfSpheres*3),
    quaternions: new Float32Array(numberOfSpheres*4),
    scales: new Float32Array(numberOfSpheres*4)
};

// Start physics engine/worker:
const physicsWorker = new Worker("/src/worker-physics.js");

let sendTime;
let create = false;
let needsupdate = true;
physicsWorker.onmessage = function(e) {
    physicsData.positions = e.data.positions;
    physicsData.quaternions = e.data.quaternions;
    physicsData.scales = e.data.scales;
    
    geometryData.positions.set(physicsData.positions);
    geometryData.quaternions.set(physicsData.quaternions);
    geometryData.scales.set(physicsData.scales);

    needsupdate = true;
    setTimeout(updateWorker, Math.max(dt * 1000 - (Date.now() - sendTime), 0));
};

function updateWorker() {
    if (!needsupdate) {
        return;
    }
    needsupdate = false;
    
    sendTime = Date.now();
    physicsWorker.postMessage({
        create: create,
        numberOfSpheres: spheres.length,
        dt: dt,
        positions: physicsData.positions,
        quaternions: physicsData.quaternions,
        scales: physicsData.scales,
        mouse: move
    },[
        physicsData.positions.buffer,
        physicsData.quaternions.buffer,
        physicsData.scales.buffer
    ]);
    create = false;
}

const spheresCenter = new THREE.Object3D();
scene.add(spheresCenter);
let spheres = [];
var geometry = new THREE.InstancedBufferGeometry();
var ballGeometry = new THREE.IcosahedronBufferGeometry(1, 3);
geometry.copy( ballGeometry );
var randomData = new Float32Array(numberOfSpheres).map(_ => Math.random());
let instanceRandomAttribute = new THREE.InstancedBufferAttribute( randomData, 1 );
geometry.setAttribute('instanceRandom', instanceRandomAttribute);
var scaleData = new Float32Array(numberOfSpheres).map((s, i) => geometryData.scales[i*4 + 4]);
let instanceScaleAttribute = new THREE.InstancedBufferAttribute( scaleData, 1 ).setUsage(THREE.DynamicDrawUsage);
geometry.setAttribute('instanceScale', instanceScaleAttribute);
let material = new PBRSkin(scrollPercent).material;
let mesh = new THREE.InstancedMesh(geometry, material, numberOfSpheres);
spheresCenter.add(mesh);
mesh.castShadow = true;
mesh.receiveShadow = true;

// Setup MouseBall
let mouseGeometry = new THREE.CircleGeometry( 1, 10);
mouseGeometry.vertices.shift(); // removes center vertex
let mouseBall = new THREE.LineLoop( mouseGeometry, new THREE.LineBasicMaterial( { color: getComputedStyle(document.documentElement).getPropertyValue('--c-primary').trim() } ) );
if (!isOnTouchScreen) {
    scene.add(mouseBall);
}

function makeSphere() {
    create = true;
    spheres.push(1);
}

let timeSinceLast = 0;
let maxTime = 5; // Seconds in between sphere creation
export var doc = document.documentElement;
var cachedClientHeight = doc.clientHeight;
var cachedScrollHeight = doc.scrollHeight;

// mouse intersect plane data
const planeNormal = new THREE.Vector3(0, 0, 1);
const plane = new THREE.Plane(planeNormal, 0);

const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0.,-2.);
export let mouseTarget = new THREE.Vector2(0.,0);
let mouseScaleTarget = new THREE.Vector3();
let mosueOverLink = false;
let move = new THREE.Vector3();

// scrolling data
var scrollPercent = 0;
var targetScollPercent = doc.scrollTop / (cachedScrollHeight - cachedClientHeight);

var tmpM = new THREE.Matrix4();
let offset = new THREE.Vector3();
let orientation = new THREE.Quaternion();
let scale = new THREE.Vector3();
let time = 0;
const animate = () => {
    time += 0.01;
    timeSinceLast++;
    requestAnimationFrame( animate );
    
    if (spheres.length < numberOfSpheres && timeSinceLast > maxTime) {
        makeSphere();
        timeSinceLast = 0;
    }
    
    // Handles positions of spheres:
    spheres.forEach((s, i) => {
        offset.set(
            geometryData.positions[3*i+0],
            geometryData.positions[3*i+1],
            geometryData.positions[3*i+2]
        );
        orientation.set(
            geometryData.quaternions[4*i+0],
            geometryData.quaternions[4*i+1],
            geometryData.quaternions[4*i+2],
            geometryData.quaternions[4*i+3]
        );
        scale.setScalar(geometryData.scales[4 * i + 0]);
        tmpM.compose( offset, orientation, scale );
        mesh.setMatrixAt( i, tmpM );

        instanceScaleAttribute.setX(i, geometryData.scales[4*i + 3] / 4);
    });

    instanceScaleAttribute.needsUpdate = true;
    geometry.setAttribute('instanceScale', instanceScaleAttribute);
    mesh.instanceMatrix.needsUpdate = true;

    targetScollPercent = (doc.scrollTop / (cachedScrollHeight - cachedClientHeight));
    scrollPercent += (targetScollPercent - scrollPercent) * 0.01;
    // spheresCenter.rotation.x = scrollPercent * 2;

    if (isOnTouchScreen) {
        mouseTarget.set(Math.cos(time * Math.PI) * .25, Math.cos(time) * .5);
    }

    mouse.lerp(mouseTarget, .15); // Lagging of spheres before they follow mouse
    
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, move);
    mouseBall.position.copy(move);

    mouseScaleTarget.setScalar(mosueOverLink ? .25 + mouse.distanceToSquared(mouseTarget) * .5 : .1);
    mouseBall.rotateZ(-.2 * mouseBall.scale.x);

    mouseBall.scale.lerp(mouseScaleTarget, .06);

    renderer.render( scene, camera );
};

updateWorker();
animate();

setupListeners()

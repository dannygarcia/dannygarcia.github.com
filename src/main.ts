import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTargetCube } from 'three/src/renderers/WebGLRenderTargetCube';
import { Object3D } from 'three/src/core/Object3D';
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';
import { InstancedBufferAttribute } from 'three/src/core/InstancedBufferAttribute';
// import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
import { Quaternion } from 'three/src/math/Quaternion';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Plane } from 'three/src/math/Plane';
import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { Scene } from 'three/src/scenes/Scene';
import { Raycaster } from 'three/src/core/Raycaster';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
// import { CubeCamera } from 'three/src/cameras/CubeCamera';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';

import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { IcosahedronBufferGeometry } from 'three/src/geometries/IcosahedronGeometry';
import { BasicShadowMap } from 'three/src/constants';
import { ACESFilmicToneMapping } from 'three/src/constants';
import { LinearMipmapLinearFilter } from 'three/src/constants';
import { LinearFilter } from 'three/src/constants';
import { DynamicDrawUsage } from 'three/src/constants';
import { RGBFormat } from 'three/src/constants';
import { CubeReflectionMapping } from 'three/src/constants';
import { sRGBEncoding } from 'three/src/constants';
import { NormalMapShader } from 'three/examples/jsm/shaders/NormalMapShader';

const shaders = {
    physical: require('./shaders/custom_meshphysical.glsl').CustomMeshPhysicalShader,
    // glowy: require('./shaders/sphere-glowy.frag').default,
    // green: require('./shaders/sphere-green.frag').default,
    // normal: require('./shaders/sphere-normal.frag').default,
    // stripe: require('./shaders/sphere-stripe.frag').default
};

const container = document.querySelector('.canvas-container') as HTMLElement;
function getHeight() {
    return container.offsetHeight;
}

interface Position {
    x: number,
    y: number,
    z: number
}

interface Skin {
    renderer: WebGLRenderer,
    scene: Scene,
    material: any,
    uniforms?: any,
    fragment?: string,
    vertex?: string,
    // camera?: CubeCamera,
    update(target?: any): void
}

class PBRSkin implements Skin {
    renderer: WebGLRenderer;
    scene: Scene;
    material: any;
    uniforms = UniformsUtils.clone(shaders.physical.uniforms);
    vertex = shaders.physical.vertexShader;
    fragment = shaders.physical.fragmentShader;

    constructor(renderer: WebGLRenderer, scene: Scene) {
        this.renderer = renderer;
        this.scene = scene;
        // this.uniforms[ 'diffuse' ].value = new Vector3( 0.98, 0.01, 0.05 );
        this.uniforms[ 'roughness' ].value = 0.5;
        this.uniforms[ 'metalness' ].value = 0;
        // this.uniforms.roughnessMap.value = residueTexture;
        // this.uniforms.normalMap.value = residueTextureNormal;
        this.uniforms.uTime = { value: 1.0 };
        this.uniforms.uRandom = { value: Math.random() };
        this.uniforms.uScale = { value: 0.001 };

        this.material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: this.vertex,
            fragmentShader: this.fragment,
            lights: true,
        } );
    }

    update(target) {
        this.uniforms.uTime.value += .01;
        this.uniforms.uScale.value = target.scale.x * Math.max(1.-scrollPercent, .25);
        // when the sphere goes small, reset material
        if (target.scale.x <= 0.001) {
            this.uniforms.uRandom.value = Math.random();
        }

    }
}

function random(min: number = 1, max?: number): number {
    if (!max) {
        max = min;
        min = 0;
    }
    return (Math.random() * (max - min) + min);
}

function randomFrom(list: any[]): any {
    return list[Math.floor(Math.random() * list.length)];
}

var scene = new Scene();
// scene.overrideMaterial = new MeshDepthMaterial();
var camera = new PerspectiveCamera( 10, window.innerWidth / getHeight(), 10, 50 );
camera.position.z = 30;

var renderer = new WebGLRenderer({
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
    precision: 'lowp',
    depth: true,
    antialias: true
});
renderer.setSize( window.innerWidth, getHeight() );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = BasicShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;

((renderer.domElement.getContext('webgl') ||
    renderer.domElement.getContext('experimental-webgl')) as WebGLRenderingContext).getExtension('OES_standard_derivatives');

container.appendChild( renderer.domElement );


const physicsWorker = new Worker("/src/worker-physics.js");

const dt = 1/60, N = 10;
let physicsData = {
    positions: new Float32Array(N*3),
    quaternions: new Float32Array(N*4),
    scales: new Float32Array(N*4)
};
let geometryData = {
    positions: new Float32Array(N*3),
    quaternions: new Float32Array(N*4),
    scales: new Float32Array(N*4)
};

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
        N: spheres.length,
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

const spheresCenter = new Object3D();
scene.add(spheresCenter);
let spheres = [];
var geometry = new InstancedBufferGeometry();
geometry.copy( new IcosahedronBufferGeometry(1, 4) );
var randomData = new Float32Array(N).map(_ => Math.random());
let instanceRandomAttribute = new InstancedBufferAttribute( randomData, 1 );
geometry.setAttribute('instanceRandom', instanceRandomAttribute);
var scaleData = new Float32Array(N).map((s, i) => geometryData.scales[i*4 + 4]);
let instanceScaleAttribute = new InstancedBufferAttribute( scaleData, 1 ).setUsage(DynamicDrawUsage);
geometry.setAttribute('instanceScale', instanceScaleAttribute);
let material = new PBRSkin(renderer, scene).material;
let mesh = new InstancedMesh(geometry, material, N);
spheresCenter.add(mesh);
mesh.castShadow = true;
mesh.receiveShadow = true;
// mesh.customDepthMaterial = customDepthMaterial;

function makeSphere() {
    create = true;
    spheres.push(1);
}


var topLight = new DirectionalLight( 0xffffff, 2 );
topLight.color.setHSL( 0.1, 1, 0.95 );
topLight.position.set( - 1, 1.75, 1 );
topLight.position.multiplyScalar( 2 );
scene.add( topLight );
topLight.castShadow = true;
topLight.shadow.mapSize.width = topLight.shadow.mapSize.height = 2048;
var d = 4;
topLight.shadow.camera.left = - d;
topLight.shadow.camera.right = d;
topLight.shadow.camera.top = d;
topLight.shadow.camera.bottom = - d;
topLight.shadow.camera.far = 8;
// var topLightShadowHelper = new CameraHelper(topLight.shadow.camera);
// scene.add(topLightShadowHelper);
// var topLightHeper = new DirectionalLightHelper( topLight, 10 );
// scene.add( topLightHeper );

let timeSinceLast = 0;
let maxTime = 10;
var doc = document.documentElement;
var cachedClientHeight = doc.clientHeight;
var cachedScrollHeight = doc.scrollHeight;

// mouse intersect plane data
const planeNormal = new Vector3(0, 0, 1);
const plane = new Plane(planeNormal, 0);

const raycaster = new Raycaster();
let mouse = new Vector2();

let move = new Vector3();

// scrolling data
var scrollPercent = 0;
var targetScollPercent = doc.scrollTop / (cachedScrollHeight - cachedClientHeight);

var tmpM = new Matrix4();
let offset = new Vector3();
let orientation = new Quaternion();
let scale = new Vector3();

var animate = function () {
    timeSinceLast++;
    requestAnimationFrame( animate );
    
    if (spheres.length < N && timeSinceLast > maxTime) {
        makeSphere();
        timeSinceLast = 0;
        maxTime = random(20,50);
    }
    
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
        
        // TODO: change color when scale is 0
        // if (geometryData.scales[3*i] <= 0.001) {
            //     this.uniforms.uRandom.value = Math.random();
            // }
    });
    instanceScaleAttribute.needsUpdate = true;
    geometry.setAttribute('instanceScale', instanceScaleAttribute);
    mesh.instanceMatrix.needsUpdate = true;

    targetScollPercent = (doc.scrollTop / (cachedScrollHeight - cachedClientHeight));
    scrollPercent += (targetScollPercent - scrollPercent) * 0.01;
    spheresCenter.rotation.x = scrollPercent * 2;

    renderer.render( scene, camera );
};

updateWorker();
animate();

window.onresize = function() {
    var windowAspect = window.innerWidth / getHeight();
    cachedClientHeight = doc.clientHeight;
    cachedScrollHeight = doc.scrollHeight;
    // camera.fov = (Math.atan(getHeight() / 2 / camera.position.z) * 2 * RAD2DEG) * .1;
    camera.aspect = windowAspect;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, getHeight() );
};

window.onpointermove = function(e) {
    mouse.setX((e.pageX / window.innerWidth) * 2 - 1);
    mouse.setY((-(e.pageY / (window.innerHeight + window.scrollY)) * 2 + 1));
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, move);
}

document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.classList.add('loaded');
}, false);
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Object3D } from 'three/src/core/Object3D';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { DirectionalLight } from 'three/src/lights/DirectionalLight.js';

import { ShaderMaterial } from 'three/src/materials/ShaderMaterial.js';
import { IcosahedronBufferGeometry } from 'three/src/geometries/IcosahedronGeometry';
import { BasicShadowMap } from 'three/src/constants.js';
import { ACESFilmicToneMapping } from 'three/src/constants.js';
// import { FresnelShader } from 'three/examples/jsm/shaders/FresnelShader.js';

// const sphereVert = require('./shaders/sphere.vert').default;
const RAD2DEG = 180 / Math.PI;
const shaders = {
    physical: require('./shaders/custom_meshphysical.glsl.js').CustomMeshPhysicalShader
    // glowy: require('./shaders/sphere-glowy.frag').default,
    // green: require('./shaders/sphere-green.frag').default,
    // normal: require('./shaders/sphere-normal.frag').default,
    // stripe: require('./shaders/sphere-stripe.frag').default
};
const textureLoader = new TextureLoader();
const residueTexture = textureLoader.load( "/src/images/scratches-1.jpg" );
const residueTextureNormal = textureLoader.load( "/src/images/scratches_n.jpg" );
// residueTexture.repeat.set(0.5, 0.5);
// residueTextureNormal.repeat.set(0.5, 0.5);

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

// class GlassSkin implements Skin {

//     renderer: WebGLRenderer;
//     scene: Scene;
//     uniforms = UniformsUtils.clone( FresnelShader.uniforms );
//     fragment: string = FresnelShader.fragmentShader;
//     vertex: string = FresnelShader.vertexShader;
//     camera = new CubeCamera( .1, 10, 256 * 4 );
//     material: Material;

//     constructor(renderer: WebGLRenderer, scene: Scene) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.uniforms["tCube"].value = this.camera.renderTarget.texture;
//         this.material = new ShaderMaterial({
//             uniforms: 		this.uniforms,
//             vertexShader:   this.vertex,
//             fragmentShader: this.fragment
//         });
//         scene.add(this.camera);
//     }

//     update(target) {
//         this.camera.position.x = target.position.x;
//         this.camera.position.y = target.position.y;
//         this.camera.position.z = target.position.z;
//         this.camera.update(this.renderer, this.scene);
//     }
// }

// class MirrorSkin implements Skin {

//     renderer: WebGLRenderer;
//     scene: Scene;
//     camera = new CubeCamera( .1, 10, 256 );
//     material: MeshBasicMaterial;

//     constructor(renderer: WebGLRenderer, scene: Scene) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.material = new MeshBasicMaterial( {
//             envMap: this.camera.renderTarget.texture
//         } );
//         scene.add(this.camera);
//     }

//     update(target) {
//         this.camera.position.x = target.position.x;
//         this.camera.position.y = target.position.y;
//         this.camera.position.z = target.position.z;
//         // this.camera.quaternion.x = target.quaternion.x;
//         // this.camera.quaternion.y = target.quaternion.y;
//         // this.camera.quaternion.z = target.quaternion.z;
//         // this.camera.quaternion.w = target.quaternion.w;    
//         this.camera.update(this.renderer, this.scene);
//         this.material.envMap = this.camera.renderTarget.texture;
//     }
// }

// class StripeSkin implements Skin {

//     renderer: WebGLRenderer;
//     scene: Scene;
//     material: Material;
//     uniforms = {
//         uTime: { value: 1.0 },
//         resolution: { value: new Vector2() }
//     };
//     vertex = sphereVert;
//     fragment = shaders.stripe;

//     constructor(renderer: WebGLRenderer, scene: Scene) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.material = new ShaderMaterial( {
//             uniforms: this.uniforms,
//             vertexShader: this.vertex,
//             fragmentShader: this.fragment
//         } );
//     }

//     update(target) {
//         this.uniforms.uTime.value += .01;
//     }

// }


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
        this.uniforms[ 'diffuse' ].value = new Vector3( 0.98, 0.01, 0.05 );
        this.uniforms[ 'metalness' ].value = 0;
        this.uniforms.roughnessMap.value = residueTexture;
        this.uniforms.normalMap.value = residueTextureNormal;
        this.uniforms.uTime = { value: 1.0 };
        this.uniforms.uRandom = { value: Math.random() };
        this.uniforms.uScale = { value: 0.001 };

        this.material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: this.vertex,
            fragmentShader: this.fragment,
            lights: true
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

// class GlowySkin implements Skin {

//     renderer: WebGLRenderer;
//     scene: Scene;
//     material: Material;
//     uniforms = {
//         uTime: { value: 1.0 },
//         resolution: { value: new Vector2() }
//     };
//     vertex = sphereVert;
//     fragment = shaders.glowy;

//     constructor(renderer: WebGLRenderer, scene: Scene) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.material = new ShaderMaterial( {
//             uniforms: this.uniforms,
//             vertexShader: this.vertex,
//             fragmentShader: this.fragment
//         } );
//     }

//     update(target) {
//         this.uniforms.uTime.value += .01;
//     }

// }

// class NormalSkin implements Skin {
    
//     renderer: WebGLRenderer;
//     scene: Scene;
//     material: Material;

//     constructor(renderer: WebGLRenderer, scene: Scene) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.material = normalMaterial;
//     }

//     update(target) {}

// }

class Sphere {
    
    position: Position;
    radius: number;
    skin: Skin;
    mesh: Mesh;
    // camera: CubeCamera;
    scale: number;
    
    constructor(position: Position, radius: number, skin: Skin) {
        this.position = position;
        this.radius = radius;
        this.skin = skin;
        this.scale = 0.001;
        this.mesh = this.buildMesh(this.radius, this.skin);
        this.mesh.scale.setScalar(this.scale);
    }
    
    buildMesh(radius: number, skin: Skin): Mesh {
        let geometry = new IcosahedronBufferGeometry( radius, 4 );
        let mesh = new Mesh( geometry, skin.material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    
    // http://www.iquilezles.org/www/articles/functions/functions.htm
    parabola(x: number, k: number) {
        return Math.pow(4.0 * x * (1.0 - x), k);
    }
    
    //  http://www.iquilezles.org/www/articles/functions/functions.htm
    pcurve(x: number, a: number, b: number) {
        const k = Math.pow(a+b,a+b) / (Math.pow(a,a)*Math.pow(b,b));
        return k * Math.pow( x, a ) * Math.pow( 1.0-x, b );
    }

    updateFromPhysics(positions, quaternions, scale) {
        this.mesh.position.x = positions[0];
        this.mesh.position.y = positions[1];
        this.mesh.position.z = positions[2];
        this.mesh.quaternion.x = quaternions[0];
        this.mesh.quaternion.y = quaternions[1];
        this.mesh.quaternion.z = quaternions[2];
        this.mesh.quaternion.w = quaternions[3];
        this.mesh.scale.setScalar(Math.max(scale, 0.001));
    }
    
    update() {
        this.skin.update(this.mesh);
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
var camera = new PerspectiveCamera( 10, window.innerWidth / getHeight(), 20, 40 );
camera.position.z = 30;

var renderer = new WebGLRenderer({
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'mediump',
    depth: false,
    antialias: false
});
renderer.setSize( window.innerWidth, getHeight() );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = BasicShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;
// renderer.outputEncoding = sRGBEncoding;
// renderer.context.disable(renderer.context.DEPTH_TEST);


container.appendChild( renderer.domElement );


const physicsWorker = new Worker("/src/worker-physics.js");
const dt = 1/60, N = 10;
let positions = new Float32Array(N*3);
let quaternions = new Float32Array(N*4);
let scales = new Float32Array(N*3);

let sendTime;
let create = false;
let needsupdate = true;
physicsWorker.onmessage = function(e) {
    positions = e.data.positions;
    quaternions = e.data.quaternions;
    scales = e.data.scales;

    spheres.forEach((s, i) => {
        s.updateFromPhysics(
            [
                positions[3*i+0],
                positions[3*i+1],
                positions[3*i+2]
            ], [
                quaternions[4*i+0],
                quaternions[4*i+1],
                quaternions[4*i+2],
                quaternions[4*i+3]
            ], scales[3*i]);
    });

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
        positions: positions,
        quaternions: quaternions,
        scales: scales
    },[positions.buffer, quaternions.buffer, scales.buffer]);
    create = false;
}

const spheresCenter = new Object3D();
scene.add(spheresCenter);
var spheres = [];
// var skins = [GlowySkin, StripeSkin, MirrorSkin, GlassSkin];//, NormalSkin];
// skins = [PBRSkin];//, NormalSkin];
function makeSphere() {
    create = true;
    var Skin = PBRSkin;
    var sphere = new Sphere(
        {x: 0, y: 0, z: 0}, // position
        1, // radius
        new Skin(renderer, scene)
        );
    spheres.push(sphere);
    spheresCenter.add(sphere.mesh);
}
// for (var i = 0; i < N; i++) {
//     makeSphere();
// }


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

var scrollPercent = 0;
var targetScollPercent = doc.scrollTop / (cachedScrollHeight - cachedClientHeight);

var animate = function () {
    timeSinceLast++;
    requestAnimationFrame( animate );
    
    if (spheres.length < N && timeSinceLast > maxTime) {
        makeSphere();
        timeSinceLast = 0;
        maxTime = random(20,50);
    }
    spheres.forEach(s => {
        s.update();
    });
    
    targetScollPercent = (doc.scrollTop / (cachedScrollHeight - cachedClientHeight));
    scrollPercent += (targetScollPercent - scrollPercent) * 0.01;
    spheresCenter.rotation.x = scrollPercent * 2;

    
    renderer.render( scene, camera );
};

animate();
updateWorker();

window.onresize = function() {
    var windowAspect = window.innerWidth / getHeight();
    cachedClientHeight = doc.clientHeight;
    cachedScrollHeight = doc.scrollHeight;
    // camera.fov = (Math.atan(getHeight() / 2 / camera.position.z) * 2 * RAD2DEG) * .1;
    camera.aspect = windowAspect;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, getHeight() );
};

document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.classList.add('loaded');
}, false);
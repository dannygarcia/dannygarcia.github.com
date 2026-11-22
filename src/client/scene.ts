import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
// import { WebGLRenderTargetCube } from 'three/src/renderers/WebGLRenderTargetCube';
import { Object3D } from 'three/src/core/Object3D';
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';
import { InstancedBufferAttribute } from 'three/src/core/InstancedBufferAttribute';
// import { Float32BufferAttribute } from 'three/src/core/BufferAttribute';
// import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
import { Quaternion } from 'three/src/math/Quaternion';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Plane } from 'three/src/math/Plane';
import { Mesh } from 'three/src/objects/Mesh';
import { InstancedMesh } from 'three/src/objects/InstancedMesh';
import { Scene } from 'three/src/scenes/Scene';
import { Raycaster } from 'three/src/core/Raycaster';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { CubeCamera } from 'three/src/cameras/CubeCamera';

// import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
// import { RectAreaLight } from 'three/src/lights/RectAreaLight';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';

import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
// import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { LineLoop } from 'three/src/objects/LineLoop';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
import { IcosahedronBufferGeometry } from 'three/src/geometries/IcosahedronGeometry';
// import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { BasicShadowMap } from 'three/src/constants';
// import { ACESFilmicToneMapping } from 'three/src/constants';
import { ReinhardToneMapping } from 'three/src/constants';
// import { BackSide } from 'three/src/constants';
// import { LinearMipmapLinearFilter } from 'three/src/constants';
import { LinearFilter } from 'three/src/constants';
import { DynamicDrawUsage } from 'three/src/constants';
// import { AdditiveBlending } from 'three/src/constants';
import { RGBAFormat } from 'three/src/constants';
// import { CubeReflectionMapping } from 'three/src/constants';
import { sRGBEncoding } from 'three/src/constants';
// import { NormalMapShader } from 'three/examples/jsm/shaders/NormalMapShader';
// import { MeshPhysicalMaterial } from 'three/src/materials/MeshPhysicalMaterial';
// import * as Nodes from 'three/examples/jsm/nodes/Nodes';
import { CustomMeshPhysicalShader } from './shaders/custom_meshphysical.glsl';

export interface SceneState {
    width: number;
    height: number;
    narrow: boolean;
    color: string;
    scroll: number;
    pointerX: number;
    pointerY: number;
    overLink: boolean;
    visible: boolean;
}


const shaders = {
    physical: CustomMeshPhysicalShader,
    // glowy: require('./shaders/sphere-glowy.frag').default,
    // green: require('./shaders/sphere-green.frag').default,
    // normal: require('./shaders/sphere-normal.frag').default,
    // stripe: require('./shaders/sphere-stripe.frag').default
};

// The worker owns the transferred canvas; the fallback uses the same scene on the page.
export function startScene(canvas: HTMLCanvasElement | OffscreenCanvas, initial: SceneState, highRefresh = false) {
    let state = initial;
    const isNarrowScreen = initial.narrow;
    const getViewportWidth = () => state.width;
    const getViewportHeight = () => state.height;

    interface Position {
        x: number,
        y: number,
        z: number;
    }

    interface Skin {
        material: any,
        uniforms?: any,
        fragment?: string,
        vertex?: string,
        // camera?: CubeCamera,
        update(target?: any): void;
    }

    class PBRSkin implements Skin {
        material: any;
        uniforms = UniformsUtils.clone(shaders.physical.uniforms);
        vertex = shaders.physical.vertexShader;
        fragment = shaders.physical.fragmentShader;

        constructor(mouse: number) {
            // this.uniforms[ 'roughness' ].value = 0.5;
            // this.uniforms[ 'metalness' ].value = 0;
            // this.uniforms[ 'mouse' ].value = mouse;
            this.uniforms.uTime = { value: 1.0 };
            this.uniforms.uRandom = { value: Math.random() };
            this.uniforms.uScale = { value: 0.001 };

            this.material = new ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertex,
                fragmentShader: this.fragment,
                lights: true,
                // Instances share one draw call, so visibility must use the depth buffer.
                depthTest: true,
                depthWrite: true,
                // Write the nearest sphere's RGBA directly. The browser composites
                // its alpha over the HTML; blending unsorted instances here would
                // reintroduce draw-order artifacts between spheres.
                transparent: false,
            });
            // this.material = new Nodes.MeshStandardNodeMaterial();
            // const col1 = new Nodes.ColorNode(0x000000);
            // const col2 = new Nodes.ColorNode(0xffffff);
            // const smoothScale = new Nodes.MathNode(new Nodes.FloatNode(this.uniforms.uScale.value), new Nodes.FloatNode(0.5), Nodes.MathNode.POW);
            // this.material.color = new Nodes.MathNode(col1, col2, smoothScale, Nodes.MathNode.MIX);
        }

        update(target: { scale: { x: number; }; }) {
            this.uniforms.uTime.value += .01;
            this.uniforms.uScale.value = target.scale.x * Math.max(1. - scrollPercent, .25);
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
    var camera = new PerspectiveCamera(10, getViewportWidth() / getViewportHeight(), 10, 50);
    camera.position.z = 30;

    var renderer = new WebGLRenderer({
        canvas: canvas,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        precision: 'highp',
        depth: true,
        antialias: true
    });
    renderer.setSize(getViewportWidth(), getViewportHeight(), false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = BasicShadowMap;
    renderer.toneMapping = ReinhardToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.physicallyCorrectLights = true;

    ((renderer.domElement.getContext('webgl') ||
        renderer.domElement.getContext('experimental-webgl')) as WebGLRenderingContext).getExtension('OES_standard_derivatives');


    function map(value: number, min1: number, max1: number, min2: number, max2: number): number {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    const physicsWorker = new Worker("/worker-physics.js");

    const dt = 1 / 60, N = Math.round(map(initial.width, 300, 2000, 5, 30));
    let physicsData = {
        positions: new Float32Array(N * 3),
        quaternions: new Float32Array(N * 4),
        scales: new Float32Array(N * 4)
    };
    let geometryData = {
        positions: new Float32Array(N * 3),
        quaternions: new Float32Array(N * 4),
        scales: new Float32Array(N * 4)
    };

    let previousGeometry = {
        positions: new Float32Array(N * 3),
        quaternions: new Float32Array(N * 4),
        scales: new Float32Array(N * 4)
    };
    let snapshotTime = 0;
    let hasSnapshot = false;
    let sendTime: number;
    let create = false;
    let needsupdate = true;
    physicsWorker.onmessage = function (e) {
        physicsData.positions = e.data.positions;
        physicsData.quaternions = e.data.quaternions;
        physicsData.scales = e.data.scales;

        previousGeometry.positions.set(hasSnapshot ? geometryData.positions : physicsData.positions);
        previousGeometry.quaternions.set(hasSnapshot ? geometryData.quaternions : physicsData.quaternions);
        previousGeometry.scales.set(hasSnapshot ? geometryData.scales : physicsData.scales);
        snapshotTime = performance.now();
        hasSnapshot = true;
        geometryData.positions.set(physicsData.positions);
        geometryData.quaternions.set(physicsData.quaternions);
        geometryData.scales.set(physicsData.scales);

        needsupdate = true;
        setTimeout(updateWorker, Math.max(dt * 1000 - (Date.now() - sendTime), 0));
    };

    function updateWorker() {
        if (!needsupdate || !state.visible) {
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
        }, [
            physicsData.positions.buffer,
            physicsData.quaternions.buffer,
            physicsData.scales.buffer
        ]);
        create = false;
    }

    const spheresCenter = new Object3D();
    scene.add(spheresCenter);
    let spheres: number[] = [];
    var geometry = new InstancedBufferGeometry();
    var ballGeometry = new IcosahedronBufferGeometry(1, 3);
    geometry.copy(ballGeometry);
    var randomData = new Float32Array(N).map(_ => Math.random());
    let instanceRandomAttribute = new InstancedBufferAttribute(randomData, 1);
    geometry.setAttribute('instanceRandom', instanceRandomAttribute);
    var scaleData = new Float32Array(N).map((s, i) => geometryData.scales[i * 4 + 4]);
    let instanceScaleAttribute = new InstancedBufferAttribute(scaleData, 1).setUsage(DynamicDrawUsage);
    geometry.setAttribute('instanceScale', instanceScaleAttribute);
    let material = new PBRSkin(1).material;
    let mesh = new InstancedMesh(geometry, material, N);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    spheresCenter.add(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // mesh.customDepthMaterial = customDepthMaterial;

    let mouseGeometry = new CircleGeometry(1, 10);
    mouseGeometry.vertices.shift(); // removes center vertex
    let mouseBall = new LineLoop(mouseGeometry, new LineBasicMaterial({ color: initial.color }));
    if (!isNarrowScreen) {
        scene.add(mouseBall);
    }

    function makeSphere() {
        create = true;
        spheres.push(1);
    }

    var topLight = new DirectionalLight(0xffffff, 3);
    topLight.color.setHSL(0.1, 1, 0.95);
    topLight.position.set(- 1, 1.75, 1);
    topLight.position.multiplyScalar(2);
    scene.add(topLight);
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
    let maxTime = 5;

    // mouse intersect plane data
    const planeNormal = new Vector3(0, 0, 1);
    const plane = new Plane(planeNormal, 0);

    const raycaster = new Raycaster();
    let mouse = new Vector2(0., -2.);
    let mouseTarget = new Vector2(0., 0);
    let mouseScaleTarget = new Vector3();
    let mosueOverLink = false;
    let move = new Vector3();

    // scrolling data
    var scrollPercent = 0;
    var targetScollPercent = initial.scroll;

    var tmpM = new Matrix4();
    let offset = new Vector3();
    let orientation = new Quaternion();
    const targetOrientation = new Quaternion();
    let scale = new Vector3();
    let time = 0;
    let previousTime = 0;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let running = false;
    // Timer-driven OffscreenCanvas presentation bypasses the page's rAF cap.
    // https://rida.dev/blog/bypassing-ios-safari-60-fps-limit
    const interval = 1000 / 120;
    let nextFrame = 0;
    const schedule = () => {
        if (highRefresh) {
            nextFrame += interval;
            nextFrame = Math.max(nextFrame, performance.now());
            timer = setTimeout(() => animate(performance.now()), Math.max(0, nextFrame - performance.now()));
        } else {
            frame = requestAnimationFrame(animate);
        }
    };
    var animate = function (now: number) {
        if (!running) return;
        const elapsed = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
        previousTime = now;
        const frameScale = elapsed * 60;
        time += 0.01 * frameScale;
        timeSinceLast += frameScale;

        if (spheres.length < N && timeSinceLast > maxTime) {
            makeSphere();
            timeSinceLast = 0;
            // maxTime = random(20,50);
        }

        const blend = Math.min(1, Math.max(0, (now - snapshotTime) / (dt * 1000)));
        const positionAt = (index: number) => previousGeometry.positions[index] + (geometryData.positions[index] - previousGeometry.positions[index]) * blend;
        const scaleAt = (index: number) => previousGeometry.scales[index] + (geometryData.scales[index] - previousGeometry.scales[index]) * blend;
        spheres.forEach((s, i) => {
            offset.set(
                positionAt(3 * i + 0),
                positionAt(3 * i + 1),
                positionAt(3 * i + 2)
            );
            orientation.set(
                geometryData.quaternions[4 * i + 0],
                geometryData.quaternions[4 * i + 1],
                geometryData.quaternions[4 * i + 2],
                geometryData.quaternions[4 * i + 3]
            );
            targetOrientation.copy(orientation);
            orientation.fromArray(previousGeometry.quaternions, 4 * i);
            if (orientation.lengthSq() > 0 && targetOrientation.lengthSq() > 0) {
                orientation.slerp(targetOrientation, blend);
            } else {
                orientation.copy(targetOrientation);
            }
            scale.setScalar(scaleAt(4 * i));
            tmpM.compose(offset, orientation, scale);
            mesh.setMatrixAt(i, tmpM);

            instanceScaleAttribute.setX(i, scaleAt(4 * i + 3) / 4);

            // TODO: change color when scale is 0
            // if (geometryData.scales[3*i] <= 0.001) {
            //     this.uniforms.uRandom.value = Math.random();
            // }
        });
        instanceScaleAttribute.needsUpdate = true;
        mesh.instanceMatrix.needsUpdate = true;

        targetScollPercent = state.scroll;
        scrollPercent += (targetScollPercent - scrollPercent) * (1 - Math.pow(0.99, frameScale));
        // spheresCenter.rotation.x = scrollPercent * 2;

        if (isNarrowScreen) {
            mouseTarget.set(Math.cos(time * Math.PI) * .25, Math.cos(time) * .5);
        }

        if (!isNarrowScreen) mouseTarget.set(state.pointerX, state.pointerY);
        mosueOverLink = state.overLink;
        mouse.lerp(mouseTarget, 1 - Math.pow(0.85, frameScale));
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, move);
        mouseBall.position.copy(move);

        mouseScaleTarget.setScalar(mosueOverLink ? .25 + mouse.distanceToSquared(mouseTarget) * .5 : .1);
        mouseBall.rotateZ(-.2 * mouseBall.scale.x * frameScale);

        mouseBall.scale.lerp(mouseScaleTarget, 1 - Math.pow(0.94, frameScale));

        renderer.render(scene, camera);
        schedule();
    };

    function setState(next: SceneState) {
        const resized = next.width !== state.width || next.height !== state.height;
        state = next;
        if (resized) {
            camera.aspect = state.width / state.height;
            camera.updateProjectionMatrix();
            renderer.setSize(state.width, state.height, false);
        }
        if (state.visible && !running) {
            running = true;
            previousTime = 0;
            nextFrame = performance.now();
            updateWorker();
            animate(nextFrame);
        } else if (!state.visible && running) {
            running = false;
            clearTimeout(timer);
            if (!highRefresh) cancelAnimationFrame(frame);
        }
    }

    setState(initial);
    return { setState };
}

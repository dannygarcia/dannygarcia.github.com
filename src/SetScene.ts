import * as THREE from 'three';

import { container } from './main';

const setScene = () => {
    // Create Scene
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(10, window.innerWidth / container.offsetHeight, 10, 50);
    camera.position.z = 30;

    // Create Renderer
    let renderer = new THREE.WebGLRenderer({
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        precision: 'lowp',
        depth: false,
        antialias: true
    });
    renderer.setSize(window.innerWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.physicallyCorrectLights = true;

    ((renderer.domElement.getContext('webgl') ||
        renderer.domElement.getContext('experimental-webgl')) as WebGLRenderingContext).getExtension('OES_standard_derivatives');

    container.appendChild(renderer.domElement);

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

    return { scene, camera, renderer, topLight, container };
}

export default setScene
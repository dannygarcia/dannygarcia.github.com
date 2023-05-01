import * as THREE from 'three';

// Interface that defines the properties of a skin.
interface Skin {
  material: any;
  uniforms?: any;
  fragment?: string;
  vertex?: string;
  update(target?: any): void;
}

// Class that represents a physically based rendering skin.
export class PBRSkin implements Skin {
  // Shaders used to render the skin.
  shaders = {
    physical: require('./shaders/custom_meshphysical.glsl').CustomMeshPhysicalShader,
  };

  // The material used to render the skin.
  material: any;

  // The uniforms used by the skin's shader.
  uniforms = THREE.UniformsUtils.clone(this.shaders.physical.uniforms);

  // The vertex shader code used by the skin's shader.
  vertex = this.shaders.physical.vertexShader;

  // The fragment shader code used by the skin's shader.
  fragment = this.shaders.physical.fragmentShader;

  // Constructor for PBRSkin.
  constructor(private scrollPercent: number) {
    // Initialize the values of the shader uniforms.
    this.uniforms.uTime = { value: 1.0 };
    this.uniforms.uRandom = { value: Math.random() };
    this.uniforms.uScale = { value: 0.001 };

    // Create a new ShaderMaterial using the initialized uniforms and shader code.
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertex,
      fragmentShader: this.fragment,
      lights: true,
    });
  }

  // Update the skin's shader uniforms.
  update(target: any) {
    // Increment the uTime uniform to create time-based animation effects in the shader.
    this.uniforms.uTime.value += 0.01;

    // Update the uScale uniform based on the target's x scale value and the current scroll position.
    this.uniforms.uScale.value = target.scale.x * Math.max(1.0 - this.scrollPercent, 0.25);

    // Reset the uRandom uniform when the target sphere is scaled to a very small size.
    if (target.scale.x <= 0.001) {
      this.uniforms.uRandom.value = Math.random();
    }
  }
}

export class DataHandler {
  positions: Float32Array;
  quaternions: Float32Array;
  scales: Float32Array;

  constructor(numElements: number) {
    this.positions = new Float32Array(numElements * 3);
    this.quaternions = new Float32Array(numElements * 4);
    this.scales = new Float32Array(numElements * 4);
  }

  setData(data: { positions: Float32Array; quaternions: Float32Array; scales: Float32Array }): void {
    this.positions.set(data.positions);
    this.quaternions.set(data.quaternions);
    this.scales.set(data.scales);
  }
}

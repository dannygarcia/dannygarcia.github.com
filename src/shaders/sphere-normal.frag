uniform float uTime;

varying vec3 vNormal;
//varying vec2 vUV;

void main() {
    gl_FragColor = vec4(vNormal, 1.);
}

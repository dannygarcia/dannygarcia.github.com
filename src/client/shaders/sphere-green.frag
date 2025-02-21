uniform float uTime;

varying vec3 vNormal;
//varying vec2 vUV;
varying vec3 diff;
varying vec3 spec;

void main() {
    //vec2 st = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    //vec2 st = vUV;
    
    vec3 n = vNormal;
    // fragColor = vec4(n, 1.);return;
    
    
    vec3 col = vec3(diff) + spec;
    
    //vec3 gama = vec3(1./1.2);

    gl_FragColor = vec4(col, 1.);
}

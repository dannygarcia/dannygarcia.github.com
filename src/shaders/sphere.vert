
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vViewPosition;
varying vec3 vMatrixPosition;

void main() {

    vec3 transformed = vec3( position );
    vec4 mvPosition = vec4( transformed, 1.0 );
    mvPosition = modelViewMatrix * mvPosition;

    //vNormal = normal;
    vec3 n = normalMatrix * normal;
    vMatrixPosition = (modelMatrix * vec4(position, 1.0 )).xyz;
    vPosition = position;

    vec3 objectNormal = vec3( normal );
    vec3 transformedNormal = objectNormal;
    transformedNormal = normalMatrix * transformedNormal;
    vNormal = normalize( transformedNormal );

    vViewPosition = - mvPosition.xyz;
        
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
}
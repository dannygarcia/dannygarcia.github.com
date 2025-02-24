#define PI 3.14159265359
#define RECIPROCAL_PI 0.31830988618
#define saturate(a) clamp( a, 0.0, 1.0 )

uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vViewPosition;
varying vec3 vMatrixPosition;

struct GeometricContext {
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};

struct Light {
    vec3 p;
    vec3 c;
    float i;
};

float D_BlinnPhong( const in float shininess, const in float dotNH ) {
    return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}    

vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {
    float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
    return ( 1.0 - specularColor ) * fresnel + specularColor;
}    

vec3 BRDF_Specular_BlinnPhong( const in Light light, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {
    vec3 halfDir = normalize( light.p + geometry.viewDir );
    float dotNH = saturate( dot( geometry.normal, halfDir ) );
    float dotLH = saturate( dot( light.p, halfDir ) );
    vec3 F = F_Schlick( specularColor, dotLH );
    float G = 0.25;
    float D = D_BlinnPhong( shininess, dotNH );
    return F * ( G * D );
}

void main() {
    vec2 uv = vUV;
    vec3 n = vNormal;

    GeometricContext geometry;
    geometry.position = - vViewPosition;
    geometry.normal = vNormal;
    geometry.viewDir = normalize( vViewPosition );

    Light light;
    light.p = vec3(-1., 1., 1.);
    light.c = vec3(1.,1.,1.);
    light.i = 0.9;

    vec3 adjustedLight = light.p + cameraPosition;
    vec3 lightDirection = normalize(vMatrixPosition - adjustedLight);    

    vec3 diff = clamp(dot(-lightDirection, n), 0.0, 1.0) * light.c;
    
    float dotNL = saturate( dot( geometry.normal, light.p ) );
    vec3 irradiance = dotNL * light.c;
    irradiance *= PI;

    vec3 spec = irradiance * BRDF_Specular_BlinnPhong( light, geometry, light.c, 30. ) * 1.;

    vec3 col = vec3(diff) * .5 + spec * .2;
    col += 0.5 + 0.5*cos(uTime+n+vec3(0,2,4));    
    //vec3 col = (vec3(diff) + spec) * (smoothstep(0.49,.51,sin(uTime + vPosition.z * 10.)) + vec3(.1,.1,.101));
    
    vec3 gama = vec3(1./1.2);
    
    //col = diff;
    
    gl_FragColor = vec4(col * gama, 1.);
}
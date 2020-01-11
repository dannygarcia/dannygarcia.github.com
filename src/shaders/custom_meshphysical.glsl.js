import { Color } from 'three/src/math/Color';
import { UniformsLib } from 'three/src/renderers/shaders/UniformsLib.js';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils.js';

const glsl = x => x.join('');

var CustomMeshPhysicalShader = {

	uniforms: UniformsUtils.merge( [
		UniformsLib.common,
		UniformsLib.envmap,
		// UniformsLib.lightmap,
		// UniformsLib.emissivemap,
		// UniformsLib.bumpmap,
		UniformsLib.normalmap,
		UniformsLib.roughnessmap,
		// UniformsLib.metalnessmap,
		// UniformsLib.fog,
		UniformsLib.lights,
		{
			map: {value: null},
			emissive: { value: new Color( 0x000000 ) },
			roughness: { value: 0.5 },
			metalness: { value: 0.5 },
			envMapIntensity: { value: 1 } // temporary
		}

	] ),

	vertexShader: glsl`
	#define PHYSICAL
	
	varying vec3 vViewPosition;
	varying vec3 vPosition;
	varying vec2 vUv;
	
	#ifndef FLAT_SHADED
	
		varying vec3 vNormal;
	
		#ifdef USE_TANGENT
	
			varying vec3 vTangent;
			varying vec3 vBitangent;
	
		#endif
	
	#endif
	
	#include <common>
	#include <uv_pars_vertex>
	#include <uv2_pars_vertex>
	#include <color_pars_vertex>
	//<fog_pars_vertex>
	#include <shadowmap_pars_vertex>
	
	void main() {
	
		#include <uv_vertex>
		#include <uv2_vertex>
		#include <color_vertex>
	
		#include <beginnormal_vertex>
		#include <defaultnormal_vertex>
	
	#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	
		vNormal = normalize( transformedNormal );
	
		#ifdef USE_TANGENT
	
			vTangent = normalize( transformedTangent );
			vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	
		#endif
	
	#endif
	
		#include <begin_vertex>
		#include <project_vertex>
	
		vViewPosition = - mvPosition.xyz;
		vPosition = position;
		vUv = uv;

		#include <worldpos_vertex>
		#include <shadowmap_vertex>
		//<fog_vertex>
	
	}
	`,

	fragmentShader: glsl`
	#define USE_UV
	// #define USE_MAP
	#define USE_ROUGHNESSMAP
	#define USE_NORMALMAP
	#define TONE_MAPPING
	#define PHYSICAL
	
	uniform vec3 diffuse;
	uniform vec3 emissive;
	uniform float roughness;
	uniform float metalness;
	uniform float opacity;
	uniform float uTime;
	uniform float uRandom;
	uniform float uScale;
	
	// #ifdef PHYSICAL
	// 	uniform float clearcoat;
	// 	uniform float clearcoatRoughness;
	// #endif
	
	#ifdef USE_SHEEN
		uniform vec3 sheen;
	#endif
	
	varying vec3 vViewPosition;
	varying vec3 vPosition;
	
	#ifndef FLAT_SHADED
	
		varying vec3 vNormal;
	
		#ifdef USE_TANGENT
	
			varying vec3 vTangent;
			varying vec3 vBitangent;
	
		#endif
	
	#endif
	
	#include <common>
	#include <packing>
	//<dithering_pars_fragment>
	#include <color_pars_fragment>
	#include <uv_pars_fragment>
	#include <uv2_pars_fragment>
	#include <map_pars_fragment>
	//<alphamap_pars_fragment>
	//<lightmap_pars_fragment>
	//<emissivemap_pars_fragment>
	#include <bsdfs>
	#include <cube_uv_reflection_fragment>
	#include <envmap_pars_fragment>
	#include <envmap_physical_pars_fragment>
	//<fog_pars_fragment>
	#include <lights_pars_begin>
	#include <lights_physical_pars_fragment>
	#include <shadowmap_pars_fragment>
	//#include <bumpmap_pars_fragment>
	#include <normalmap_pars_fragment>
	//<clearcoat_normalmap_pars_fragment>
	#include <roughnessmap_pars_fragment>
	#include <metalnessmap_pars_fragment>

	float map(float value, float min1, float max1, float min2, float max2) {
		return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
	}

	void main() {
	
		// vec3 c = (1.-(smoothstep(0.49,.50,sin(uTime * 20. + (vPosition.z * 3.)*3.)*.75) - vec3(0.)));

		// c = mix(vec3(.1), diffuse, c);
		// c = diffuse;
		float timeOffset = uTime + uRandom;
		vec3 c = 0.5 + 0.5*cos(timeOffset+vPosition.xyz+vec3(0.,2.,4.)); // from starting shadertoy
		//gl_FragColor = vec4(vec3(cos(timeOffset+vPosition)), 1.); return;
		float depthFactor = smoothstep(0.0, 1., -vViewPosition.z + cameraPosition.z); // camera-based depth
		c = mix(c * .2,c, depthFactor); // apply depth factor to color
		c = mix(vec3(0.),c, smoothstep(0., 0.5, uScale)); // darker when small
		float alpha = smoothstep(0., .25, depthFactor);
		vec4 diffuseColor = vec4( clamp(c, 0., 1.), opacity * alpha );

		ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
		vec3 totalEmissiveRadiance = emissive + (c * .65);
	
		// <map_fragment>
		#include <map_fragment>
		#include <color_fragment>
		//<alphamap_fragment>
		//<alphatest_fragment>
		#include <roughnessmap_fragment>
		diffuseColor += roughnessFactor * .1;
		roughnessFactor = clamp(map(roughnessFactor, 0., 1., 0., 0.8), 0.3, 1.);
		#include <metalnessmap_fragment>
		#include <normal_fragment_begin>
		#include <normal_fragment_maps>
		//<clearcoat_normal_fragment_begin>
		//<clearcoat_normal_fragment_maps>
		//<emissivemap_fragment>
	
		// accumulation
		#include <lights_physical_fragment>
		#include <lights_fragment_begin>
		#include <lights_fragment_maps>
		#include <lights_fragment_end>
	
		// modulation
		vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	
		gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	
		#include <tonemapping_fragment>
		#include <encodings_fragment>
		// <fog_fragment>
		// <premultiplied_alpha_fragment>
		// <dithering_fragment>
	
	}
	`,

};

export { CustomMeshPhysicalShader };
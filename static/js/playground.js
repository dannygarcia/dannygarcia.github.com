const container = document.getElementById('playground');

const frag = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec4 color;

const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);
const float veinWidth = 0.1;
const float detail = 3.4;
const float scale1 = 3.;
const float scale2 = 6.;
const float scale3 = 9.;
const float diffusion = 0.20;
const int softVein = 1;

float noise(vec2 x) {
	return sin(1.5*x.x)*sin(1.5*x.y);
}

// 2D Fractional Brownian Motion
// iq https://www.shadertoy.com/view/lsl3RH
float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000*noise(p); p = m2*p*2.02;
    f += 0.2500*noise(p); p = m2*p*2.03;
    f += 0.1250*noise(p); p = m2*p*2.01;
    f += 0.0625*noise(p);
    return f/0.9375;
}

vec3 rgb(int r, int g, int b) {
	return vec3(float(r)/255., float(g)/255., float(b)/255.);
}

float marble(vec2 p) {
    float a = abs(fbm(
        (p + vec2(5. * scale1, -3. * scale1))*
        1.33 + detail
	));

    float b = abs(fbm(
        (p + vec2(8. * scale2, 0.))*
        2. + detail
	));

    float c = abs(fbm(
        p * scale1*
        2.67 + detail
	));

	float d = max(max(a, b), c);

	float shape = d * (1. + veinWidth) - veinWidth;

    float absShape = abs(shape);

    float diff = pow(absShape, diffusion);

    if (softVein == 1 || shape > 0.) {
    	return diff;
    } else {
    	return absShape;
    }
}

void main() {
	vec2 uv = gl_FragCoord.xy/resolution;
	vec3 veinColor = rgb(11, 12, 14);
	vec3 baseColor = rgb(67, 85, 95);
	vec3 color = mix(baseColor, veinColor, marble(uv + vec2(0., -time * .05)));
	gl_FragColor = vec4(color, 1.);
}
`;

const init = () => {
	const regl = createREGL(container);
	const draw = regl({
		frag: frag,
		vert: `
			precision mediump float;
			attribute vec2 position;
			void main() {
				gl_Position = vec4(position, 0., 1.);
			}
		`,
		attributes: {
			position: [
				[-1, 1],
				[1, 1],
				[-1, -1],
				[1, 1],
				[1, -1],
				[-1, -1]
			]
		},
		uniforms: {
			resolution: context => {
				return [context.viewportWidth, context.viewportHeight];
			},
			color: regl.prop('color'),
			time: regl.context('time')
		},
		count: 6
	});

	regl.frame(({time}) => {
		regl.clear({
			color: [0, 0, 0, 0],
			depth: 1
		});
		draw({
			color: [
				Math.cos(time),
				Math.sin(time),
				Math.cos(time * 0.003),
				1
			]
		});
	});
}
init();

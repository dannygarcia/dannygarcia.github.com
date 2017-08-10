const playground = document.getElementById('playground');

const frag = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec4 color;

float sphere(vec3 rayOrigin, vec3 rayDirection, vec3 point, float radius) {
	vec3 rayCenter = rayOrigin - point;
	float c = dot(rayCenter, rayCenter) - (radius * radius);
	float b = dot(rayDirection, rayCenter);
	float d = b * b - c;
	float t = -b - sqrt(abs(d));
	float st = step(0., min(t, d));
	return mix(-1., t, st);
}

vec3 background(float time, vec3 rayDirection) {
	vec3 light = normalize(vec3(sin(time), 0.6, cos(time)));
	float sun = max(0., dot(rayDirection, light));
	float sky = max(0., dot(rayDirection, vec3(0., 1., 0.)));
	float ground = max(0., -dot(rayDirection, vec3(0., 1., 0.)));
	return (pow(sun, 256.) + 0.2 * pow(sun, 2.)) * vec3(2., 1.6, 1.) +
		pow(ground, 0.5) * vec3(0.4, 0.3, 0.2) +
		pow(sky, 1.) * vec3(0.5, 0.6, 0.7);
}

void main() {
	//vec2 uv = gl_FragCoord.xy / resolution;
	vec2 uv = (-1. + 2. * gl_FragCoord.xy / resolution) * vec2(resolution.x / resolution.y, 1.);
	vec3 rayOrigin = vec3(0., 0., -3.);
	vec3 rayDirection = normalize(vec3(uv, 1.));
	vec3 point = vec3(0., 0., 0.);
	float t = sphere(rayOrigin, rayDirection, point, 1.);
	vec3 normal = normalize(point - (rayOrigin + rayDirection * t));
	vec3 bg = background(time, rayDirection);
	rayDirection = reflect(rayDirection, normal);
	vec3 color = background(time, rayDirection) * vec3(0.9, 0.8, 1.0);
	gl_FragColor = vec4(mix(bg, color, step(0., t)), 1.);
}
`;

const init = () => {
	const regl = createREGL(playground);
	const drawTriangle = regl({
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
		drawTriangle({
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
const logo = {
	paths: [
		"M66.713,5.752 c20.946,0,34.681,12.731,34.681,34.555 c0,32.548-19.065,55.94-47.725,55.94 H8.577 L27.83,5.752 H66.713 M39.934,75.176 h9.909 c14.173,0,24.208-11.79,24.208-31.482 c0-10.097-5.519-16.933-14.926-16.933 h-8.968 L39.934,75.176 Z",
		"M152.919,78.249 h-27.594 l-8.78,17.999 H89.202 l49.794-90.496 h33.364 l9.281,90.496 h-27.97 L152.919,78.249 M134.231,59.498 h18.187 l-1.38-31.545 h-1.317 L134.231,59.498 Z",
		"M188.694,96.248 l19.253-90.496 h17.936 l26.528,46.784 h1.254 l9.971-46.784 h25.399 l-19.253,90.496 h-17.56 L225.13,50.091 h-1.254 l-9.784,46.157 H188.694 Z",
		"M278.604,96.248 l19.253-90.496 h17.936 l26.527,46.784 h1.255 l9.972-46.784 h25.398 l-19.253,90.496 h-17.56 L315.04,50.091 h-1.254 l-9.784,46.157 H278.604 Z",
		"M394.725,96.248 l6.083-28.66 L382.997,5.752 h27.845 l7.839,35.935 h1.255 l23.016-35.935 h28.472 l-44.024,61.835 l-6.084,28.66 H394.725 Z"
	],
	amounts: [30,30,30,30,30],
	colors: [0x333333,0x333333,0x333333,0x333333,0x333333],
	center: {x: 240, y: 50}
};

const frag = `
uniform vec2 resolution;
uniform float time;
uniform float rtime;
uniform vec4 color;

const float baseScale = 0.1;
const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);
const float veinWidth = 0.1;
const float detail = 3.4;
const float scale1 = 1. * baseScale;
const float scale2 = 2. * baseScale;
const float scale3 = 3. * baseScale;
const float diffusion = 0.20;
const int softVein = 1;

float noise(vec2 x) {
	return sin(1.5*x.x)*sin(1.5*x.y) * cos(time * 0.2);
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
	vec3 color = mix(baseColor, veinColor, marble(uv + vec2(0., -rtime * .05)));
	gl_FragColor = vec4(mix(veinColor, color, smoothstep(0., 1., time * 0.3)), 1.);
}
`;

class Letter {
	constructor(rotation) {
		this.rotation = rotation || 0;
		this.previous = this.rotation;
		this.accelration = 0;
	}
	accelerate(degrees) {
		this.accelration += degrees;
	}
	simulate(delta) {
		this.accelration *= delta;
		const rotation = ((this.rotation - this.previous) * 0.9) + this.accelration;
		this.previous = this.rotation;
		this.rotation += rotation;
		this.accelration = 0;
	}
}

class RotationConstraint {
	constructor(l1, l2, stiffness) {
		[this.l1, this.l2] = [l1, l2];
		this.target = l1.rotation - l2.rotation;
		this.stiffness = stiffness;
	}
	solve() {
		const [l1, l2] = [this.l1, this.l2];
		const direction = l2.rotation - l1.rotation;
		if (direction === 0) {
			return;
		}
		const factor = (direction - this.target) / (direction * 1);
		const correction = direction * factor * this.stiffness;
		this.l1.rotation += correction;
		this.l2.rotation += -correction;
	}
}

class WebGLTransitioner extends Transitioner {
	constructor(tin) {
		super(tin);

		this.random = Math.random() * 100;
		this.tick = 0;
		this.rotationOffset = 0;
		this.freescroll = 1000;

		// Camera

		this.camera = new THREE.OrthographicCamera(
			this.width / -2,
			this.width / 2,
			this.height / 2,
			this.height / -2,
			1, 1000);

		this.camera.position.set(0, 400, 700);
		this.camera.target = new THREE.Vector3(0, 150, 0);

		// Scene

		this.scene = new THREE.Scene();
		// this.scene.fog = new THREE.Fog(0x000000, 250, 1400);

		// Lights

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);
		directionalLight.position.set(0, 0, 1).normalize();

		this.scene.add(directionalLight);

		// Materials

		// this.uniforms = {
		// 	color: { value: new THREE.Color() },
		// 	time: { value: 1 },
		// 	resolution: { value: new THREE.Vector2() },
		// 	rtime: { value: 1 + this.random }
		// };

		// const fancyMaterial = new THREE.ShaderMaterial({
		// 	side: THREE.DoubleSide,
		// 	wireframe: false,
		// 	uniforms: this.uniforms,
		// 	vertexShader: `
		// 		void main() {
		// 			gl_Position = vec4(position, 1.0);
		// 		}`,
		// 	fragmentShader: `
		// 		uniform float time;
		// 		uniform vec2 resolution;
		// 		uniform vec4 color;
		// 		void main() {
		// 			gl_FragColor = vec4(1.);
		// 		}
		// 	`
		// });

		// Text Group

		this.textGroup = new THREE.Group();
		// this.textGroup.position.y = this.height / 2;

		this.logoMesh = new THREE.Group();
		for (let i = 0; i < logo.paths.length; i++) {
			let path = THREE.transformSVGPath(logo.paths[i]);
			let color = new THREE.Color(logo.colors[i]);
			let material = new THREE.MeshStandardMaterial( {
				color: color,
				metalness: 1.18
			});
			// let material = new THREE.MeshLambertMaterial({
			// 	color: color,
			// 	emissive: color
			// });
			// material = new THREE.MeshBasicMaterial( { wireframe: true } ); // wireframe
			let amount = logo.amounts[i];
			let geometry = path.toShapes(true);
			for (let j = 0; j < geometry.length; j++) {
				let extrudedGeometry = new THREE.ExtrudeGeometry(geometry[j], {
					amount: amount,
					bevelEnabled: false
				});

				extrudedGeometry.translate(-logo.center.x,-logo.center.y,-amount/2);
				let mesh = new THREE.Mesh(extrudedGeometry, material);
				mesh.rotation.x = Math.PI;
				mesh.letter = new Letter(0);
				this.logoMesh.add(mesh);
			}
		}



		for (let i = 0; i < this.logoMesh.children.length; i++) {
			if (this.logoMesh.children[i - 1]) {
				this.logoMesh.children[i].constraint = new RotationConstraint(
					this.logoMesh.children[i].letter,
					this.logoMesh.children[i - 1].letter,
					0.01
				);
			}
		}

		this.logoMesh.rotation.z = 0.2;
		this.logoMesh.rotation.y += 0.5;
		// console.log('lm', this.logoMesh);

		this.textGroup.add(this.logoMesh);

		this.scene.add(this.textGroup);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.toneMapping = THREE.LinearToneMapping;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.tin.appendChild(this.renderer.domElement);

		const renderScene = new THREE.RenderPass(this.scene, this.camera);
		const copyShader = new THREE.ShaderPass(THREE.CopyShader);
		copyShader.renderToScreen = true;
		const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width/4, this.height/4), 1.7, 0.7, 0.0);
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(renderScene);
		this.composer.addPass(bloomPass);
		this.composer.addPass(copyShader);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		this.updateRenderer();

	}
	setBoundaries() {
		super.setBoundaries();
		this.width = this.rect.width;
		this.height = this.rect.height;
		this.updateRenderer();
	}
	updateRenderer() {
		if (this.camera) {
			// const cameraScale = THREE.Math.lerp(this.width/400, 0, 1);
			const cameraScale = 1;
			// console.log(cameraScale);
			this.camera.left = (this.width / -2) * cameraScale;
			this.camera.right = (this.width / 2) * cameraScale;
			this.camera.top = (this.height / 2) * cameraScale;
			this.camera.bottom = (this.height / -2) * cameraScale;
			this.camera.updateProjectionMatrix();
		}
		if (this.textGroup) {
			this.textGroup.position.y = 550;
		}
		if (this.renderer) {
			this.renderer.setSize(this.width, this.height);
		}
		if (this.composer) {
			this.composer.setSize(this.width, this.height);
		}
		// if (this.uniforms) {
		// 	this.uniforms.resolution.value.x = this.width;
		// 	this.uniforms.resolution.value.y = this.height;
		// }
	}
	ease(t) {
		return t*t;
	}
	update(target, mouse, scrollDelta) {
		super.update(target);
		this.tick += 0.5;
		this.freescroll *= 0.95;
		// const rotationby = 0.01 * (1-this.progress);
		// console.log(target);

		// this.rotationOffset += ((mouse.down ? 0 : 1) - this.rotationOffset) * 0.15;

		// this.rotationOffset = this.ease(this.rotationOffset);

		for (let i = 0; i < this.logoMesh.children.length; i++) {
			if (i === 0) {
				if (mouse.down) {
					this.logoMesh.children[i].letter.accelerate(mouse.distanceend * 0.0001);
					this.freescroll = 10000;
				} else if (this.freescroll < 1) {
					this.logoMesh.children[i].letter.accelerate(-Math.sin(Math.PI * 0.25 * this.tick * 0.01)*0.01);
				}
			}
			this.logoMesh.children[i].letter.accelerate(-scrollDelta * 0.0005);
			this.logoMesh.children[i].letter.simulate(1);
			if (this.logoMesh.children[i].constraint) {
				this.logoMesh.children[i].constraint.solve(1);
			}
			this.logoMesh.children[i].rotation.x = Math.PI + this.logoMesh.children[i].letter.rotation;
			// this.logoMesh.children[i].rotation.x = (i * (this.rotationOffset * -0.4)) + ((this.tick * 0.01) % Math.PI * 2 * this.rotationOffset) + Math.PI;
			// this.logoMesh.children[i].rotation.x += mouse.distanceend * 0.001;
		}

		// this.uniforms.time.value += 0.05;
		// this.uniforms.rtime.value = this.uniforms.time.value + this.random;
		// this.uniforms.color.value = [
		// 	Math.cos(this.uniforms.time.value),
		// 	Math.sin(this.uniforms.time.value),
		// 	Math.cos(this.uniforms.time.value * 0.003),
		// 	1
		// ];

		this.renderer.toneMappingExposure = Math.pow(2.5, 4.0 );
	}
	draw() {
		this.composer.render();
		// this.renderer.render(this.scene, this.camera);

	}
}

transitions.push(new WebGLTransitioner(playgroundEl));

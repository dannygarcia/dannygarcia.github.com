const canvas = document.getElementById('playground');
const ctx = canvas.getContext('2d');

const rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

class Vec {
	constructor(x, y) {
		[this.x, this.y] = [ x, y ];
	}
	set(v) {
		[this.x, this.y] = v instanceof Vec ?
			[ v.x, v.y ]:[ v, v ];
		return this;
	}
	add(v) {
		[this.x, this.y] = v instanceof Vec ?
			[ this.x + v.x, this.y + v.y ] :
			[ this.x + v, this.y + v ];
		return this;
	}
	subtract(v) {
		[this.x, this.y] = v instanceof Vec ?
			[ this.x - v.x, this.y - v.y ] :
			[ this.x - v, this.y - v ];
		return this;
	}
	multiply(v) {
		[this.x, this.y] = v instanceof Vec ?
			[ this.x * v.x, this.y * v.y ] :
			[ this.x * v, this.y * v ];
		return this;
	}
	divide(v) {
		[this.x, this.y] = v instanceof Vec ?
			[ this.x / v.x, this.y / v.y ] :
			[ this.x / v, this.y / v ];
		return this;
	}
	clone() {
		return new Vec(this.x, this.y);
	}
	distance(v) {
		const d = this.clone().subtract(v);
		return Math.sqrt(d.x * d.x + d.y * d.y);
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}

class Constraint {
	constructor(p1, p2) {
		[this.p1, this.p2] = [p1, p2];
		this.target = p1.position.distance(p2.position);
	}
	resolve() {
		const [pos1, pos2] = [ this.p1.position.clone(), this.p2.position.clone() ];
		const direction = pos2.subtract(pos1);
		const len = direction.length();
		const factor = (len - this.target) / (len * 2.1);
		let correction = direction.multiply(factor);
		
		if (!this.p1.pinned) {
			this.p1.correct(correction);
		}
		
		correction.multiply(-1);
		
		if (!this.p2.pinned) {
			this.p2.correct(correction);
		}
	}
	draw() {
		ctx.strokeStyle = '#979690';
		ctx.beginPath();
		ctx.moveTo(this.p1.position.x, this.p1.position.y);
		ctx.lineTo(this.p2.position.x, this.p2.position.y);
		ctx.stroke();
	}
}

class Particle {
	constructor(pos) {
		this.position = pos;
		this.previous = this.position.clone();
		this.acceleration = new Vec(0, 0);
		this.pinned = false;
		this.trail = [];
	}
	accelerate(v) {
		if (this.pinned) {
			return;
		}
		this.acceleration.add(v);
	}
	correct(v) {
		if (this.pinned) {
			return;
		}
		this.position.add(v);
	}
	simulate(delta) {
		if (this.pinned) {
			return;
		}
		this.acceleration.multiply(delta * delta);
		const pos = this.position
			.clone()
			.subtract(this.previous)
			// .multiply(0.999) // friction
			.add(this.acceleration);
		
		this.previous.set(this.position);
		this.position.add(pos);
		this.acceleration.set(0);
	}
	draw() {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
	}
	drawTrail() {
		this.trail.push(this.position.clone());
		if (this.trail.length > 50) {
			this.trail.shift();
		}
		for (let i = 0; i < this.trail.length; i++) {
		  
			if (this.trail[i - 1]) {
				ctx.strokeStyle = 'hsla(200, 5%, 10%, '+ (i/this.trail.length) +')';
				ctx.beginPath();
				ctx.moveTo(this.trail[i].x, this.trail[i].y);
				ctx.lineTo(this.trail[i - 1].x, this.trail[i - 1].y);
				ctx.stroke();
			}
		  
			ctx.beginPath();
			ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'hsla(200, 5%, 10%, '+ i/this.trail.length +')';
			ctx.fill();
		}
	}
}

class ParticleSystem {
	constructor() {
		this.particles = [];
		this.constraints = [];
		this.gravity = new Vec(0, 1);
		this.friction = 0.5;
	}
	update() {
		const steps = 16;
		const delta = 1/steps;
		for (let j = 0; j < this.particles.length; j++) {
			this.particles[j].accelerate(this.gravity);
			this.particles[j].simulate(delta);
		}
		for (let i = 0; i < steps; i++) {
			for (let j = 0; j < this.constraints.length; j++) {
				this.constraints[j].resolve(delta);
			}
		}
	}
	draw() {
		let r = 3;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 2;
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].drawTrail();
		}
		for (let i = 0; i < this.constraints.length; i++) {
			this.constraints[i].draw();
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].draw();
		}
	}
}

const ps = new ParticleSystem();

function random(min, max) {
	return +(Math.random() * (max - min) + min).toFixed(3);
}

const center = new Vec(canvas.width / 2, canvas.height / 2);
const centerParticle = new Particle(center);
centerParticle.pinned = true;
ps.particles.push(centerParticle);

let addParticle = (v) => {
	const lastP = ps.particles[ps.particles.length - 1];
	const newP = new Particle(v);
	ps.particles.push(newP);
	ps.constraints.push(new Constraint(lastP, newP));
}

addParticle(center.clone().add(new Vec(80, -10)));
addParticle(center.clone().add(new Vec(60, -80)));

// ps.particles[ps.particles.length - 1].acceleration.add(100);

/* const draw = () => {
	requestAnimationFrame(draw);
	ps.update();
	ps.draw();
}

draw(); */
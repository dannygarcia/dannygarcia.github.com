// interpolation helpers

function lerp(s, e, p) {
	return (1 - p) * s + p * e;
}

function lmap(s, a1, a2, b1, b2) {
	return b1 + ( ((s - a1) * (b2 - b1)) / (a2 - a1) );
}

function clamp(min, max, p) {
	return Math.min(Math.max(p, min), max);
}

// tin (transition-in)

const tinEls = document.querySelectorAll('.tin-bg,.tin-swipe');
const playgroundEl = document.getElementById('playground');
const transitions = [];

class Transitioner {
	constructor(tin) {
		this.tin = tin;
		this.setBoundaries();
		this.progress = 0;
	}
	setBoundaries(min, max) {
		this.rect = this.tin.getBoundingClientRect();
		this.top = this.rect.top;
		this.bottom = clamp(this.rect.top + (min || 50), this.rect.top + (max || 100), this.rect.bottom);
	}
	update(target) {
		// set forward-only progress
		this.progress = Math.max(clamp(0, 1, lmap(target, this.top, this.bottom, 0, 1)), this.progress);
	}
	draw() {}
}

class ElementTransitioner extends Transitioner {
	constructor(tin) {
		super(tin);
		this.transitions = {};
	}
	setBoundaries() {
		super.setBoundaries();
	}
	update(target) {
		super.update(target);
		this.transitions.opacity = this.progress;
		this.transitions.scale = lerp(0.9, 1, this.progress);
		this.transitions.translateY = lerp(100, 0, this.progress);
	}
	draw() {
		this.tin.style.opacity = this.transitions.opacity;
		this.tin.style.transform = `scale(${this.transitions.scale}) translateY(${this.transitions.translateY}px)`;
	}
}

tinEls.forEach(tin => transitions.push(new ElementTransitioner(tin)));

const initialTransitionDuration = 60; // factored in fps
let tick = 0,
	progress = 0,
	target = 0,
	resizing = false,
	mouse = {
		down: false,
		distancestart: 0,
		distanceend: 0,
		velocity: 0
	},
	i;

playgroundEl.addEventListener('mousedown', (e) => {
	mouse.down = true;
	mouse.distancestart = e.pageY;
},false);

playgroundEl.addEventListener('mouseup', (e) => {
	mouse.down = false;
	mouse.distanceend = e.pageY - mouse.distancestart;
},false);

playgroundEl.addEventListener('mousemove', (e) => {
	if (mouse.down) {
		mouse.distanceend = e.pageY - mouse.distancestart;
		mouse.velocity = e.movementY;
		// console.log(mouse.distanceend, mouse.velocity);
	}
},false);

playgroundEl.addEventListener('touchstart', (e) => {
	mouse.down = true;
	mouse.distancestart = e.touches[0].pageY;
},false);

playgroundEl.addEventListener('touchend', (e) => {
	mouse.down = false;
	// console.log(e.touches);
	// mouse.distanceend = e.touches[0].pageY - mouse.distancestart;
},false);

playgroundEl.addEventListener('touchmove', (e) => {
	e.preventDefault();
	mouse.distanceend = e.touches[0].pageY - mouse.distancestart;
	mouse.velocity = e.touches[0].movementY;
	// console.log(mouse.distanceend, mouse.velocity);
},false);

const raf = () => {
	requestAnimationFrame(raf);
	tick++;
	progress = clamp(0, 1, lmap(tick, 0, initialTransitionDuration, 0, 1));
	target = (innerHeight + scrollY) * progress;
	// batched update & draw calls to reduce render invalidations

	for (i = 0; i < transitions.length; i++) {
		if (resizing) {
			transitions[i].setBoundaries();
		}
		transitions[i].update(target, mouse);
	}
	for (i = 0; i < transitions.length; i++) {
		transitions[i].draw(target, mouse);
	}
	if (resizing) {
		resizing = false;
	}
};

if (!matchMedia('(prefers-reduced-motion)').matches) {
	raf();

	addEventListener('resize', () => {
		if (resizing) {
			return;
		}
		resizing = true;
	});
}

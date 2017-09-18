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
const transitions = new Set();

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

tinEls.forEach(tin => transitions.add(new ElementTransitioner(tin)));

const initialTransitionDuration = 60; // factored in fps
let tick = 0,
	progress = 0,
	target = 0,
	resizing = false;

const raf = () => {
	requestAnimationFrame(raf);
	tick++;
	progress = clamp(0, 1, lmap(tick, 0, initialTransitionDuration, 0, 1));
	target = (innerHeight + scrollY) * progress;
	// batched update & draw calls to reduce render invalidations
	for (let tin of transitions) {
		if (resizing) {
			tin.setBoundaries();
		}
		tin.update(target);
	}
	for (let tin of transitions) {
		tin.draw();
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

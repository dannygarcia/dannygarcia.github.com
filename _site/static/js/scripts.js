'use strict';

const c = new Canvas('playground', 0.5);

class Constraint {
	constructor(n0, n1) {
			this.n0 = n0;
			this.n1 = n1;
			const dx = n0.pos.x - n1.pos.x;
			const dy = n0.pos.y - n1.pos.y;
			this.dist = Math.sqrt(dx * dx + dy * dy);
		}
		// solve constraint
	solve() {
			let dx = this.n0.pos.x - this.n1.pos.x;
			let dy = this.n0.pos.y - this.n1.pos.y;
			const currentDist = Math.sqrt(dx * dx + dy * dy);
			const delta = 0.5 * (currentDist - this.dist) / currentDist;
			dx *= delta;
			dy *= delta;
			let m1 = (this.n0.mass + this.n1.mass);
			let m2 = this.n0.mass / m1;
			m1 = this.n1.mass / m1;
			this.n1.pos.x += dx * m2;
			this.n1.pos.y += dy * m2;
			this.n0.pos.x -= dx * m1;
			this.n0.pos.y -= dy * m1;
		}
		// draw constraint
	draw() {
		ctx.beginPath();
		ctx.moveTo(this.n0.pos.x, this.n0.pos.y);
		ctx.lineTo(this.n1.pos.x, this.n1.pos.y);
		ctx.strokeStyle = "turquoise";
		ctx.stroke();
	}
}

class Blob {
	constructor(pos, size) {
		if (!pos) {
			this.pos = new Vector(0, 0);
			this.pos.randomize(0, c.width, 0, c.height);
		} else {
			this.pos = pos;
		}

		this.oldPos = new Vector(this.pos.x, this.pos.y);
		this.size = size;
		this.mass = size * 1.5;
	}

	integrate() {
		const x = this.pos.x;
		const y = this.pos.y;
		this.pos.x += this.pos.x - this.oldPos.x;
		this.pos.y += this.pos.y - this.oldPos.y;
		this.oldPos.x = x;
		this.oldPos.y = y;


		// edges

		if (this.pos.x > c.width - this.size) {
			this.pos.x = c.width - this.size;
		}

		if (this.pos.x < this.size) {
			this.pos.x = this.size;
		}

		if (this.pos.y > c.height - this.size) {
			const d = this.pos.y - c.height + this.size;
			this.pos.x -= d * (this.pos.x - this.oldPos.x) / 2;
			this.pos.y = c.height - this.size;
		}
		// top
		if (this.pos.y < this.size) this.pos.y = this.size;
		// left
		if (this.pos.x > c.width - this.size) this.pos.x = c.width - this.size;
		// right
		if (this.pos.x < this.size) this.pos.x = this.size;
	}

	walk(size) {
		this.size = size;
		this.pos.add({
			x: Math.randFloat(-6, 6),
			y: Math.randFloat(-6, 6)
		});
		this.pos.x = Math.constrain(this.pos.x, 0, c.width);
		this.pos.y = Math.constrain(this.pos.y, 0, c.height);
		this.oldPos.x = this.pos.x;
		this.oldPos.y = this.pos.y;
		// this.pos.randomize(0, width, 0, height);
	}

	stuck(tree) {
		for (let i = 0; i < tree.length; i++) {
			let dist = this.pos.distance(tree[i].pos);
			// if (dist < (this.size * this.size + tree[i].size * tree[i].size + 2 * tree[i].size * this.size)) {
			if (dist < this.size * 2) {
				this.oldPos.add({
					x: Math.randFloat(-0.01, 0.01),
					y: Math.randFloat(-0.01, 0.01)
				});
				return tree[i];
				break;
			}
		}
		return false;
	}

	draw(index) {

		if (typeof index !== 'undefined') {
			index = Math.hslToRgb(index/tree.length/2, 0.5, 0.5, 255);
		} else {
			index = [255, 255, 255, 0];
		}

		c.circle(this.pos, this.size, index);

	}
}

const blobs = [];
const tree = [];
const constraints = [];
let i = 0;
let globalSize = 10;

let moved = false;

const setup = () => {

	const size = globalSize;

	for (let i = 0; i < 300; i++) {
		blobs.push(new Blob(false, size));
	}
	tree.push(new Blob(new Vector(c.width/2, c.height/2), size));

	document.body.addEventListener('mousemove', (e) => {
		moved = true;
		tree[0].mass = 500;
		tree[0].pos.x = e.pageX / 2;
		tree[0].pos.y = e.pageY / 2;
	});

}

// render loop
const render = () => {
	requestAnimationFrame(render);

	c.clear();

	for (i = 0; i < 1; i++) {
		for (let n = 0; n < constraints.length; n++) {
			constraints[n].solve();
		}
	}

	for (i = 0; i < tree.length; i++) {
		// tree[i].solve();
		if (i !== 0) {
			tree[i].integrate();
		} else if (!moved) {
			tree[i].pos.x = c.width/2;
			tree[i].pos.y = c.height/2;
		}
		tree[i].draw(i);
	}


	for (i = 0; i < blobs.length; i++) {
		blobs[i].draw();
	}

	c.render();


	for (let j = 0; j < 2; j++) {

		for (i = 0; i < blobs.length; i++) {
			blobs[i].walk(globalSize);
			let stuck = blobs[i].stuck(tree);
			if (stuck) {
				tree.push(blobs[i]);
				constraints.push(new Constraint(blobs[i], stuck));
				blobs.splice(i, 1);
				globalSize *= 0.99;
			}
		}
	}


}

setup();
render();

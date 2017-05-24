'use strict';

class Walker extends Vector {
	constructor(x, y, radius) {
		super(x, y);
		this.oldX = x;
		this.oldY = y;
		this.radius = radius;
		this.mass = radius * 1.5;
		this.friction = 0.99;
	}

	integrate(stuck) {

		if (this.fixed) {
			return;
		}

		const x = this.x;
		const y = this.y;
		this.x += (this.x - this.oldX) * this.friction;
		this.y += (this.y - this.oldY) * this.friction;
		this.oldX = x;
		this.oldY = y;

		if (stuck) {
			// super.add({
			// 	x: Math.randFloat(-0.1, 0.1),
			// 	y: Math.randFloat(-0.1, 0.1)
			// });

		}

	}

	walk(radius) {
		let dx = center.x - this.x;
		let dy = center.y - this.y;
		this.radius = Math.map((dx * dx + dy * dy)/20000, 1, 7, 7, 1);
		super.add({
			x: Math.randFloat(-1, 1),
			y: Math.randFloat(-1, 1)
		});
		// this.oldX = this.x;
		// this.oldY = this.y;
		this.x = Math.constrain(this.x, -this.radius, c.width + this.radius);
		this.y = Math.constrain(this.y, -this.radius, c.height + this.radius);
		// this.pos.randomize(0, width, 0, height);
	}

	stuck(tree) {
		// this.friction += 1-this.friction;
		for (let i = 0; i < tree.length; i++) {
			let node = tree[i];
			let distance = super.distance(node);

			let deltaXSquared = this.x - node.x; // calc. delta X
			deltaXSquared *= deltaXSquared; // square delta X
			let deltaYSquared = this.y - node.y; // calc. delta Y
			deltaYSquared *= deltaYSquared; // square delta Y

			// Calculate the sum of the radii, then square it
			let sumRadiiSquared = this.radius + node.radius;
			sumRadiiSquared *= sumRadiiSquared;

			if(deltaXSquared + deltaYSquared <= sumRadiiSquared){

				// this.oldX += Math.randFloat(-0.1, 0.1);
				// this.oldY += Math.randFloat(-0.1, 0.1);
				this.parent = node;
				return node;
				break;
			}
		}

		return false;
	}

	draw(index) {

		if (typeof index !== 'undefined') {
			index = Math.hslToRgb(Math.lerp((index/tree.length), 0.5, 0.8), 0.5, 0.5, 255);
		} else {
			index = [127, 127, 127, 255];
		}

		c.circle(this, this.radius, index);

	}
}

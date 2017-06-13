'use strict';

class Walker extends Vector {
	constructor(x, y, radius) {
		super(x, y);
		this.oldX = x;
		this.oldY = y;
		this.radius = radius;
		this.mass = radius * 1.5;
		this.friction = 0.99;
		this.baseColor = [Math.randFloat(0.5, 0.8), Math.randFloat(0.45, 0.55), Math.randFloat(0.45, 0.55), Math.randInt(250, 255)];
	}

	correct(v) {
      if (this.pinned) {
        return;
      }
      this.add(v);
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

		// console.log(this.x, this.y);

	}

	walk(radius) {
		let dx = center.x - this.x;
		let dy = center.y - this.y;
		this.radius = Math.map((dx * dx + dy * dy)/20000, 1, 7, 7, 1);
		super.add(new Vector(
			Math.randFloat(-1, 1),
			Math.randFloat(-1, 1)
		));
		this.x = Math.constrain(this.x, -this.radius, c.width + this.radius);
		this.y = Math.constrain(this.y, -this.radius, c.height + this.radius);
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
			index = Math.hslToRgb(Math.lerp((index/tree.length), this.baseColor[0], 0.8), this.baseColor[1], this.baseColor[2], this.baseColor[3]);
		} else {
			index = [127, 127, 127, 255];
		}

		c.circle(this, this.radius, index);

	}
}

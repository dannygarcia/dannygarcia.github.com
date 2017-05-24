'use strict';

// 2D Vector

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
	}

	subtract(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
	}

	multiply(vector) {
		this.x *= vector.x;
		this.y *= vector.y;
	}

	divide(vector) {
		this.x /= vector.x;
		this.y /= vector.y;
	}

	randomize(minX, maxX, minY, maxY) {
		this.x = Math.randFloat(minX, maxX);
		this.y = Math.randFloat(minY, maxY);
	}

	rotate(vector, theta) {
		let x = this.x - vector.x;
		let y = this.y - vector.y;
		this.x = x*Math.cos(theta) - y*Math.sin(theta) + vector.x;
		this.y = x*Math.sin(theta) + y*Math.cos(theta) + vector.y;
	}

	// distance(vector) {
	// 	return Math.hypot(vector.x-this.x, vector.y-this.y);
	// }
	distance(vector) {
		let dx = vector.x - this.x;
		let dy = vector.y - this.y;
		return dx * dx + dy * dy;
	}
}


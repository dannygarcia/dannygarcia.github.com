'use strict';

// 2D Vector

class Vector {
	constructor(x, y) {
		[this.x, this.y] = [x, y];
	}

	equals(v) {
		if (v instanceof Vector) {
			return this.x === v.x && this.y === v.y;
		} else {
			return this.x === v && this.y === v;
		}
	}

	set(v) {
		[ this.x, this.y ] = v instanceof Vector ?
		[ v.x, v.y ]:[ v, v ];
		return this;
	}

	add(v) {
		[this.x, this.y] = v instanceof Vector ?
		[ this.x + v.x, this.y + v.y ] :
		[ this.x + v, this.y + v ];
		return this;
	}

	subtract(v) {
		[this.x, this.y] = v instanceof Vector ?
		[ this.x - v.x, this.y - v.y ] :
		[ this.x - v, this.y - v ];
		return this;
	}

	multiply(v) {
		[this.x, this.y] = v instanceof Vector ?
		[ this.x * v.x, this.y * v.y ] :
		[ this.x * v, this.y * v ];
		return this;
	}

	divide(v) {
		[this.x, this.y] = v instanceof Vector ?
		[ this.x / v.x, this.y / v.y ] :
		[ this.x / v, this.y / v ];
		return this;
	}

	randomize(minX, maxX, minY, maxY) {
		this.x = Math.randFloat(minX, maxX);
		this.y = Math.randFloat(minY, maxY);
	}

	clone() {
		return new Vector(this.x, this.y);
	}

	distance(v) {
		const d = this.clone().subtract(v);
		return Math.sqrt(d.x * d.x + d.y * d.y);
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	angle(v) {
		return Math.atan2(this.x * v.y - this.y * v.x, this.x * v.x + this.y * v.y);
	}

	angleBetween(vA, vB) {
		const vAdiff = vA.clone().subtract(this);
		const vBdiff = vB.clone().subtract(this);
		return vAdiff.angle(vBdiff);
	}

	rotate(origin, angle) {
		const diff = this.clone().subtract(origin);
		[this.x, this.y] = [diff.x * Math.cos(angle) - diff.y * Math.sin(angle) + origin.x, diff.x * Math.sin(angle) + diff.y * Math.cos(angle) + origin.y];
		return this;
	}
}

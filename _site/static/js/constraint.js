'use strict';

class Constraint {
	constructor(p1, p2) {
		[this.p1, this.p2] = [p1, p2];
		this.target = p1.distance(p2);
	}
	solve() {
		const [ pos1, pos2 ] = [ this.p1.clone(), this.p2.clone() ];
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
	// draw() {
	// 	ctx.strokeStyle = '#457B9D';
	// 	ctx.beginPath();
	// 	ctx.moveTo(this.p1.x, this.p1.y);
	// 	ctx.lineTo(this.p2.x, this.p2.y);
	// 	ctx.stroke();
	// }
}

class AngleConstraint {
	constructor(p1, p2, p3, stiffness) {
		[ this.p1, this.p2, this.p3, this.stiffness ] = [ p1, p2, p3, stiffness ];
		this.angle = this.p2.angleBetween(this.p1, this.p3);
	}
	solve(delta) {
		const angle = this.p2.angleBetween(this.p1, this.p3);
		this.diff = angle - this.angle;

		if (this.diff <= -Math.PI) {
			this.diff += 2 * Math.PI;
		} else if (this.diff >= Math.PI) {
			this.diff -= 2 * Math.PI;
		}

		this.diff *= (delta) * this.stiffness;

		if (!this.p1.pinned) {
			this.p1 = this.p1.clone().rotate(this.p2, this.diff);
		}

		if (!this.p3.pinned) {
			this.p3 = this.p3.clone().rotate(this.p2, -this.diff);
		}

		if (!this.p2.pinned) {
			this.p2 = this.p2.clone().rotate(this.p1, this.diff);
			this.p2 = this.p2.clone().rotate(this.p3, -this.diff);
		}
	}
	// draw() {
	// 	ctx.strokeStyle = '#457B9D';
	// 	ctx.beginPath();
	// 	ctx.moveTo(this.p1.x, this.p1.y);
	// 	ctx.lineTo(this.p2.x, this.p2.y);
	// 	ctx.lineTo(this.p3.x, this.p3.y);
	// 	ctx.stroke();
	// }
}

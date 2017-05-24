'use strict';

class Constraint {
	constructor(n0, n1, n2, s) {
		this.n0 = n0;
		this.n1 = n1;
		this.n2 = n2;


		this.angle = this.angle2(this.n0, this.n1, this.n2);

		this.s = s;

		// const dx = n0.x - n1.x;
		// const dy = n0.y - n1.y;
		// this.dist = Math.sqrt(dx * dx + dy * dy);
	}
	angle2(n0, n1, n2) {
		let ldx = n0.x - n1.x;
		let ldy = n0.y - n1.y;

		let rdx = n2.x - n1.x;
		let rdy = n2.y - n1.y;

		return Math.atan2(ldx*rdy-ldy*rdx,ldx*rdx+ldy*rdy);
	}
	// solve constraint
	solve(stepCoef) {
		let diff = this.angle2(this.n0, this.n1, this.n2) - this.angle;

		if (diff <= -Math.PI)
			diff += 2*Math.PI;
		else if (diff >= Math.PI)
			diff -= 2*Math.PI;

		diff *= stepCoef*this.s;

		this.n0.rotate(this.n1, diff);
		// this.a.pos = this.a.pos.rotate(this.b.pos, diff);
		this.n2.rotate(this.n1, -diff);
		// this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
		this.n1.rotate(this.n0, diff);
		// this.b.pos = this.b.pos.rotate(this.a.pos, diff);
		this.n1.rotate(this.n2, -diff);
		// this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
	}
	/*solve() {
		let dx = this.n0.x - this.n1.x;
		let dy = this.n0.y - this.n1.y;
		const currentDist = Math.sqrt(dx * dx + dy * dy);
		const delta = 0.5 * (currentDist - this.dist) / currentDist;
		dx *= delta;
		dy *= delta;
		let m1 = (this.n0.mass + this.n1.mass);
		let m2 = this.n0.mass / m1;
		m1 = this.n1.mass / m1;
		this.n1.x += dx * m2;
		this.n1.y += dy * m2;
		this.n0.x -= dx * m1;
		this.n0.y -= dy * m1;
	}*/
	// draw constraint
	draw() {
		ctx.beginPath();
		ctx.moveTo(this.n0.x, this.n0.y);
		ctx.lineTo(this.n1.x, this.n1.y);
		ctx.strokeStyle = "turquoise";
		ctx.stroke();
	}
}

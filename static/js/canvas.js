'use strict';

// Some canvas helpers for metrics & drawing pixels.
class Canvas {
	constructor(id, resFactor) {
		this.el = document.getElementById(id);
		this.ctx = this.el.getContext('2d');
		this.resFactor = resFactor || 1;
		this.cache = [];

		this.updateMetrics();
		this.updateData();
		addEventListener('resize', this.updateMetrics.bind(this));
	}

	updateMetrics() {
		let rect = this.el.getBoundingClientRect();
		this.width = this.el.width = Math.round(rect.width * this.resFactor);
		this.height = this.el.height = Math.round(rect.height * this.resFactor);
		// this.indexer = this.indexBuilder(this.width);
	}

	updateData() {
		this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
		// this.pixelData = this.imageData.data;
		const buf = new ArrayBuffer(this.imageData.data.length);
		this.buf8 = new Uint8ClampedArray(buf);
		this.pixelData = new Uint32Array(buf);
	}

	// clears the canvas
	clear() {
		for (let i = 0; i < this.pixelData.length; i++) {
			// this.pixelData[i] = (255 << 24) | (255 << 16) | (0 << 8) | 0; // blue
			this.pixelData[i] = 0;
		}
		// this.ctx.clearRect(0, 0, this.width, this.height);
		// this.updateData();
	}

	// renders pixelData back to the canvas
	render() {
		this.imageData.data.set(this.buf8);
		this.ctx.putImageData(this.imageData, 0, 0);
	}

	// draws a pixel to the canvas pixelData array
	// rgba is an Array [0-255, 0-255, 0-255, 0-255]
	// fast buffer method
	// https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
	pixel(x, y, rgba) {
		/*let i = 4 * (y * this.width + x);
		this.pixelData[i] = rgba[0]; // Red
		this.pixelData[i + 1] = rgba[1]; // Green
		this.pixelData[i + 2] = rgba[2]; // Blue
		this.pixelData[i + 3] = rgba[3]; // Alpha

		i = null;*/
		this.pixelData[y * this.width + x] = (rgba[3] << 24) | (rgba[2] << 16) | (rgba[1] << 8) | rgba[0];
	}

	circle(origin, radius, rgba) {
		const originX = Math.floor(origin.x);
		const originY = Math.floor(origin.y);
		const circle = this.getCircle(radius);

		for (let i = 0; i < circle.length; i+= 2) {
			this.pixel(originX + circle[i], originY + circle[i + 1], rgba);
		}
	}

	// makes a pretty convincing circle & caches it
	// http://stackoverflow.com/a/14976268
	// Investigate: suspicious that this adds little to no value
	// and may actually be making things slower because it creates
	// an exponentially larger array as the radii increase.
	// Int8Array helps Safari but not other browsers.
	getCircle(radius) {
		radius = Math.round(radius);
		if (!!this.cache[radius]) {
			return this.cache[radius];
		}

		let x = radius;
		let y = 0;
		let decisionOver2 = 1 - x;
		let i;

		let pixelData = [];

		while(x >= y) {
			for (i = -x; i <= x; i++) {
				pixelData.push(i, y, i, -y);
			}
			for (i = -y; i <= y; i++) {
				pixelData.push(i, x, i, -x);
			}

			y++;
			if (decisionOver2 <= 0) {
				decisionOver2 += 2 * y + 1;
			} else {
				x--;
				decisionOver2 += 2 * (y - x) + 1;
			}
		}

		x = y = decisionOver2 = i = null;

		return this.cache[radius] = new Int8Array(pixelData);

	}
}

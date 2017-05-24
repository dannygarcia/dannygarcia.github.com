'use strict';

// Nice Math Things

Math.lerp = function(ratio, start, end) {
	return start + (end - start ) * ratio;
};

Math.map = function(val, min1, max1, min2, max2) {
	return this.lerp(this.norm( val, min1, max1 ), min2, max2 );
};

Math.norm = function(val, min, max) {
	return (val - min) / (max - min);
};

Math.clamp = function(val, min, max) {
	return this.max(min, this.min(max, val));
};

Math.randFloat = function(min,max) {
	return (this.random()*(max-min))+min;
};

Math.constrain = function(val, low, high) {
  return Math.max(Math.min(val, high), low);
};

Math.randInt = function(min,max) {
	return this.floor( (this.random()*(max-min))+min );
};

Math.smoothstep = function(val, min, max) {
	var x = this.clamp(this.norm(val, min, max), 0, 1);
    return x * x * (3 - x * 2);
};

// http://stackoverflow.com/a/9493060
Math.hslToRgb = (h, s, l, a) => {
	let r, g, b;

	if (s === 0) {
		r = g = b = 1;
	} else {
		const hue2rgb = (p, q, t) => {
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}

// http://stackoverflow.com/a/9493060
Math.rgbToHsl = function(r, g, b){
	r /= 255, g /= 255, b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	}else{
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

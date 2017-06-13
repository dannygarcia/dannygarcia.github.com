// prep vertically-split text
document.querySelectorAll('main footer p').forEach(s => {
	const splitNode = s.querySelector('.split');
	let html = '';
	splitNode.innerText.split('').forEach(n => {
		if (typeof n !== 'undefined') {
			html += '<span class=\"shiny\">' + n + '</span>';
		}
	});
	splitNode.innerHTML = html;
});

const shinies = document.querySelectorAll('.shiny, article a');
shinies.forEach(s => {
	s.cachedTop = s.getBoundingClientRect().top;
	s.rgb = getComputedStyle(s)
		.color // get CSS color value
		.match(/\((.*)\)/)[1] // match parenthesis
		.split(',') // split each value
		.map(n => parseInt(n, 10)); // cast as number
	s.hsl = Math.rgbToHsl(...s.rgb);
	console.log(s.hsl);
});

cycleColor = (s, scroll, height) => {
	s.style.color = 'hsl('+(s.hsl[0] + (Math.sin((scroll - s.cachedTop) / (height / 5)) * 10))+','+(s.hsl[1] + (Math.sin((scroll - s.cachedTop) / (height / 5)) * 40))+'%,'+(s.hsl[2] + (Math.sin((scroll - s.cachedTop) / (height / 5)) * 40))+'%)';
};

cycleColors = () => {
	shinies.forEach(s => cycleColor(s, window.scrollY, window.innerHeight));
};

let y = scrollY;
// requestAnimationFrame(raf = () => {
// 	if (y !== scrollY) {
// 		y = scrollY;
// 		cycleColors();
// 		raf();
// 	}
// });

// addEventListener('scroll', raf);

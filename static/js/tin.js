const tins = document.querySelectorAll('.tin-bg,.tin-swipe');
tins.forEach((tin, i) => {
	tin.classList.add('tin-pre');
	setTimeout(() => {
		tin.classList.remove('tin-pre');
		tin.classList.add('tin');
	}, 160 * i);
});
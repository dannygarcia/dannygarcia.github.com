/* Springy Emoji */
/*
var coolEmojis = ['🙃', '🤓', '😎', '😡', '🤔', '👹', '👻', '👏', '👋', '👊', '✌️', '🖕', '🐙', '🐍', '🍃', '🌎', '🌚', '☄', '🔥', '⛈', '💦', '🍑', '🍣', '🏄', '🎟', '👾', '🚀', '💸', '💯', '🇺🇸'];

var characters = coolEmojis.slice(0);

var container = document.getElementById('emoji-container');

function randomCharacter() {
	var index = Math.floor(Math.random() * characters.length);
	console.log(characters.length, coolEmojis.length);
	if (!characters.length) {
		characters = coolEmojis.slice(0);
	}
	return characters.splice(index, 1);
}

var frameRate = 1/60;
var stiffness = -20; // kg / s^2
var spring_length = 1; //kg / s
var damping = -2; // kg /s

var item = {
	position: 0,
	velocity: 0,
	mass: 0.5
};

var spring, damper, a;

function draw() {

	spring = stiffness * (item.position - spring_length);
	damper = damping * item.velocity;

	a = (spring + damper) / item.mass;

	item.velocity += a * frameRate;
	item.position += item.velocity * frameRate;

	container.style.transform = 'scale('+item.position+')';
	// container.style.transform = 'scale('+item.position+') rotate('+((item.position*360)+20)+'deg)';


	requestAnimationFrame(draw);
}

draw();

function setContainerToRandomCharacter() {
	item.position = 0;
	item.velocity = 0;
	requestAnimationFrame(function () {
		container.innerHTML = randomCharacter();
	});
}

container.addEventListener('click', setContainerToRandomCharacter);

// setInterval(function () {
// 	setContainerToRandomCharacter();
// 	// spring_length = (Math.random() * 1) + 1;
// }, 3000);

// setContainerToRandomCharacter();
*/

/* Shadow Boxes */
/*
var shadowable = document.querySelectorAll('article');
var shadowTime = 0;

function draw() {

	shadowTime += 0.02;
	shadowTime = shadowTime % (360);

	for (var i = 0; i < shadowable.length; i++) {
		shadowable[i].style.boxShadow = Math.cos(Math.PI * shadowTime) + 'em 1em 0 0 #000';
	}

	i = null;

	requestAnimationFrame(draw);

}

// draw();
*/


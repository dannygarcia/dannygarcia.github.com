'use strict';

const c = new Canvas('playground', 1);

const walkers = [];
const maxWalkers = 500;
const walkerRadius = 2;
let walkerCount = 0;

const tree = [];
const constraints = [];
// let moved = false;
let globalRadius = 10;
let i, j;

let center = new Vector(c.width / 2, c.height / 2);

const setup = () => {

	// const size = globalRadius;

	// for (let i = 0; i < 300; i++) {
	// 	walkers.push(new Walker(size));
	// }
	const center = new Walker(c.width/2, c.height/2, globalRadius);
	const centerBase = new Walker(c.width/2 + 10, c.height/2, globalRadius);
	center.parent = centerBase;
	centerBase.parent = center;
	// center.fixed = centerBase.fixed = true;
	tree.push(centerBase, center);

	// constraints.add(new Constraint(firstWalker, third, secondWalker, 1));

	// document.body.addEventListener('mousemove', (e) => {
	// 	// moved = true;
	// 	// center.x = e.pageX / 2;
	// 	// center.y = e.pageY / 2;
	// 	// center.add({x: e.pageX, y: e.pageY});
	// 	// tree[0].mass = 500;
	// 	tree[1].x = e.pageX / 2;
	// 	tree[1].y = e.pageY / 2;
	// });

}

// render loop
let frame = 0;
let treeInx = tree.length;
const render = () => {
	frame++;
	requestAnimationFrame(render);

	if (walkerCount < maxWalkers && frame % 2 === 0) {
		let along = Math.random() < 0.5 ? 'width' : 'height';
		let point = Math.random() * c[along];
		walkers.push(new Walker(
			along === 'width' ? point : Math.random() < 0.5 ? 0 : c.width,
			along === 'height' ? point : Math.random() < 0.5 ? 0 : c.height,
			walkerRadius
		));
		// walkers.push();
		walkerCount++;
		along = point = null;
	}

	c.clear();

	// console.log(walkers.values().next());
	// walkers.forEach(function () {console.log(arguments)});

	for (i = 0; i < walkers.length; i++) {
		let walker = walkers[i];
		if (!walker.isStuck) {
			walker.integrate();
			walker.walk();
			walker.draw();
			const stuck = walker.stuck(tree);
			if (stuck) {
				walker.isStuck = true;
				tree.push(walker);
				stuck.x += (walker.x - walker.oldX) * 0.02;
				stuck.y += (walker.y - walker.oldY) * 0.02;
				walker.oldX = walker.x;
				walker.oldY = walker.y;
				walkers.splice(i, 1);
				constraints.push(new Constraint(stuck.parent, stuck));
				// constraints.push(new Constraint(stuck.parent, stuck));
				// constraints.push(new Constraint(stuck.parent, walker));
				// constraints.push(new AngleConstraint(stuck.parent, stuck, walker, walker.friction));
			}
		}
	}

	for (let i = 0; i < tree.length; i++) {
		let node = tree[i];
		node.integrate(true);
		// node.friction = 1-(i / tree.length);
		// if (i > 1) {
		// }
		node.draw(i);
	}

	for (i = 0; i < 16; i++) {
		for (let c in constraints) {
			constraints[c].solve(0.0625); // 1/16
			// c.draw();
		}
	}


/*	for (i = 0; i < tree.length; i++) {
		console.log('treeloop');
		// tree[i].solve();
		if (i !== 0) {
		}
			tree[i].integrate(true);

		tree[i].friction = 1-(i / tree.length);

		// if (i !== 0) {
		// } else if (!moved) {
		// 	tree[i].pos.x = c.width/2;
		// 	tree[i].pos.y = c.height/2;
		// }
		tree[i].draw(i);
	}
*/

	// for (i = 0; i < walkers.length; i++) {
	// 	walkers[i].integrate();
	// 	walkers[i].draw();
	// }

	if (frame < 60*30) {
		c.render();
	}

}

setup();
render();

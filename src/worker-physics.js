// helpers
importScripts("/src/libs/cannon.build.js");
function random(min, max) {
    if (!min) {
        min = 1;
    }
    if (!max) {
        max = min;
        min = 0;
    }
    return (Math.random() * (max - min) + min);
}
function pcurve(x, a, b) {
    const k = Math.pow(a+b,a+b) / (Math.pow(a,a)*Math.pow(b,b));
    return k * Math.pow( x, a ) * Math.pow( 1.0-x, b );
}

// setup world
let world = new CANNON.World();
world.broadphase = new CANNON.NaiveBroadphase();
world.gravity.set(0,0,0);
world.solver.tolerance = 0.001;
const worldPoint = new CANNON.Vec3(0,0,0);

// sphere config
const sphereMass = 300;
let sphereShape = new CANNON.Sphere(1);
let sphereMaterial = new CANNON.Material('');
sphereMaterial.friction = 0;

let spheres = [];

function resetBody(body) {
    // random starting position
    body.position = new CANNON.Vec3(random(-.1,.1), random(-.1,.1), random(-.1,.1));
    // random starting angle
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(random(1),random(1),random(1)), random(-180,180));
    // random impulse
    body.applyLocalImpulse(new CANNON.Vec3(30,30,30), new CANNON.Vec3(random(-30,30),random(-30,30),random(-30,30)));
    body.shapes[0].radius = 0.001;
    return body;
}

self.onmessage = function(e) {

    let positions = e.data.positions;
    let quaternions = e.data.quaternions;
    let scales = e.data.scales;

    if (e.data.create) {
        let i = spheres.length;
        let body = new CANNON.Body({
            mass: sphereMass,
            shape: new CANNON.Sphere(1),
            angularDamping: 0.2,
            linearDamping: .01,
            material: sphereMaterial
        });

        body = this.resetBody(body);

        // add to lists
        spheres.push(body);
        scales[3*i+0] = 0.001; // scale
        scales[3*i+1] = 0; // age
        scales[3*i+2] = random(200,800); // life
        world.addBody(body);
    }
    // Step the world
    world.step(e.data.dt);

    for (var i = 0; i < spheres.length; i++) {
        let body = spheres[i];
        let scale = scales[3*i+0];
        let age = scales[3*i+1];
        let life = scales[3*i+2];
        scale = pcurve(age/life, .464, .176);
        // increase age
        age++;
        // reset after death
        if (age>life) {
            scale = 0.001;
            age = 0;
            life = random(200,800);
            body = this.resetBody(body);
        }
        // set scale
        body.shapes[0].radius = scale;
        // move spheres to center
        body.applyForce(
            new CANNON.Vec3(
                -body.position.x * 700,
                -body.position.y * 700,
                -body.position.z * 700),
                worldPoint);
        // save data
        let p = body.position,
            q = body.quaternion;
        positions[3*i + 0] = p.x;
        positions[3*i + 1] = p.y;
        positions[3*i + 2] = p.z;
        quaternions[4*i + 0] = q.x;
        quaternions[4*i + 1] = q.y;
        quaternions[4*i + 2] = q.z;
        quaternions[4*i + 3] = q.w;
        // ensure scale data is saved
        scales[3*i + 0] = scale;
        scales[3*i + 1] = age;
        scales[3*i + 2] = life;
    }
    // Send data back to the main thread
    self.postMessage({
        create: e.data.create,
        positions: positions,
        quaternions: quaternions,
        scales: scales
    }, [positions.buffer,
        quaternions.buffer,
        scales.buffer]);
        
};
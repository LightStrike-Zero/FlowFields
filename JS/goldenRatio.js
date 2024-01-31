let centralPoint;
let particles = [];
let a = 1;
let b = 0.3063489; // This constant is related to the golden ratio
const goldenRatio = (1 + Math.sqrt(5)) / 2;
const goldenAngle = (Math.PI / goldenRatio); // Use PI instead of TWO_PI

function setup() {
    createCanvas(windowWidth, windowHeight);
    centralPoint = createVector(width / 2, height / 2);
  
    for (let i = 0; i < 300; i++) {
      particles.push(new Particle());
    }
  }

  function draw() {
    background(0);
    translate(width / 2, height / 2);
  
    particles.forEach(particle => {
      particle.applyGoldenSpiralForce();
      particle.update();
      particle.show();
    });
  }

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector();
    this.acc = createVector();
  }

  applyGoldenSpiralForce() {
    let offset = this.pos.copy().sub(centralPoint);
    let distance = offset.mag();
    let theta = atan2(offset.y, offset.x);

    let phi = theta + goldenAngle;
    let r = 0.1 * exp(0.1 * phi);

    let spiralX = centralPoint.x + r * cos(phi);
    let spiralY = centralPoint.y + r * sin(phi);
    let spiralPos = createVector(spiralX, spiralY);

    let force = spiralPos.sub(this.pos);
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    stroke(255, 10);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }
}

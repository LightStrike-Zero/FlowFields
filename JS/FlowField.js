// Flow field variables
let cols, rows;
let flowField;

// Canvas variables
let canvas;
let ctx;

// Particle variables
let particles = [];
const particleCount = 200;

function setup() {
  canvas = document.getElementById('flow-field-canvas');
  ctx = canvas.getContext('2d');

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Calculate the number of columns and rows in the flow field
  cols = Math.floor(canvas.width / 20);
  rows = Math.floor(canvas.height / 20);

  // Initialize the flow field
  flowField = new Array(cols * rows);

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Set up the animation loop
  requestAnimationFrame(draw);
}

function draw() {
  // Update the flow field
  calculateFlowField();

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and display particles
  for (const particle of particles) {
    particle.update();
    particle.display();
  }

  // Request the next frame
  requestAnimationFrame(draw);
}

function calculateFlowField() {
  // Generate Perlin noise for flow field values
  // You can use a library like "noisejs" for Perlin noise
  // For simplicity, we'll use random values for demonstration
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = Math.random() * Math.PI * 2; // Random angle
      const v = p5.Vector.fromAngle(angle); // Create a vector from the angle
      flowField[index] = v;
    }
  }
}

class Particle {
  constructor() {
    this.pos = new p5.Vector(Math.random() * canvas.width, Math.random() * canvas.height);
    this.vel = new p5.Vector(0, 0);
    this.acc = new p5.Vector(0, 0);
    this.maxSpeed = 2;
    this.prevPos = this.pos.copy();
  }

  update() {
    const x = Math.floor(this.pos.x / canvas.width * cols);
    const y = Math.floor(this.pos.y / canvas.height * rows);
    const index = x + y * cols;
    const force = flowField[index].copy();
    force.mult(0.1);
    this.applyForce(force);

    this.prevPos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  display() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(this.prevPos.x, this.prevPos.y);
    ctx.lineTo(this.pos.x, this.pos.y);
    ctx.stroke();
  }
}

// Initialize the flow field effect
window.addEventListener('load', setup);

// Define global variables for the flow field
let flowField = [];
let particles = [];
let cols, rows;
let zoff = 0;
let yoff = 0;
let xoff = 0;

let startTime;
let frameCount;

let colorNoise;

let usingBlackHole = false;

let zoom = 1;

let increment = 0.1;
let canvas;
let numberOfParticles = 800;
let goldenRatio = 1.618;
let direction = Math.random() * Math.PI * 2;
let noiseType = direction;

let timeScale = 0.02;
let minMagnitude = 0.5;
let maxMagnitude = 1;
let attraction = 0.9;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("MyCanvas");

  cols = floor(width / 10);
  rows = floor(height / 10);

  createParticles(numberOfParticles);
  simplex = new SimplexNoise();
  perlin = new PerlinNoise();
  worley = new WorleyNoise(10, windowWidth, windowHeight)

  noiseDetail(6);
}

// this is the main "draw" loop
function draw() {
  let time = millis() - startTime;
  frameCount++;
  if(!usingBlackHole){
    calculateVectorField();
  } else {
    blackHole();
  }
  moveParticles();
  timeScale += 0.002;
}

function setColorMode(){

}

function colorTest(newColor) {
  Particle.color = newColor;
}

function updateColor(Particle) {
  let centre = createVector((width / 2) + 35, (height / 2));
  let distanceToCentre = Particle.position.dist(centre);
  
  let chaos = Math.random() * 30; // introduce chaos hehe
  let thresholdOne = 88; // black no-light zone
  let thresholdTwo = 95; // brightest most inner orange bands
  let thresholdThree = 110; // inner orange/yellow bands
  let thresholdFour = 160; 
  let thresholdFive = 280; 
  let thresholdSix = 380; 
  
  if (distanceToCentre < thresholdOne + chaos / 4) {
    Particle.color = color(0);
  }
  else if(distanceToCentre < thresholdTwo + chaos * 3) {
    Particle.color = color(255, 254, 236, Particle.alpha);
  }
  else if(distanceToCentre < thresholdThree + (chaos * 3)) {
    Particle.color = color(253, 232, 153, Particle.alpha);
  }
  else if(distanceToCentre < thresholdFour + (chaos * 5)) {
    Particle.color = color(249, 205, 22, Particle.alpha);
  }
  else if(distanceToCentre < thresholdFive + (chaos * 8)) {
    Particle.color = color(243, 196, 78, Particle.alpha);
  }
  else if(distanceToCentre < thresholdSix + (chaos * 13)) {
    Particle.color = color(245, 179, 67, Particle.alpha);
  } 
  else {
    Particle.color = color(245, 177, 66, Particle.alpha);
  }
}

// spawns the particles and creates objects
function createParticles(amount) {
  for (let i = 0; i < amount; i++) {
    particles[i] = new Particle();
  }
}

function setNoiseType(newNoiseType) {
  noiseType = newNoiseType;
}

function selectNoiseType(selection) {
  let fineScale = 0.1 * zoom;
  let coarseScale = 1.5 * zoom;

  switch (selection) {
    case 1:
      // Fine-grained Simplex noise
      return simplex.noise(xoff * fineScale + timeScale, yoff * fineScale - timeScale);
    case 2:
      // Coarse-grained built-in noise with time evolution
      return noise(xoff * coarseScale, yoff * coarseScale, zoff);
    case 3:
      // Fine-grained Perlin noise
      return perlin.noise(xoff * fineScale, yoff * fineScale, zoff * fineScale);
    case 4:
      return worley.getNoise(xoff * fineScale, yoff * fineScale);
    default:
      // Layered noise combining Simplex and Perlin at different scales
      let fineNoise = simplex.noise(xoff * fineScale, yoff * fineScale);
      let coarseNoise = perlin.noise(
        xoff * coarseScale,
        yoff * coarseScale,
        zoff * coarseScale
      );
      return (fineNoise + coarseNoise) / 2;
  }
}

// this is used for "noise-based" flow fields
function calculateVectorField() {
  yoff = 0;
  for (let y = 0; y < rows; y++) {
    xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let noiseValue = selectNoiseType(3) * TWO_PI; // Get noise value
      let angle = noiseValue; // Map noise value to a possible angle
      colorNoise = map(noiseValue, 0, 1, 0, 255);
      let magnitude = map(noiseValue, -1, 1, minMagnitude, maxMagnitude); // Map noise value to desired magnitude range
      let vector = p5.Vector.fromAngle(angle);
      vector.setMag(magnitude); // Set the vector's magnitude based on the noise
      flowField[index] = vector;
      xoff += increment;
    }

    yoff += increment;
    zoff += 0.0003;
  }
}

// this is used for a spiral black hole like effect
function blackHole() {
  let centerX = width / 2;
  let centerY = height / 2;
  let scale = 10;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      // Calculate the position of the current point
      let posX = x * scale;
      let posY = y * scale;

      // Calculate the angle towards the center of the canvas
      let angleTowardsCenter = atan2(centerY - posY, centerX - posX);

      // Calculate the straight flow from right to left
      let straightFlowAngle = PI * 2;

      // Determine how much the particle should be attracted to the center based on its distance
      let distance = dist(centerX, centerY, posX, posY);
      //let pullForce = Math.random() * 1 + 0.5;
      let attractionStrength = map(distance, 0, width, attraction, 0.3); // Stronger attraction when closer to the center
      //console.log(pullForce);
      // Interpolate between the straight flow and attraction to the center
      let angle = lerp(straightFlowAngle, angleTowardsCenter, attractionStrength);

      // Create a vector from the angle
      let vector = p5.Vector.fromAngle(angle);

      // Set the magnitude of the vector
      // Closer to the center might mean a stronger pull
      let magnitude = map(distance, 0, width, maxMagnitude, minMagnitude);
      vector.setMag(magnitude);

      // Assign the vector to the flow field
      flowField[index] = vector;
    }
  }
}

// does what it sounds like
function moveParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowField);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}


function setNumberOfParticles(updatedNumberOfParticles) {
  if (updatedNumberOfParticles > 0) {
    numberOfParticles = updatedNumberOfParticles;
  }
}

// Particle class
class Particle {
  constructor() {
    this.spawnParticle();
  }

  
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifetime -= 1;
    
    this.interpolateAlpha();
    
    if(this.lifetime <= 0) {
      this.spawnParticle();
    } else {
      this.colorMode();
    }
  }

  velocityColor() {
    let speed = this.velocity.mag();
    let colorValue = map(speed, 0, 1, 0, 25);
    this.color = color(colorValue);
  }

  timeColor(){
    colorMode(HSB, 360, 100, 100, 100);
    this.color = (frameCount + this.pos.x) % 360; // Cycle hue over time
  }

  noiseColor(){
    this.color = colorNoise;
  }
  
  // determine which color mode to use
  colorMode(){
    if(usingBlackHole) {
      this.colorBlackHole();
    } else {
      this.noiseColor();
    }
  }

  colorBlackHole() {
    let centre = createVector((width / 2) + 35, (height / 2));
    let distanceToCentre = this.position.dist(centre);
    
    let chaos = Math.random() * 30; // introduce chaos hehe
    let thresholdOne = 88; // black no-light zone
    let thresholdTwo = 95; // brightest most inner orange bands
    let thresholdThree = 110; // inner orange/yellow bands
    let thresholdFour = 160; 
    let thresholdFive = 280; 
    let thresholdSix = 380; 
    
    if (distanceToCentre < thresholdOne + chaos / 4) {
      this.color = color(0);
    }
    else if(distanceToCentre < thresholdTwo + chaos * 3) {
      this.color = color(255, 254, 236, this.alpha);
    }
    else if(distanceToCentre < thresholdThree + (chaos * 3)) {
      this.color = color(253, 232, 153, this.alpha);
    }
    else if(distanceToCentre < thresholdFour + (chaos * 5)) {
      this.color = color(249, 205, 22, this.alpha);
    }
    else if(distanceToCentre < thresholdFive + (chaos * 8)) {
      this.color = color(243, 196, 78, this.alpha);
    }
    else if(distanceToCentre < thresholdSix + (chaos * 13)) {
      this.color = color(245, 179, 67, this.alpha);
    } 
    else {
      this.color = color(245, 177, 66, this.alpha);
    }
  }

  // not currently using
  checkProximityToCentre() {
    let centre = createVector((width / 2) + 35, (height / 2));
    return distanceToCentre = this.position.dist(centre);
  }

  interpolateAlpha() {
    this.alpha = map(this.initialLifetime - this.lifetime, 0, this.initialLifetime, 0, 255);
  }


  setColor(newColor) {
    this.color = newColor;
  }

  setColorFade(time, startColor, endColor, duration) {
    let amt = map(time, 0, duration, 0, 1, true); // Map the time to a range between 0 and 1
    return lerpColor(startColor, endColor, amt); // Interpolate between the two colors
  }

  spawnParticle() {
    if(usingBlackHole) {
      let angle = random(PI, TWO_PI);
  
      let minSpawnRadius = 200;
      let maxSpawnRadius = 300;
      let distance = random(minSpawnRadius, maxSpawnRadius);
  
      // Convert polar coordinates
      let xSpawn = width / 2 + distance * cos(angle);
      let ySpawn = height / 2 + distance * sin(angle);
      this.position = createVector(xSpawn, ySpawn);
    } else {
      let angle = random(PI) * TWO_PI;
  
      let minSpawnRadius = 50;
      let maxSpawnRadius = 900;
      let distance = random(minSpawnRadius, maxSpawnRadius);

      let xSpawn = width / 2 + distance * cos(angle);
      let ySpawn = height / 2 + distance * sin(angle);
      this.position = createVector(xSpawn, ySpawn);
    }


    this.lifetime = random(50, 950);
    this.initialLifetime = this.lifetime;

    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxspeed = 4;
    this.previousPosition = this.position.copy();

    this.alpha = 0;
    this.color = color(0);
    
    this.isFadingIn = true;
    this.fadeInSpeed = 2;
  }

  follow(vectors) {
    let x = floor(this.position.x / 10);
    let y = floor(this.position.y / 10);
    let index = x + y * cols;
    if (index >= 0 && index < vectors.length) {
      let force = vectors[index];
      if (force) {
        this.applyForce(force);
        this.maxspeed = map(force.mag(), 0, 1, 2, 8);
      }
    }
  }

  applyForce(force) {
    let scaledForce = force.copy();
    scaledForce.setMag(force.mag());
    this.acceleration.add(scaledForce);
  }

  show() {
    stroke(this.color);
    strokeWeight(1);
    line(this.previousPosition.x, this.previousPosition.y, this.position.x, this.position.y);
    this.updatePrev();
  }

  updatePrev() {
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
      this.updatePrev();
    }
    if (this.position.x < 0) {
      this.position.x = width;
      this.updatePrev();
    }
    if (this.position.y > height) {
      this.position.y = 0;
      this.updatePrev();
    }
    if (this.position.y < 0) {
      this.position.y = height;
      this.updatePrev();
    }
  }
}

// Resize canvas on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class WorleyNoise {
  constructor(pointsCount, width, height) {
    this.points = [];
    this.width = width;
    this.height = height;
    
    // Randomly distribute points
    for (let i = 0; i < pointsCount; i++) {
      this.points.push({
        x: Math.random() * width,
        y: Math.random() * height
      });
    }
  }
  
  // Calculate Euclidean distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Get the noise value at a specific coordinate
  getNoise(x, y) {
    let minDist = Number.MAX_VALUE; // Start with a very high minimum distance

    // Find the closest point
    for (let i = 0; i < this.points.length; i++) {
      const dist = this.distance(x, y, this.points[i].x, this.points[i].y);
      if (dist < minDist) {
        minDist = dist;
      }
    }

    // Normalize the distance
    return minDist / Math.sqrt(this.width * this.width + this.height * this.height);
  }
}

class PerlinNoise {
  constructor() {
    this.permutation = []; // Array of 256 numbers from 0 to 255
    let permutation = [];
    for (let i = 0; i < 256; i++) {
      permutation[i] = i;
    }
    permutation = this.shuffle(permutation);
    this.p = new Array(512);
    for (let i = 0; i < 256; i++) {
      // Use the shuffled permutation to fill the p array
      this.p[256 + i] = this.p[i] = permutation[i];
    }
  }

  shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  grad(hash, x, y, z) {
    let h = hash & 15;
    let u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  scale(n) {
    return (1 + n) / 2;
  }

  noise(x, y, z) {
    let X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255,
      Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    let u = this.fade(x),
      v = this.fade(y),
      w = this.fade(z);
    let A = this.p[X] + Y,
      AA = this.p[A] + Z,
      AB = this.p[A + 1] + Z,
      B = this.p[X + 1] + Y,
      BA = this.p[B] + Z,
      BB = this.p[B + 1] + Z;

    return this.scale(
      this.lerp(
        this.lerp(
          this.lerp(
            this.grad(this.p[AA], x, y, z),
            this.grad(this.p[BA], x - 1, y, z),
            u
          ),
          this.lerp(
            this.grad(this.p[AB], x, y - 1, z),
            this.grad(this.p[BB], x - 1, y - 1, z),
            u
          ),
          v
        ),
        this.lerp(
          this.lerp(
            this.grad(this.p[AA + 1], x, y, z - 1),
            this.grad(this.p[BA + 1], x - 1, y, z - 1),
            u
          ),
          this.lerp(
            this.grad(this.p[AB + 1], x, y - 1, z - 1),
            this.grad(this.p[BB + 1], x - 1, y - 1, z - 1),
            u
          ),
          v
        ),
        w
      )
    );
  }
}

class SimplexNoise {
  constructor() {
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1],
    ];
    this.p = [];
    let permutation = [];
    for (let i = 0; i < 256; i++) {
      permutation[i] = i;
    }
    permutation = this.shuffle(permutation);
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i] = permutation[i];
    }
  }

  shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  noise(xin, yin) {
    let n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    let F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    let s = (xin + yin) * F2; // Hairy factor for 2D
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);
    let G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    let t = (i + j) * G2;
    let X0 = i - t; // Unskew the cell origin back to (x,y) space
    let Y0 = j - t;
    let x0 = xin - X0; // The x,y distances from the cell origin
    let y0 = yin - Y0;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    let x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    let y1 = y0 - j1 + G2;
    let x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    let y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    let ii = i & 255;
    let jj = j & 255;
    let gi0 = this.p[ii + this.p[jj]] % 12;
    let gi1 = this.p[ii + i1 + this.p[jj + j1]] % 12;
    let gi2 = this.p[ii + 1 + this.p[jj + 1]] % 12;
    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  }
}

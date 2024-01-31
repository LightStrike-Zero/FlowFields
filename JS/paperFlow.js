// Include this script tag in your HTML to use paper.js:
// <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.11/paper-full.min.js"></script>

// Attach Paper.js to the canvas and setup a simple scene
paper.install(window);
paper.setup(document.getElementById('myCanvas'));

window.onresize = function(event) {
    paper.view.viewSize.width = window.innerWidth;
    paper.view.viewSize.height = window.innerHeight;
};

// Define the gravity vector outside of the Particle class
var gravity = new Point(0, 0.001); // You can adjust the y value to increase or decrease gravity


// Define a Particle class
class Particle {
  constructor(position) {
    this.position = position.clone();
    this.velocity = new Point({
      length: 0.1, 
      angle: Math.random() * 360
    });
    this.path = new Path.Circle({
      center: this.position,
      radius: Math.random() * 1.5,
      fillColor: 'white'
    });
  }

  update(field) {
    // Calculate the flow force based on the field
    let angle = Math.random() * 360;
    let force = new Point({
      length: 0.1,
      angle: angle
    });

    // add gravity
    this.velocity = this.velocity.add(gravity);
    // Update velocity and position
    this.velocity = this.velocity.add(force);
    this.velocity.length = Math.min(this.velocity.length, 2);
    this.position = this.position.add(this.velocity);
    
    // Update the position of the path
    this.path.position = this.position;

    // Wrap around the edges
    if (this.position.x < 0) this.position.x = view.size.width;
    if (this.position.y < 0) this.position.y = view.size.height;
    if (this.position.x > view.size.width) this.position.x = 0;
    if (this.position.y > view.size.height) this.position.y = 0;
  }
}

// Create an array of particles
const particles = [];
for (let i = 0; i < 1000; i++) {
  let position = Point.random().multiply(view.size);
  particles.push(new Particle(position));
}

// The onFrame function is called up to 60 times a second
view.onFrame = function(event) {
    
    // Update and draw your particles here
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
};


// You will need to add a noise library since Paper.js doesn't come with one
// This could be something like simplex-noise.js or another noise library
// <script src="path_to_noise_library.js"></script>

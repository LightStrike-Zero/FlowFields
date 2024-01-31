// Get references to the canvas and editor
// Initialize Ace Editor
var editor = ace.edit("editor");
// Set the One Dark theme
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/javascript");

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');



// Function to resize the canvas and redraw its content
function resizeCanvas() {
    // Assuming the editor and canvas are split, adjust width accordingly
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight;

    drawStuff(); // Redraw the content after resizing
}

// Initial drawing on the canvas
function drawStuff() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = 'green'; // Set fill color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw a full-size green rectangle
}

// Listen for resize events to adjust the canvas
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas(); // Call on load to set the initial size

// Function to run the code from the editor when the button is clicked
function runCode() {
    var userCode = editor.getValue(); // Get the code from the editor
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before running new code

    try {
        new Function('ctx', userCode)(ctx); // Execute the user code, passing in the canvas context
    } catch (e) {
        console.error('Error executing user code:', e); // Log errors to console
    }
}

// Set up the play button to run user code
document.getElementById('runButton').addEventListener('click', runCode);

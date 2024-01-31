// Configure RequireJS with the Monaco editor path
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' }});

var editor; // Placeholder for the Monaco editor instance
canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// Load the Monaco Editor
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: 'console.log("Hello, Monaco!");',
        language: 'javascript',
        theme: 'vs-dark'
    });
});

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

function runCode() {
    var userCode = editor.getValue();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before running new code

    try {
        // Execute the user code, passing in the canvas context
        new Function('ctx', 'canvas', userCode)(ctx, canvas);
    } catch (e) {
        console.error('Error executing user code:', e);
    }
}

// Delay the run button event binding until the DOM is fully loaded
window.addEventListener('load', function() {
    document.getElementById('runButton').addEventListener('click', runCode);
});

class vectorField {

    constructor() {
        this.zOffset = 0; // Initialize zOffset as a property of the class
    }
    
    // Function to draw a flow field
    drawFlowField(ctx, width, height) {
        const resolution = 20; // Distance between each vector
        ctx.clearRect(0, 0, width, height); // Clear the canvas
        ctx.beginPath();
         for (let y = 0; y < height; y += resolution) {
            for (let x = 0; x < width; x += resolution) {
                const angle = Math.cos((x + zOffset) * 0.01) * Math.PI * 2; // Change angle based on position and zOffset
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
            }
        }
        ctx.stroke(); // Draw the lines
    }
        
     // The animation loop
    animate() {
        drawFlowField(ctx, canvas.width, canvas.height, zOffset);
         zOffset += 2; // Increment zOffset to animate the flow field
        requestAnimationFrame(animate); // Call animate again for the next frame
    }

    begin() {
        this.animate(); // Call the animate method
    }   
}

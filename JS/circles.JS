// CustomDrawingLibrary.js

var CustomDrawingLibrary = (function() {
    // Private functions
    function drawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    function drawSquare(ctx, x, y, sideLength) {
        ctx.beginPath();
        ctx.rect(x - sideLength / 2, y - sideLength / 2, sideLength, sideLength);
        ctx.fill();
        ctx.closePath();
    }

    // Public API
    return {
        drawCircle: function(ctx, x, y, radius) {
            drawCircle(ctx, x, y, radius);
        },
        drawSquare: function(ctx, x, y, sideLength) {
            drawSquare(ctx, x, y, sideLength);
        }
    };
})();

// CustomDrawingLibrary.js

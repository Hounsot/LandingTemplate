import p5 from 'p5';
document.addEventListener('DOMContentLoaded', () => {
    let sketch = (p) => {
        // Variables for images and positions
        let circle1X, circle1Y;
        let circle2X, circle2Y;
        // Variables for movement
        let circle1VelX = 0, circle1VelY = 0;
        let circle2VelX = 0, circle2VelY = 0;
        let maxSpeed = 4;  // Increased from 2
        let easing = 0.05;
        let time = 0;  // Time variable for smoother motion
        
        // Mouse interaction variables
        let prevMouseX = 0;
        let prevMouseY = 0;
        let mouseSpeed = 0;
        let mouseSpeedSmoothed = 0;
        
        // Images
        let MainCircle;
        let BlackCircle;
        let bgImage;
        let noiseOverlay;
        let textBuffer; // Buffer for the text mask
        let circleBuffer; // Buffer for the circle

        p.preload = () => {
          MainCircle = p.loadImage('/CircleADC.png');
          BlackCircle = p.loadImage('/BlackCircle.png');
          bgImage = p.loadImage('/GridBG.png');
          noiseOverlay = p.loadImage('/NoiseOverlay.png');
        };

        p.setup = () => {
            p.createCanvas(p.windowWidth, document.querySelector('.O_FirstScreen').clientHeight);
            // Create buffers with canvas size
            textBuffer = p.createGraphics(p.width, p.height);
            circleBuffer = p.createGraphics(p.width, p.height);
            
            // Initialize circle positions
            circle1X = p.width / 2;
            circle1Y = p.height;
            circle2X = p.width / 2;
            circle2Y = 0;
            
            // Initialize random velocities with more momentum
            circle1VelX = p.random(-2, 2);
            circle2VelX = p.random(-2, 2);
            
            // Initialize mouse position
            prevMouseX = p.mouseX;
            prevMouseY = p.mouseY;
        };

        p.draw = () => {
            // Calculate mouse movement speed
            const mouseDeltaX = p.mouseX - prevMouseX;
            const mouseDeltaY = p.mouseY - prevMouseY;
            mouseSpeed = Math.sqrt(mouseDeltaX * mouseDeltaX + mouseDeltaY * mouseDeltaY);
            
            // Smooth the mouse speed for more natural transitions
            mouseSpeedSmoothed = p.lerp(mouseSpeedSmoothed, mouseSpeed, 0.2);
            
            // Update previous mouse position
            prevMouseX = p.mouseX;
            prevMouseY = p.mouseY;
            
            // make background
            p.background('#08090A');
            
            // Update circle positions with smooth random movement
            updateCirclePositions();
            
            // Draw background grid image scaled to cover the canvas
            let scale;
            if (p.width / p.height > bgImage.width / bgImage.height) {
                scale = p.width / bgImage.width;
            } else {
                scale = p.height / bgImage.height;
            }
            
            const newWidth = bgImage.width * scale;
            const newHeight = bgImage.height * scale;
            
            const bgX = (p.width - newWidth) / 2;
            const bgY = (p.height - newHeight) / 2;
            // Draw background image            
            p.image(bgImage, bgX, bgY, newWidth, newHeight);
            
            // Size for circle
            const circleSize = 2000;
            const halfSize = circleSize / 2;

            // Clear both buffers
            textBuffer.clear();
            circleBuffer.clear();
            
            // Draw the text to its buffer (white text on transparent background)            
            let fontSize, textMargin, textMarginTop, text;
            
            // Multiple breakpoints for responsive design
            if (p.windowWidth <= 768) {
                // Mobile size
                fontSize = p.windowWidth / 6;
                textMargin = 24;
                textMarginTop = 24;
                text = "Art, design\n& coding\ncommunity";
            } else if (p.windowWidth <= 1024) {
                // Tablet size
                fontSize = p.windowWidth / 6.5;
                textMargin = 48 + 24;
                textMarginTop = 48;
                text = "Art, design\n& coding\ncommunity";
            } else {
                // Desktop size
                fontSize = p.windowWidth / 8;
                textMargin = 48;
                textMarginTop = 48 * 2;
                text = "Art, design &\ncoding\ncommunity";
            }
            
            textBuffer.fill('#FFFFFF');
            textBuffer.textFont("Manrope");
            textBuffer.textSize(fontSize);
            textBuffer.textLeading(fontSize * 0.87);
            textBuffer.textStyle(p.BOLD);
            textBuffer.textAlign(p.LEFT, p.TOP);
            
            // Set text position based on screen width
            textBuffer.text(text, textMargin, textMarginTop);
            
            // Draw the text to the main canvas
            p.image(textBuffer, 0, 0);
            // Draw the circle to its buffer
            p.image(MainCircle, circle1X - halfSize, circle1Y - halfSize, circleSize, circleSize);
            p.image(MainCircle, circle2X - halfSize, circle2Y - halfSize, circleSize, circleSize);
            circleBuffer.image(BlackCircle, circle1X - halfSize, circle1Y - halfSize, circleSize, circleSize);
            circleBuffer.image(BlackCircle, circle2X - halfSize, circle2Y - halfSize, circleSize, circleSize);
            // Get images from both buffers
            let maskImg = textBuffer.get();
            let circleImg = circleBuffer.get();
            
            // Apply the mask to the circle image (not the buffer)
            circleImg.mask(maskImg);
            
            // Draw the masked circle image to the main canvas
            p.image(circleImg, 0, 0);
            
            // Draw noise overlay with blend mode and opacity
            p.push();
            p.blendMode(p.OVERLAY);
            p.tint(255, 38.25);
            
            let noiseScale;
            if (p.width / p.height > noiseOverlay.width / noiseOverlay.height) {
                noiseScale = p.width / noiseOverlay.width;
            } else {
                noiseScale = p.height / noiseOverlay.height;
            }
            
            const noiseWidth = noiseOverlay.width * noiseScale;
            const noiseHeight = noiseOverlay.height * noiseScale;
            const noiseX = (p.width - noiseWidth) / 2;
            const noiseY = (p.height - noiseHeight) / 2;
            
            p.image(noiseOverlay, noiseX, noiseY, noiseWidth, noiseHeight);
            p.pop();
        };
        
        // Function to update circle positions with smooth random movement
        function updateCirclePositions() {
            const circleSize = 2000;  // Match the size used in draw
            const halfSize = circleSize / 2;
            const buffer = halfSize * 0.6;  // Keep at least 40% of the circle visible
            
            // Adjust animation speed based on mouse movement
            // Clamp mouseSpeedSmoothed between 0 and 100 for a reasonable range
            const mouseSpeedFactor = p.constrain(mouseSpeedSmoothed / 5, 0, 20);
            
            // Update time for smooth oscillation - faster when mouse moves
            const timeIncrement = 0.01 + (mouseSpeedFactor * 0.002);
            time += timeIncrement;
            
            // Adjust max speed based on mouse movement
            const currentMaxSpeed = maxSpeed + mouseSpeedFactor * 0.3;
            
            // Add some sinusoidal movement for more organic flow
            // More dramatic when mouse moves
            const waveAmplitude = 0.15 + (mouseSpeedFactor * 0.01);
            let circle1AccX = p.sin(time * 0.7) * waveAmplitude + p.random(-0.1, 0.1);
            let circle2AccX = p.cos(time * 0.8) * waveAmplitude + p.random(-0.1, 0.1);
            
            // Update velocities with acceleration and momentum
            circle1VelX = circle1VelX * 0.98 + circle1AccX;  // Add damping factor for skidding
            circle2VelX = circle2VelX * 0.98 + circle2AccX;
            
            // Limit speed but allow more momentum
            circle1VelX = p.constrain(circle1VelX, -currentMaxSpeed, currentMaxSpeed);
            circle2VelX = p.constrain(circle2VelX, -currentMaxSpeed, currentMaxSpeed);
            
            // Update positions
            circle1X += circle1VelX;
            circle2X += circle2VelX;
            
            // Elastic bounce off edges
            const elasticity = 0.75;
            
            if (circle1X < -buffer) {
                circle1VelX = Math.abs(circle1VelX) * elasticity;
                circle1X = -buffer;
            } else if (circle1X > p.width + buffer) {
                circle1VelX = -Math.abs(circle1VelX) * elasticity;
                circle1X = p.width + buffer;
            }
            
            if (circle2X < -buffer) {
                circle2VelX = Math.abs(circle2VelX) * elasticity;
                circle2X = -buffer;
            } else if (circle2X > p.width + buffer) {
                circle2VelX = -Math.abs(circle2VelX) * elasticity;
                circle2X = p.width + buffer;
            }
            
            // Occasionally change direction more dramatically to simulate drifting
            if (p.random() < 0.01) {
                circle1VelX += p.random(-1, 1);
            }
            if (p.random() < 0.01) {
                circle2VelX += p.random(-1, 1);
            }
            
            // Keep circle1 at the bottom and circle2 at the top
            // Use easing for smooth vertical movement with slight oscillation
            const verticalOscillation1 = p.sin(time * 0.5) * 20;
            const verticalOscillation2 = p.cos(time * 0.5) * 20;
            
            // Calculate cursor influence factor (normalized 0-1 value based on cursor position)
            const cursorYPosition = p.constrain(p.mouseY / p.height, 0, 1);
            
            // Apply cursor influence to circle positions
            // When cursor is at top, bottom circle moves up a bit; when at bottom, top circle moves down a bit
            const cursorInfluence1 = -cursorYPosition * 150; // Bottom circle moves up when cursor is at top
            const cursorInfluence2 = (1 - cursorYPosition) * 150; // Top circle moves down when cursor is at bottom
            
            const targetY1 = p.height + halfSize * 0.3 + verticalOscillation1 + cursorInfluence1; // Bottom position
            const targetY2 = -halfSize * 0.3 + verticalOscillation2 + cursorInfluence2; // Top position
            
            circle1Y += (targetY1 - circle1Y) * easing;
            circle2Y += (targetY2 - circle2Y) * easing;
        }
        
        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, document.querySelector('.O_FirstScreen').clientHeight);
            textBuffer.resizeCanvas(p.width, document.querySelector('.O_FirstScreen').clientHeight);
            circleBuffer.resizeCanvas(p.width, document.querySelector('.O_FirstScreen').clientHeight);
        };
    };

    new p5(sketch, document.querySelector('.O_FirstScreen'));
})
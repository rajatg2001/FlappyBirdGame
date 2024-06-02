const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables
let bX = 10;
let bY = 150;
let velocity = 0;
const gravity = 0.1;
const jumpStrength = -4;
const pipeGap = 200;
let birdImageLoaded = false;
let pipeImagesLoaded = false;
let bgImageLoaded = false;
let fgImageLoaded = false;
const bird = new Image();
bird.src = 'images/bird.png'; // Adjust the path as necessary
const pipeTop = new Image();
pipeTop.src = 'images/pipeNorth.png'; // Adjust the path as necessary
const pipeBottom = new Image();
pipeBottom.src = 'images/pipeSouth.png'; // Adjust the path as necessary
const bgImage = new Image();
bgImage.src = 'images/background.jpg'; // Adjust the path as necessary
const fgImage = new Image();
fgImage.src = 'images/foreground.png'; // Adjust the path as necessary
let pipes = []; // Array to store pipe positions
let score = 0; // Score variable
let gameRunning = true;

// Load bird image
bird.onload = function() {
    birdImageLoaded = true;
    checkAllImagesLoaded();
};

// Load pipe images
pipeTop.onload = checkAllImagesLoaded;
pipeBottom.onload = checkAllImagesLoaded;

// Load background and foreground images
bgImage.onload = function() {
    bgImageLoaded = true;
    console.log("Background image loaded successfully.");
    checkAllImagesLoaded();
};

fgImage.onload = function() {
    fgImageLoaded = true;
    console.log("Foreground image loaded successfully.");
    checkAllImagesLoaded();
};

// Check if all images are loaded
function checkAllImagesLoaded() {
    if (birdImageLoaded && pipeTop.complete && pipeBottom.complete && bgImageLoaded && fgImageLoaded) {
        pipeImagesLoaded = true;
        startGame();
    }
}

// Check for collision between two rectangles
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Main game loop
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (bgImageLoaded) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw bird
    if (birdImageLoaded) {
        ctx.drawImage(bird, bX, bY);
    }

    // Draw pipes
    if (pipeImagesLoaded) {
        for (let i = 0; i < pipes.length; i += 2) {
            ctx.drawImage(pipeTop, pipes[i].x, pipes[i].y, pipeTop.width, pipeTop.height);
            ctx.drawImage(pipeBottom, pipes[i + 1].x, pipes[i + 1].y, pipeBottom.width, pipeBottom.height);
        }
    }

    // Draw foreground
    if (fgImageLoaded) {
        ctx.drawImage(fgImage, 0, canvas.height - fgImage.height);
    }

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);

    // Check for collisions
    const birdRect = { x: bX, y: bY, width: bird.width, height: bird.height };
    for (let i = 0; i < pipes.length; i++) {
        if (i % 2 === 0) {
            const topPipeRect = { x: pipes[i].x, y: pipes[i].y, width: pipeTop.width, height: pipeTop.height };
            if (isColliding(birdRect, topPipeRect) || bY + bird.height > canvas.height) {
                // Collision detected
                collisionSound.play();
                gameOver();
                return;
            } else if (bX === pipes[i].x + pipeTop.width) {
                // Passed a pair of pipes
                score++;
            }
        } else {
            const bottomPipeRect = { x: pipes[i].x, y: pipes[i].y, width: pipeBottom.width, height: pipeBottom.height };
            if (isColliding(birdRect, bottomPipeRect) || bY + bird.height > canvas.height) {
                // Collision 
                collisionSound.play();
                gameOver();
                return;
            }
        }
    }

    updateBird();
    updatePipes();
    requestAnimationFrame(draw);
}

// Load sounds
const flapSound = new Audio('sounds/flap.mp3');
const scoreSound = new Audio('sounds/score.mp3');
const collisionSound = new Audio('sounds/collision.mp3');

// Handle key press to flap the bird
document.addEventListener('keydown', function(event) {
    if (event.key === ' ' && gameRunning) {
        velocity = jumpStrength; // Apply jump strength to bird's velocity
        flapSound.play(); // Play flap sound
    }
});

// Update pipes position and generate new pipes
function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 1; // Move pipe to the left
        if (pipes[i].x === bX) {
            score++; // Increment score when passing a pipe
            scoreSound.play(); // Play score sound
            console.log('Score sound played');
        }
    }
    // Generate new pipes if the first pipe is almost off-screen
    if (pipes.length === 0 || pipes[pipes.length - 2].x <= canvas.width - pipeTop.width * 3) {
        const minPipeHeight = 50; // Minimum height for top pipe
        const maxPipeHeight = (canvas.height - pipeGap) / 2; // Maximum height for top pipe
        const pipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight; // Random height for top pipe
        const upperPipeY = pipeHeight - pipeTop.height;
        const lowerPipeY = pipeHeight + pipeGap;
        pipes.push({ x: canvas.width, y: upperPipeY }); // Top pipe
        pipes.push({ x: canvas.width, y: lowerPipeY }); // Bottom pipe
    }
    // Remove pipes that move off screen
    pipes = pipes.filter(pipe => pipe.x + pipeTop.width > 0);
    // Play collision sound if bird collides with a pipe or the ground
    if (bY + bird.height > canvas.height || pipes.some(pipe => isColliding({ x: bX, y: bY, width: bird.width, height: bird.height }, pipe))) {
        collisionSound.play(); // Play collision sound
        console.log('Collision sound played');
        gameOver(); // End game
    }
}

// Update bird position
function updateBird() {
    velocity += gravity;
    bY += velocity;
}

// Handle key press
document.addEventListener('keydown', function(event) {
    if (event.key === ' ' && bY > 0) {
        velocity = jumpStrength;
    }
});

// Game over function
function gameOver() {
    gameRunning = false;
    alert(`Game Over. Your score: ${score}`);
    // You can add more actions here, such as resetting the game or redirecting to another page
}

// Start game loop
function startGame() {
    draw();
}

// Get canvas element and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive dimensions based on window size
let canvasWidth = window.innerWidth * 0.9;
let canvasHeight = window.innerHeight * 0.7;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let helicopter = {
    x: 50,
    y: canvasHeight / 2,
    width: canvasWidth * 0.05, // Scale size based on screen width
    height: canvasHeight * 0.05,
    dy: 0,
    gravity: 0.3,
    lift: -8
};

let obstacles = [];
let particles = [];
let frame = 0;
let isGameOver = false;
let score = 0;

// Function to lift the helicopter
function liftHelicopter() {
    helicopter.dy = helicopter.lift;
}

// Event listeners for space bar, mouse click, and touch
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        liftHelicopter();
    }
});

canvas.addEventListener('mousedown', () => {
    liftHelicopter();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling on mobile
    liftHelicopter();
});

// Create obstacles
function createObstacle() {
    let obstacleHeight = Math.random() * (canvas.height - 100) + 50;
    obstacles.push({
        x: canvas.width,
        y: 0,
        width: canvas.width * 0.05, // Scale obstacle width
        height: obstacleHeight,
        gap: canvas.height * 0.45 // Scale the gap between top and bottom obstacles
    });
}

// Create smoke particles
function createSmoke() {
    particles.push({
        x: helicopter.x,  // Emit from helicopter position
        y: helicopter.y + helicopter.height / 2,
        size: Math.random() * 5 + 5, // Random size for smoke particles
        speed: Math.random() * 1 + 1, // Random speed for smoke particles
        opacity: 1,  // Full opacity initially
        shrink: 0.05 // Shrink rate
    });
}

// Update smoke particles
function updateSmoke() {
    particles.forEach((particle, index) => {
        particle.x -= particle.speed; // Move smoke to the left
        particle.size -= particle.shrink; // Shrink the smoke
        particle.opacity -= 0.02;  // Reduce opacity to fade out

        // Remove particles that are too small or invisible
        if (particle.size <= 0 || particle.opacity <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Update the game state
function update() {
    if (!isGameOver) {
        helicopter.dy += helicopter.gravity;
        helicopter.y += helicopter.dy;

        // Emit smoke particles
        createSmoke();

        // Update smoke particles
        updateSmoke();

        // Prevent helicopter from flying off the screen
        if (helicopter.y < 0) {
            helicopter.y = 0;
        } else if (helicopter.y + helicopter.height > canvas.height) {
            isGameOver = true;
        }

        // Create obstacles at intervals
        if (frame % 90 === 0) {
            createObstacle();
        }

        // Move obstacles and check for collisions
        obstacles.forEach((obs, index) => {
            obs.x -= 3 * (canvasWidth / 800);  // Adjust speed based on screen size

            // Check for collision with helicopter
            if (
                helicopter.x < obs.x + obs.width &&
                helicopter.x + helicopter.width > obs.x &&
                (helicopter.y < obs.height || helicopter.y + helicopter.height > obs.height + obs.gap)
            ) {
                isGameOver = true;
            }

            // Remove obstacles off-screen
            if (obs.x + obs.width < 0) {
                obstacles.splice(index, 1);
                score++;
            }
        });
    }

    frame++;
}

// Draw the smoke particles
function drawSmoke() {
    particles.forEach((particle) => {
        ctx.fillStyle = `rgba(128, 128, 128, ${particle.opacity})`;  // Gray color with varying opacity
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw the game elements
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw helicopter
    ctx.fillStyle = '#f00';
    ctx.fillRect(helicopter.x, helicopter.y, helicopter.width, helicopter.height);

    // Draw smoke
    drawSmoke();

    // Draw obstacles
    obstacles.forEach((obs) => {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillRect(obs.x, obs.height + obs.gap, obs.width, canvas.height - (obs.height + obs.gap));
    });

    // Display score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Game over message
    if (isGameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Adjust canvas size and helicopter position when window is resized
window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth * 0.9;
    canvasHeight = window.innerHeight * 0.7;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    helicopter.y = canvasHeight / 2;
    helicopter.width = canvasWidth * 0.05;
    helicopter.height = canvasHeight * 0.05;
});

// Main game loop
function gameLoop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();

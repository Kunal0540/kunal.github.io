console.log("Game script loaded!"); 
// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let gameStarted = false;
let animationId;

// Player
const player = {
    x: 100,
    y: canvas.height - 100,
    width: 50,
    height: 80,
    color: '#FF5252',
    velocityY: 0,
    gravity: 0.8,
    jumpForce: -15,
    isJumping: false,
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 10, this.y + 15, 10, 10);
        ctx.fillRect(this.x + 30, this.y + 15, 10, 10);
        
        // Draw hat (like Mario's)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - 5, this.y - 20, this.width + 10, 20);
    },
    
    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }
};

// Obstacles
const obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 1500; // milliseconds

function createObstacle() {
    const height = Math.random() * 50 + 30;
    const width = Math.random() * 30 + 20;
    const gap = Math.random() * 100 + 100; // Space between obstacles
    
    obstacles.push({
        x: canvas.width,
        y: canvas.height - height,
        width: width,
        height: height,
        color: '#4CAF50',
        passed: false
    });
    
    // Add a second obstacle with a gap
    obstacles.push({
        x: canvas.width + width + gap,
        y: canvas.height - (Math.random() * 50 + 30),
        width: width,
        height: Math.random() * 50 + 30,
        color: '#4CAF50',
        passed: false
    });
}

// Clouds (background decoration)
const clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 100 + 50,
        width: Math.random() * 100 + 50,
        speed: Math.random() * 2 + 1
    });
}

// Game functions
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width/3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width/3, cloud.y - 10, cloud.width/4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width/2, cloud.y, cloud.width/3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * 100 + 50;
        }
    });
}

function checkCollision() {
    for (const obstacle of obstacles) {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver();
            return;
        }
        
        // Score point when passing obstacle
        if (!obstacle.passed && player.x > obstacle.x + obstacle.width) {
            obstacle.passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
            
            // Increase difficulty
            if (score % 5 === 0) {
                gameSpeed += 0.5;
            }
        }
    }
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    
    // Show game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
    ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2 + 50);
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    isGameOver = false;
    obstacles.length = 0;
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    scoreElement.textContent = `Score: ${score}`;
    startGame();
}

function startGame() {
    gameStarted = true;
    startScreen.style.display = 'none';
    gameLoop();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawClouds();
    updateClouds();
    
    // Draw ground
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Update and draw player
    player.update();
    player.draw();
    
    // Create obstacles
    obstacleTimer += 1000/60; // Assuming 60fps
    if (obstacleTimer >= obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
    }
    
    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed;
        
        // Remove obstacles that are off screen
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            continue;
        }
        
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    // Check for collisions
    checkCollision();
    
    // Continue game loop if not over
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !isGameOver) {
        player.jump();
    }
    
    if (e.key.toLowerCase() === 'r' && isGameOver) {
        resetGame();
    }
});

startButton.addEventListener('click', startGame);

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height - player.height;
});

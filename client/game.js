// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-canvas',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game variables
let player1;
let player2;
let ball;
let leftGoal;
let rightGoal;
let cursors;
let wasd;
let fpsText;
let scoreText;
let timerText;
let gameOverText;
let socket;
let socketText;
let connectionStatusText;

// Game state variables
let leftScore = 0;
let rightScore = 0;
let gameOver = false;
let gameScene;
let matchTime = 60; // 60 seconds
let timerEvent;

// Initialize the game
const game = new Phaser.Game(config);

function preload() {
    // Create colored rectangles for players and ground
    // Player 1 - Green
    this.add.graphics()
        .fillStyle(0x00ff00)
        .fillRect(0, 0, 50, 50)
        .generateTexture('player1', 50, 50);
    
    // Player 2 - Blue
    this.add.graphics()
        .fillStyle(0x0080ff)
        .fillRect(0, 0, 50, 50)
        .generateTexture('player2', 50, 50);
    
    this.add.graphics()
        .fillStyle(0x8b4513)
        .fillRect(0, 0, 800, 50)
        .generateTexture('ground', 800, 50);
    
    // Create a soccer ball sprite (black and white pattern)
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xffffff);
    ballGraphics.fillCircle(25, 25, 25);
    ballGraphics.fillStyle(0x000000);
    // Add pentagon pattern for soccer ball look
    ballGraphics.fillCircle(25, 15, 8);
    ballGraphics.fillCircle(15, 30, 6);
    ballGraphics.fillCircle(35, 30, 6);
    ballGraphics.fillCircle(25, 40, 4);
    ballGraphics.generateTexture('ball', 50, 50);
    ballGraphics.destroy();
    
    // Create goal post placeholder graphics (will be invisible but can be replaced with sprites)
    this.add.graphics()
        .fillStyle(0xff0000)
        .fillRect(0, 0, 20, 200)
        .generateTexture('goalPost', 20, 200);
}

function create() {
    // Store scene reference for later use
    gameScene = this;
    
    // Create ground
    const ground = this.add.rectangle(400, 575, 800, 50, 0x8b4513);
    this.physics.add.existing(ground, true); // true = static body
    
    // Create player 1 (Green - Left side)
    player1 = this.physics.add.sprite(200, 450, 'player1');
    player1.setBounce(0.2);
    player1.setCollideWorldBounds(true);
    player1.setMass(1); // Standard mass for balanced physics
    player1.setDrag(100); // Ground friction when not moving
    player1.setMaxVelocity(300, 800); // Prevent unrealistic speeds
    
    // Create player 2 (Blue - Right side)
    player2 = this.physics.add.sprite(600, 450, 'player2');
    player2.setBounce(0.2);
    player2.setCollideWorldBounds(true);
    player2.setMass(1); // Standard mass for balanced physics
    player2.setDrag(100); // Ground friction when not moving
    player2.setMaxVelocity(300, 800); // Prevent unrealistic speeds
    
    // Create soccer ball
    ball = this.physics.add.sprite(400, 300, 'ball');
    ball.setBounce(0.6); // Reduced bounce to prevent excessive bouncing
    ball.setCollideWorldBounds(true);
    ball.setDrag(100); // Increased air resistance for better control
    ball.setMass(0.5); // Lighter than players for realistic physics
    ball.setMaxVelocity(350, 500); // Reduced max velocity for better control
    
    // Create goal zones (invisible rectangles)
    leftGoal = this.add.rectangle(10, 400, 20, 200, 0xff0000, 0); // Invisible (alpha = 0)
    rightGoal = this.add.rectangle(790, 400, 20, 200, 0xff0000, 0); // Invisible (alpha = 0)
    this.physics.add.existing(leftGoal, true); // Static bodies
    this.physics.add.existing(rightGoal, true);
    
    // Add visual goal post indicators (can be replaced with sprites later)
    this.add.rectangle(10, 300, 15, 5, 0xffffff); // Left goal top
    this.add.rectangle(10, 500, 15, 5, 0xffffff); // Left goal bottom
    this.add.rectangle(10, 400, 5, 200, 0xffffff); // Left goal post
    
    this.add.rectangle(790, 300, 15, 5, 0xffffff); // Right goal top
    this.add.rectangle(790, 500, 15, 5, 0xffffff); // Right goal bottom
    this.add.rectangle(790, 400, 5, 200, 0xffffff); // Right goal post
    
    // Physics collisions
    this.physics.add.collider(player1, ground);
    this.physics.add.collider(player2, ground);
    this.physics.add.collider(ball, ground);
    this.physics.add.collider(player1, ball, handlePlayerBallCollision);
    this.physics.add.collider(player2, ball, handlePlayerBallCollision);
    
    // Player-to-player collision for more strategic gameplay
    this.physics.add.collider(player1, player2, handlePlayerPlayerCollision);
    
    // Goal detection (overlap, not collision)
    this.physics.add.overlap(ball, leftGoal, () => handleGoalScored('right'));
    this.physics.add.overlap(ball, rightGoal, () => handleGoalScored('left'));
    
    // Create cursor keys
    cursors = this.input.keyboard.createCursorKeys();
    
    // Create WASD keys
    wasd = this.input.keyboard.addKeys('W,S,A,D');
    
    // Create timer display at top left
    timerText = this.add.text(400, 60, formatTime(matchTime), {
        fontSize: '28px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    });
    timerText.setOrigin(0.5, 0.5); // Center the text
    
    // Create score display at top center
    scoreText = this.add.text(400, 30, 'Left: 0 | Right: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
    });
    scoreText.setOrigin(0.5, 0.5); // Center the text
    
    // Start the match timer
    startMatchTimer();
    
    // Create FPS text
    fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Game info text
    this.add.text(16, 100, 'Player 1: Green Square (WASD)', {
        fontSize: '16px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 130, 'Player 2: Blue Square (Arrow Keys)', {
        fontSize: '16px',
        fill: '#0080ff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 160, 'Ball: Move to kick, stand still to defend!', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 190, 'Goal: 3 goals or most goals when time runs out!', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Connection status text
    connectionStatusText = this.add.text(16, 220, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Socket ID display text
    socketText = this.add.text(16, 250, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Initialize Socket.io connection
    initializeSocket();
}

function startMatchTimer() {
    // Create a timer event that fires every second
    timerEvent = gameScene.time.addEvent({
        delay: 1000, // 1 second
        callback: updateTimer,
        loop: true
    });
}

function updateTimer() {
    // Don't update timer if game is over
    if (gameOver) return;
    
    matchTime--;
    timerText.setText(formatTime(matchTime));
    
    // Change color when time is running low
    if (matchTime <= 10) {
        timerText.setStyle({ fill: '#ff0000' }); // Red when 10 seconds or less
    } else if (matchTime <= 30) {
        timerText.setStyle({ fill: '#ffa500' }); // Orange when 30 seconds or less
    }
    
    // Check if time is up
    if (matchTime <= 0) {
        handleTimeUp();
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function handleTimeUp() {
    // Stop the timer
    if (timerEvent) {
        timerEvent.remove();
    }
    
    // Determine winner based on score
    let winner;
    let winMessage;
    
    if (leftScore > rightScore) {
        winner = 'left';
        winMessage = 'Time\'s Up! Left Player Wins!';
    } else if (rightScore > leftScore) {
        winner = 'right';
        winMessage = 'Time\'s Up! Right Player Wins!';
    } else {
        winner = 'tie';
        winMessage = 'Time\'s Up! It\'s a Tie!';
    }
    
    handleGameOver(winner, winMessage);
}

function handlePlayerBallCollision(player, ball) {
    // Don't allow collision if game is over
    if (gameOver) return;
    
    // Calculate collision vectors
    const ballVelocityX = ball.body.velocity.x;
    const ballVelocityY = ball.body.velocity.y;
    const playerVelocityX = player.body.velocity.x;
    const playerVelocityY = player.body.velocity.y;
    
    // Calculate collision angle based on positions
    const deltaX = ball.x - player.x;
    const deltaY = ball.y - player.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Prevent division by zero
    if (distance < 1) return;
    
    // Normalize collision direction
    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    
    // Separate objects to prevent sticking (especially on top of head)
    const separationDistance = 35; // Slightly larger than sprite size
    const separationForce = Math.max(0, separationDistance - distance);
    if (separationForce > 0) {
        ball.x += normalX * separationForce;
        ball.y += normalY * separationForce;
    }
    
    // Determine which player is hitting the ball and correct direction
    const isPlayer1 = player === player1; // Player 1 is on the left
    const isPlayer2 = player === player2; // Player 2 is on the right
    
    // Calculate correct forward direction for each player
    const correctDirection = isPlayer1 ? 1 : -1; // Player 1 pushes right, Player 2 pushes left
    
    // Determine if player is actively moving (kicking) or stationary (bouncing)
    const playerIsMoving = Math.abs(playerVelocityX) > 50 || Math.abs(playerVelocityY) > 50;
    const playerIsGrounded = player.body.touching.down;
    
    // Check if ball is on top of player (head collision)
    const isHeadCollision = deltaY < -15 && Math.abs(deltaX) < 30;
    
    if (playerIsMoving && playerIsGrounded && !isHeadCollision) {
        // ACTIVE KICK: Player is moving and on ground - apply kick force
        const kickPower = 280;
        
        // Use player movement direction, but ensure it's generally forward
        let kickDirection = playerVelocityX > 0 ? 1 : playerVelocityX < 0 ? -1 : correctDirection;
        
        // Prevent backwards kicks: if movement would send ball backwards, use correct direction
        if ((isPlayer1 && kickDirection < 0) || (isPlayer2 && kickDirection > 0)) {
            kickDirection = correctDirection;
        }
        
        // Apply kick force in direction of player movement
        ball.setVelocityX(kickDirection * kickPower);
        
        // Add upward force for kick
        ball.setVelocityY(-200);
        
        // Small player reaction (brief slowdown)
        player.setVelocityX(playerVelocityX * 0.7);
        
    } else {
        // DEFENSIVE BOUNCE: Player is stationary, airborne, or ball is on head
        // Calculate realistic bounce based on ball's incoming velocity
        
        // Stronger bounce physics for clean direction changes
        const bounceStrength = 1.1; // Slightly amplify bounce for clean redirects
        const minBounceSpeed = 180; // Higher minimum speed for strong bounces
        
        // Calculate new ball velocity based on collision normal
        const incomingSpeed = Math.sqrt(ballVelocityX * ballVelocityX + ballVelocityY * ballVelocityY);
        const bounceSpeed = Math.max(incomingSpeed * bounceStrength, minBounceSpeed);
        
        // Special handling for head collisions
        if (isHeadCollision) {
            // Always bounce upward and away from player when hitting head
            // Force correct horizontal direction to prevent own-goals
            ball.setVelocityX(correctDirection * bounceSpeed * 0.8);
            ball.setVelocityY(-Math.abs(bounceSpeed * 0.6)); // Always upward
        } else {
            // Normal bounce - but ensure horizontal direction is correct
            let bounceX = normalX * bounceSpeed;
            let bounceY = normalY * bounceSpeed;
            
            // Prevent backwards deflection: if bounce would go backwards, bias it forward
            if ((isPlayer1 && bounceX < 0) || (isPlayer2 && bounceX > 0)) {
                // Mix the natural bounce with the correct direction
                bounceX = (bounceX * 0.3) + (correctDirection * bounceSpeed * 0.7);
            }
            
            ball.setVelocityX(bounceX);
            ball.setVelocityY(bounceY);
            
            // Ensure upward component if ball is coming from above
            if (deltaY > 0) {
                ball.setVelocityY(Math.max(ball.body.velocity.y, -120));
            }
        }
        
        // Subtle player reaction - slight push back (but not knockback)
        if (incomingSpeed > 100) {
            player.setVelocityX(playerVelocityX + (-normalX * 20));
        }
    }
    
    // Remove screen shake - it was causing the jank/jumping
    // Screen shake removed for cleaner gameplay
}

function handlePlayerPlayerCollision(player1, player2) {
    // Don't process player collisions if game is over
    if (gameOver) return;
    
    // Calculate collision direction
    const deltaX = player2.x - player1.x;
    const deltaY = player2.y - player1.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize collision direction
    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    
    // Get current velocities
    const p1VelX = player1.body.velocity.x;
    const p1VelY = player1.body.velocity.y;
    const p2VelX = player2.body.velocity.x;
    const p2VelY = player2.body.velocity.y;
    
    // Calculate relative velocity
    const relativeVelX = p1VelX - p2VelX;
    const relativeVelY = p1VelY - p2VelY;
    
    // Calculate collision response (elastic collision)
    const collisionStrength = 0.3; // How much players bounce off each other
    const pushForce = (relativeVelX * normalX + relativeVelY * normalY) * collisionStrength;
    
    // Apply collision response
    player1.setVelocityX(p1VelX - pushForce * normalX);
    player1.setVelocityY(p1VelY - pushForce * normalY);
    
    player2.setVelocityX(p2VelX + pushForce * normalX);
    player2.setVelocityY(p2VelY + pushForce * normalY);
    
    // Separate players to prevent overlap
    const separationForce = 2;
    player1.x -= normalX * separationForce;
    player1.y -= normalY * separationForce;
    player2.x += normalX * separationForce;
    player2.y += normalY * separationForce;
}

function handleGoalScored(scoringPlayer) {
    // Don't process goals if game is already over
    if (gameOver) return;
    
    // Increment score
    if (scoringPlayer === 'left') {
        leftScore++;
    } else {
        rightScore++;
    }
    
    // Update score display
    scoreText.setText(`Left: ${leftScore} | Right: ${rightScore}`);
    
    // Reset ball to center
    ball.setPosition(400, 300);
    ball.setVelocity(0, 0);
    
    // Check win condition (3 goals wins immediately)
    if (leftScore >= 3 || rightScore >= 3) {
        const winMessage = scoringPlayer === 'left' ? 'Left Player Wins!' : 'Right Player Wins!';
        handleGameOver(scoringPlayer, winMessage);
    }
    
    console.log(`Goal scored by ${scoringPlayer}! Score: Left ${leftScore} - Right ${rightScore}`);
}

function handleGameOver(winner, customMessage = null) {
    gameOver = true;
    
    // Stop the timer
    if (timerEvent) {
        timerEvent.remove();
    }
    
    // Stop ball movement
    ball.setVelocity(0, 0);
    ball.body.setGravityY(0);
    
    // Create game over text
    let winnerText;
    if (customMessage) {
        winnerText = customMessage;
    } else {
        winnerText = winner === 'left' ? 'Left Player Wins!' : 
                    winner === 'right' ? 'Right Player Wins!' : 
                    'It\'s a Tie!';
    }
    
    gameOverText = gameScene.add.text(400, 200, winnerText, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5, 0.5);
    
    // Add restart instruction
    gameScene.add.text(400, 260, 'Press R to restart', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
    }).setOrigin(0.5, 0.5);
    
    // Add restart key
    gameScene.input.keyboard.on('keydown-R', restartGame);
    
    console.log(`Game Over! Winner: ${winner}`);
}

function restartGame() {
    // Reset game state
    gameOver = false;
    leftScore = 0;
    rightScore = 0;
    matchTime = 60;
    
    // Reset ball
    ball.setPosition(400, 300);
    ball.setVelocity(0, 0);
    ball.body.setGravityY(300);
    
    // Reset players
    player1.setPosition(200, 450);
    player1.setVelocity(0, 0);
    
    player2.setPosition(600, 450);
    player2.setVelocity(0, 0);
    
    // Update displays
    scoreText.setText(`Left: ${leftScore} | Right: ${rightScore}`);
    timerText.setText(formatTime(matchTime));
    timerText.setStyle({ fill: '#ffff00' }); // Reset timer color
    
    // Remove game over text
    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }
    
    // Remove restart instruction
    const restartText = gameScene.children.getByName('restartText');
    if (restartText) {
        restartText.destroy();
    }
    
    // Restart the timer
    startMatchTimer();
    
    console.log('Game restarted!');
}

function update() {
    // Update FPS counter
    fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
    
    // Don't process player movement if game is over
    if (gameOver) return;
    
    // Player movement
    const speed = 160;
    const jumpSpeed = 330;
    
    // Player 1 movement (WASD)
    if (wasd.A.isDown) {
        player1.setVelocityX(-speed);
    } else if (wasd.D.isDown) {
        player1.setVelocityX(speed);
    } else {
        player1.setVelocityX(0);
    }
    
    // Player 1 jumping
    if (wasd.W.isDown && player1.body.touching.down) {
        player1.setVelocityY(-jumpSpeed);
    }
    
    // Player 2 movement (Arrow keys)
    if (cursors.left.isDown) {
        player2.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player2.setVelocityX(speed);
    } else {
        player2.setVelocityX(0);
    }
    
    // Player 2 jumping
    if (cursors.up.isDown && player2.body.touching.down) {
        player2.setVelocityY(-jumpSpeed);
    }
}

// Socket.io connection setup
function initializeSocket() {
    // Connect to the server
    socket = io('http://localhost:3000');
    
    // Connection successful
    socket.on('connect', () => {
        console.log('Socket connected');
        console.log('Socket ID:', socket.id);
        
        // Update UI to show connection status
        connectionStatusText.setText('Socket: Connected ✅');
        connectionStatusText.setStyle({ fill: '#00ff00' });
        
        // Display socket ID
        socketText.setText(`Socket ID: ${socket.id}`);
        
        // Send "hello from client" message
        socket.emit('hello from client', {
            message: 'Hello from Phaser client!',
            timestamp: new Date().toISOString()
        });
        
        console.log('Sent "hello from client" message to server');
    });
    
    // Listen for "hello from server" response
    socket.on('hello from server', (data) => {
        console.log('Received "hello from server":', data);
        
        // Update UI to show server response
        connectionStatusText.setText('Socket: Server responded ✅');
        connectionStatusText.setStyle({ fill: '#00ff00' });
    });
    
    // Handle welcome message from server
    socket.on('welcome', (data) => {
        console.log('Welcome message from server:', data);
    });
    
    // Handle other players joining
    socket.on('playerJoined', (data) => {
        console.log('Player joined:', data);
    });
    
    // Handle other players leaving
    socket.on('playerLeft', (data) => {
        console.log('Player left:', data);
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        connectionStatusText.setText('Socket: Connection Error ❌');
        connectionStatusText.setStyle({ fill: '#ff0000' });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        connectionStatusText.setText('Socket: Disconnected ❌');
        connectionStatusText.setStyle({ fill: '#ff0000' });
        socketText.setText('Socket ID: Disconnected');
    });
    
    // Handle server shutdown
    socket.on('serverShutdown', (data) => {
        console.log('Server is shutting down:', data);
        connectionStatusText.setText('Socket: Server Shutdown ⚠️');
        connectionStatusText.setStyle({ fill: '#ffa500' });
    });
} 
// Character definitions
const CHARACTERS = {
    blaze: {
        name: 'Blaze',
        power: 'Fire Kick',
        description: 'Fire balls pass through enemies unless they use their power to deflect',
        color: 0xff4500,
        sprite: { category: 'tinyHeroes', id: 'dudeMonster' }
    },
    frostbite: {
        name: 'Frostbite',
        power: 'Ice Freeze',
        description: 'Freezes opponents and slows down the ball',
        color: 0x00bfff,
        sprite: { category: 'tinyHeroes', id: 'pinkMonster' }
    },
    volt: {
        name: 'Volt',
        power: 'Lightning Dash',
        description: 'Super-fast movement with electric strikes',
        color: 0xffff00,
        sprite: { category: 'tinyHeroes', id: 'owletMonster' }
    },
    jellyhead: {
        name: 'Jellyhead',
        power: 'Bounce Shield',
        description: 'Creates bouncy barriers for defense',
        color: 0x9370db,
        sprite: { category: 'miniPixelPack', id: 'drscience' }
    },
    brick: {
        name: 'Brick',
        power: 'Immunity',
        description: 'Immune to all attacks for 5 seconds',
        color: 0x8b4513,
        sprite: { category: 'miniPixelPack', id: 'capp' }
    },
    whirlwind: {
        name: 'Whirlwind',
        power: 'Air Spin',
        description: 'Controls air currents to redirect the ball',
        color: 0x87ceeb,
        sprite: { category: 'miniPixelPack', id: 'tanker' }
    }
};

// Global character selection state
let selectedCharacters = {
    player1: null,
    player2: null
};

// Character Selection Scene
class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectionScene' });
        this.characterKeys = Object.keys(CHARACTERS);
        this.player1Selection = 0;
        this.player2Selection = 0;
        this.player1Confirmed = false;
        this.player2Confirmed = false;
        this.player1UI = null;
        this.player2UI = null;
        this.charactersDisplay = [];
    }

    preload() {
        // Load all character sprites for previews
        this.characterKeys.forEach(key => {
            const character = CHARACTERS[key];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig) {
                if (spriteConfig.type === 'sprite_sheet') {
                    // Load idle animation for Tiny Heroes
                    this.load.spritesheet(`${key}_preview`, 
                        spriteConfig.basePath + spriteConfig.animations.idle.file, 
                        { frameWidth: 32, frameHeight: 32 }
                    );
                } else {
                    // Load single frame for Mini Pixel Pack characters
                    const idleAnim = spriteConfig.animations.idle;
                    const framePath = spriteConfig.basePath + idleAnim.file;
                    this.load.image(`${key}_preview`, framePath);
                }
            }
        });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 50, '⚡ CHARACTER SELECTION ⚡', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 100, 'Choose your character!', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Player 1 controls
        this.add.text(150, 140, 'Player 1 (Green)', {
            fontSize: '18px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        this.add.text(150, 170, 'A/D to navigate • W or Enter to select', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Player 2 controls
        this.add.text(650, 140, 'Player 2 (Blue)', {
            fontSize: '18px',
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        this.add.text(650, 170, '← → to navigate • ↑ or Enter to select', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Create character display
        this.createCharacterDisplay();

        // Create player UI panels
        this.createPlayerUI();

        // Setup keyboard controls
        this.setupControls();

        // Update display
        this.updateDisplay();
    }

    createCharacterDisplay() {
        const startX = 50;
        const startY = 200;
        const spacing = 120;
        const previewY = startY - 10; // Lift sprites up slightly

        this.characterKeys.forEach((key, index) => {
            const character = CHARACTERS[key];
            const x = startX + (index * spacing);
            const y = startY;

            // Handle both sprite sheets and single frames
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            let sprite;
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                // For sprite sheets (Tiny Heroes), use static frame to prevent flickering
                sprite = this.add.image(x, previewY, `${key}_preview`);
                sprite.setScale(2.0)
                      .setOrigin(0.5)
                      .setFrame(0); // Use first frame to prevent animation flicker
            } else {
                // For single frames (Mini Pixel Pack), create static image with larger scale
                sprite = this.add.image(x, previewY + 5, `${key}_preview`); // Slightly lower for baseline alignment
                sprite.setScale(3.0)  // Increased scale for Mini Pixel Pack characters
                      .setOrigin(0.5);
            }

            // Character name
            const name = this.add.text(x, y + 70, character.name, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            // Power name
            const power = this.add.text(x, y + 95, character.power, {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);

            // Description
            const description = this.add.text(x, y + 120, character.description, {
                fontSize: '10px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 },
                wordWrap: { width: 100, useAdvancedWrap: true }
            }).setOrigin(0.5);

            this.charactersDisplay.push({
                sprite,
                name,
                power,
                description,
                index
            });
        });
    }

    createPlayerUI() {
        // Player 1 UI (Left side)
        this.player1UI = {
            panel: this.add.rectangle(150, 420, 250, 150, 0x003300, 0.8),
            title: this.add.text(150, 370, 'Player 1 Selection', {
                fontSize: '18px',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5),
            character: this.add.text(150, 400, '', {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5),
            power: this.add.text(150, 430, '', {
                fontSize: '14px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5),
            status: this.add.text(150, 460, 'Press W or Enter to confirm', {
                fontSize: '12px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5)
        };

        // Player 2 UI (Right side)
        this.player2UI = {
            panel: this.add.rectangle(650, 420, 250, 150, 0x000033, 0.8),
            title: this.add.text(650, 370, 'Player 2 Selection', {
                fontSize: '18px',
                fill: '#0080ff',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5),
            character: this.add.text(650, 400, '', {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5),
            power: this.add.text(650, 430, '', {
                fontSize: '14px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5),
            status: this.add.text(650, 460, 'Press ↑ or Enter to confirm', {
                fontSize: '12px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5)
        };
    }

    setupControls() {
        // Player 1 controls (WASD)
        this.input.keyboard.on('keydown-A', () => {
            if (!this.player1Confirmed) {
                this.player1Selection = (this.player1Selection - 1 + this.characterKeys.length) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-D', () => {
            if (!this.player1Confirmed) {
                this.player1Selection = (this.player1Selection + 1) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-W', () => {
            if (!this.player1Confirmed) {
                this.confirmPlayer1Selection();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.player1Confirmed) {
                this.confirmPlayer1Selection();
            } else if (!this.player2Confirmed) {
                this.confirmPlayer2Selection();
            }
        });

        // Player 2 controls (Arrow keys)
        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.player2Confirmed) {
                this.player2Selection = (this.player2Selection - 1 + this.characterKeys.length) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.player2Confirmed) {
                this.player2Selection = (this.player2Selection + 1) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-UP', () => {
            if (!this.player2Confirmed) {
                this.confirmPlayer2Selection();
            }
        });
    }

    updateDisplay() {
        // Reset all character displays with consistent scaling
        this.charactersDisplay.forEach((display, index) => {
            display.sprite.setTint(0xffffff);
            
            // Set scale based on character type
            const character = CHARACTERS[this.characterKeys[index]];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(2.0); // Tiny Heroes normal scale
            } else {
                display.sprite.setScale(3.0); // Mini Pixel Pack normal scale
            }
        });

        // Highlight current selections with increased scale
        if (!this.player1Confirmed) {
            const p1Display = this.charactersDisplay[this.player1Selection];
            const p1Character = CHARACTERS[this.characterKeys[this.player1Selection]];
            const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
            
            p1Display.sprite.setTint(0x00ff00);
            if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
                p1Display.sprite.setScale(2.4); // Tiny Heroes selected scale
            } else {
                p1Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
            }
        }

        if (!this.player2Confirmed) {
            const p2Display = this.charactersDisplay[this.player2Selection];
            const p2Character = CHARACTERS[this.characterKeys[this.player2Selection]];
            const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
            
            p2Display.sprite.setTint(0x0080ff);
            if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
                p2Display.sprite.setScale(2.4); // Tiny Heroes selected scale
            } else {
                p2Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
            }
        }

        // Update Player 1 UI
        const p1Character = CHARACTERS[this.characterKeys[this.player1Selection]];
        this.player1UI.character.setText(p1Character.name);
        this.player1UI.power.setText(p1Character.power);
        if (this.player1Confirmed) {
            this.player1UI.status.setText('✓ CONFIRMED');
            this.player1UI.status.setStyle({ fill: '#00ff00' });
        } else {
            this.player1UI.status.setText('Press W or Enter to confirm');
            this.player1UI.status.setStyle({ fill: '#cccccc' });
        }

        // Update Player 2 UI
        const p2Character = CHARACTERS[this.characterKeys[this.player2Selection]];
        this.player2UI.character.setText(p2Character.name);
        this.player2UI.power.setText(p2Character.power);
        if (this.player2Confirmed) {
            this.player2UI.status.setText('✓ CONFIRMED');
            this.player2UI.status.setStyle({ fill: '#0080ff' });
        } else {
            this.player2UI.status.setText('Press ↑ or Enter to confirm');
            this.player2UI.status.setStyle({ fill: '#cccccc' });
        }
    }

    confirmPlayer1Selection() {
        this.player1Confirmed = true;
        selectedCharacters.player1 = this.characterKeys[this.player1Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    confirmPlayer2Selection() {
        this.player2Confirmed = true;
        selectedCharacters.player2 = this.characterKeys[this.player2Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    checkBothPlayersReady() {
        if (this.player1Confirmed && this.player2Confirmed) {
            // Show "Starting match..." message
            this.add.text(400, 550, 'Starting match...', {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 16, y: 8 }
            }).setOrigin(0.5);

            // Wait a moment then start the game
            this.time.delayedCall(1500, () => {
                this.scene.start('GameScene');
            });
        }
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Load Player 1 character sprites
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        if (p1SpriteConfig) {
            if (p1SpriteConfig.type === 'sprite_sheet') {
                // Tiny Heroes - Load sprite sheets
                this.load.spritesheet('player1_idle', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player1_walk', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                // Mini Pixel Pack - Load single frame images
                const idleAnim = p1SpriteConfig.animations.idle;
                const walkAnim = p1SpriteConfig.animations.walk;
                
                // Load idle frame
                this.load.image('player1_idle', p1SpriteConfig.basePath + idleAnim.file);
                
                // Load walk frame
                this.load.image('player1_walk', p1SpriteConfig.basePath + walkAnim.file);
            }
        }

        // Load Player 2 character sprites
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        if (p2SpriteConfig) {
            if (p2SpriteConfig.type === 'sprite_sheet') {
                // Tiny Heroes - Load sprite sheets
                this.load.spritesheet('player2_idle', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player2_walk', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                // Mini Pixel Pack - Load single frame images
                const idleAnim = p2SpriteConfig.animations.idle;
                const walkAnim = p2SpriteConfig.animations.walk;
                
                // Load idle frame
                this.load.image('player2_idle', p2SpriteConfig.basePath + idleAnim.file);
                
                // Load walk frame
                this.load.image('player2_walk', p2SpriteConfig.basePath + walkAnim.file);
            }
        }
    
    this.add.graphics()
        .fillStyle(0x8b4513)
        .fillRect(0, 0, 800, 50)
        .generateTexture('ground', 800, 50);
    
        // Load pixel art soccer ball sprite
        this.load.image('ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Load goal sprite
        this.load.image('goalPost', 'assets/Sprites/goals/Head Ball/Assets/Sprites/porta.png');
}

    create() {
    // Store scene reference for later use
        this.gameScene = this;
        
        // Initialize game state
        this.gameOver = false;
        this.leftScore = 0;
        this.rightScore = 0;
        this.matchTime = 60;
        this.gameStartTime = Date.now();
        
        // Initialize clean power system
        this.powers = {
            player1: {
                ready: false,
                lastUsed: 0,
                cooldown: 15000, // 15 seconds
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                shieldActive: false
            },
            player2: {
                ready: false,
                lastUsed: 0,
                cooldown: 15000, // 15 seconds
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                shieldActive: false
            }
        };
        
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
    
    // Create ground
    const ground = this.add.rectangle(400, 575, 800, 50, 0x8b4513);
        this.physics.add.existing(ground, true);
        
        // Create Player 1 with selected character sprite
        this.player1 = this.physics.add.sprite(200, 450, 'player1_idle');
        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player1.setMass(1);
        this.player1.setDrag(100);
        this.player1.setMaxVelocity(300, 800);
        
        // Set scale based on character type
        if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
            this.player1.setScale(2.0);  // Tiny Heroes
            this.player1.setOrigin(0.5, 1);
            // Tighten collision body for Tiny Heroes (32x32 base -> 64x64 visual)
            this.player1.body.setSize(24, 30); // Narrower width, slightly shorter height
            this.player1.body.setOffset(4, 2); // Center the collision body
        } else {
            this.player1.setScale(3.0);  // Mini Pixel Pack - larger scale to match Tiny Heroes
            this.player1.setOrigin(0.5, 1);
            // Adjust collision body for Mini Pixel Pack (16x16 base -> 48x48 visual)
            this.player1.body.setSize(16, 16); // Match the original sprite size for proper collision
            this.player1.body.setOffset(0, 0); // Center the collision body
        }
        
        // Create Player 2 with selected character sprite
        this.player2 = this.physics.add.sprite(600, 450, 'player2_idle');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        this.player2.setMass(1);
        this.player2.setDrag(100);
        this.player2.setMaxVelocity(300, 800);
        
        // Set scale based on character type
        if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
            this.player2.setScale(2.0);  // Tiny Heroes
            this.player2.setOrigin(0.5, 1);
            // Tighten collision body for Tiny Heroes (32x32 base -> 64x64 visual)
            this.player2.body.setSize(24, 30); // Narrower width, slightly shorter height
            this.player2.body.setOffset(4, 2); // Center the collision body
        } else {
            this.player2.setScale(3.0);  // Mini Pixel Pack - larger scale to match Tiny Heroes
            this.player2.setOrigin(0.5, 1);
            // Adjust collision body for Mini Pixel Pack (16x16 base -> 48x48 visual)
            this.player2.body.setSize(16, 16); // Match the original sprite size for proper collision
            this.player2.body.setOffset(0, 0); // Center the collision body
        }
        
        // Create animations for both players
        this.createPlayerAnimations(p1SpriteConfig, p2SpriteConfig);
        
        // Start with idle animations
        this.player1.play('player1_idle_anim');
        this.player2.play('player2_idle_anim');
        
        // Create soccer ball with pixel art sprite
        this.ball = this.physics.add.sprite(400, 450, 'ball'); // Positioned at same level as players
        this.ball.setScale(0.5); // Scale to be half the size of player characters
        this.ball.setOrigin(0.5, 1); // Anchor at bottom center like players
        this.ball.setBounce(0.6);
        this.ball.setCollideWorldBounds(true);
        this.ball.setDrag(100);
        this.ball.setMass(0.5);
        this.ball.setMaxVelocity(350, 500);
        
        // No collision body adjustments - use default collision body
        
        // Create goal zones (match visual goal height)
        this.leftGoal = this.add.rectangle(10, 475, 20, 150, 0xff0000, 0);
        this.rightGoal = this.add.rectangle(790, 475, 20, 150, 0xff0000, 0);
        this.physics.add.existing(this.leftGoal, true);
        this.physics.add.existing(this.rightGoal, true);
        
        // Add visual goal post indicators using porta.png sprites
        this.add.image(10, 550, 'goalPost').setOrigin(0, 1).setScale(4.0);
        this.add.image(790, 550, 'goalPost').setOrigin(1, 1).setFlipX(true).setScale(4.0);
    
    // Physics collisions
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.ball, ground);
        this.physics.add.collider(this.player1, this.ball, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.player2, this.ball, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.player1, this.player2, this.handlePlayerPlayerCollision, null, this);
        
        // Goal detection
        this.physics.add.overlap(this.ball, this.leftGoal, () => this.handleGoalScored('right'));
        this.physics.add.overlap(this.ball, this.rightGoal, () => this.handleGoalScored('left'));
        
        // Create cursor keys and WASD
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Add power activation keys
        this.powerKeys = this.input.keyboard.addKeys('E,K');
        
        // Create UI
        this.createUI();
        
        // Start the match timer
        this.startMatchTimer();
        
        // Initialize socket connection
        this.initializeSocket();
    }

    createPlayerAnimations(p1SpriteConfig, p2SpriteConfig) {
        // Create Player 1 animations
        if (p1SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            this.anims.create({
                key: 'player1_idle_anim',
                frames: this.anims.generateFrameNumbers('player1_idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            this.anims.create({
                key: 'player1_walk_anim',
                frames: this.anims.generateFrameNumbers('player1_walk', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        } else {
            // Mini Pixel Pack - Single frame animations (no animation needed)
            // Static frames will be used directly without animation
        }
        
        // Create Player 2 animations
        if (p2SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            this.anims.create({
                key: 'player2_idle_anim',
                frames: this.anims.generateFrameNumbers('player2_idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            this.anims.create({
                key: 'player2_walk_anim',
                frames: this.anims.generateFrameNumbers('player2_walk', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        } else {
            // Mini Pixel Pack - Single frame animations (no animation needed)
            // Static frames will be used directly without animation
        }
    }

    createUI() {
        // Get selected character names
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Timer display
        this.timerText = this.add.text(400, 60, this.formatTime(this.matchTime), {
        fontSize: '28px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    
        // Score display
        this.scoreText = this.add.text(400, 30, 'Left: 0 | Right: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // FPS text
        this.fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        // Character info
        this.add.text(16, 100, `Player 1: ${p1Character.name} (${p1Character.power})`, {
        fontSize: '16px',
            fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.add.text(16, 130, `Player 2: ${p2Character.name} (${p2Character.power})`, {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.add.text(16, 160, 'Controls: WASD (P1) | Arrow Keys (P2)', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        // Connection status
        this.connectionStatusText = this.add.text(16, 190, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.socketText = this.add.text(16, 220, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Power UI
    this.createPowerUI();
    }
    
    createPowerUI() {
        // Get selected character names
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        
        // Player 1 Power UI (Bottom-left)
        this.powerUI = {};
        this.powerUI.player1 = {
            background: this.add.rectangle(120, 420, 200, 60, 0x000000, 0.8),
            title: this.add.text(120, 400, `${p1Character.name} [E]`, {
                fontSize: '14px',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5),
            status: this.add.text(120, 420, 'Not Ready', {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5),
            cooldown: this.add.text(120, 440, '', {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5)
        };
        
        // Player 2 Power UI (Bottom-right)
        this.powerUI.player2 = {
            background: this.add.rectangle(680, 420, 200, 60, 0x000000, 0.8),
            title: this.add.text(680, 400, `${p2Character.name} [K]`, {
                fontSize: '14px',
                fill: '#0080ff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5),
            status: this.add.text(680, 420, 'Not Ready', {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5),
            cooldown: this.add.text(680, 440, '', {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5)
        };
        
        // Set scroll factor to 0 so UI doesn't move with camera
        Object.values(this.powerUI.player1).forEach(element => element.setScrollFactor(0));
        Object.values(this.powerUI.player2).forEach(element => element.setScrollFactor(0));
    }
    
    updatePowerSystem() {
        const currentTime = Date.now();
        const gameTime = (currentTime - this.gameStartTime) / 1000;
        
        // Update each player's power state
        ['player1', 'player2'].forEach(player => {
            const power = this.powers[player];
            const ui = this.powerUI[player];
            
            // Check if power should be ready
            const timePassed = gameTime >= 15; // 15 seconds passed
            const goalsReached = power.goals >= 2; // 2 goals scored
            const cooldownDone = (currentTime - power.lastUsed) >= power.cooldown;
            
            power.ready = (timePassed || goalsReached) && cooldownDone;
            
            // Update immunity status
            if (power.immune && currentTime > power.immuneUntil) {
                power.immune = false;
                const playerSprite = player === 'player1' ? this.player1 : this.player2;
                playerSprite.clearTint();
            }
            
            // Update frozen status
            if (power.frozen && currentTime > power.frozenUntil) {
                power.frozen = false;
                const playerSprite = player === 'player1' ? this.player1 : this.player2;
                playerSprite.clearTint();
            }
            
            // Update UI
            if (power.ready) {
                ui.status.setText('⚡ READY!');
                ui.status.setStyle({ fill: '#00ff00' });
                ui.cooldown.setText('');
            } else if ((currentTime - power.lastUsed) < power.cooldown) {
                // On cooldown
                const remainingCooldown = Math.ceil((power.cooldown - (currentTime - power.lastUsed)) / 1000);
                ui.status.setText('Cooldown');
                ui.status.setStyle({ fill: '#ff0000' });
                ui.cooldown.setText(`${remainingCooldown}s`);
            } else {
                // Waiting for time or goals
                const timeRemaining = Math.max(0, Math.ceil(15 - gameTime));
                const goalsNeeded = Math.max(0, 2 - power.goals);
                
                ui.status.setText('Not Ready');
                ui.status.setStyle({ fill: '#ff0000' });
                
                if (timeRemaining > 0 && goalsNeeded > 0) {
                    ui.cooldown.setText(`${timeRemaining}s or ${goalsNeeded} goals`);
                } else {
                    ui.cooldown.setText('');
                }
            }
        });
    }
    
    activatePower(player) {
        const power = this.powers[player];
        
        if (!power.ready || this.gameOver) return;
        
        // Use the power
        power.ready = false;
        power.lastUsed = Date.now();
        
        // Get character and execute power
        const characterId = selectedCharacters[player];
        const playerSprite = player === 'player1' ? this.player1 : this.player2;
        const opponent = player === 'player1' ? this.player2 : this.player1;
        
        switch (characterId) {
            case 'blaze':
                this.executeFlameUppercut(playerSprite, opponent);
                break;
            case 'frostbite':
                this.executeIceBlast(playerSprite, opponent);
                break;
            case 'volt':
                this.executeElectricDash(playerSprite);
                break;
            case 'jellyhead':
                this.executeBounceShield(playerSprite);
                break;
            case 'brick':
                this.executeGroundPound(playerSprite, opponent);
                break;
            case 'whirlwind':
                this.executeSpinKick(playerSprite);
                break;
        }
    }
    
    executeFlameUppercut(player, opponent) {
        // Launch player upward with flame effect
        player.setVelocityY(-400);
        player.setTint(0xff4500);
        
        // Check for nearby opponent
        const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
        if (distance < 100) {
            // Check if opponent is immune
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            
            if (!opponentPower.immune) {
                opponent.setVelocityY(-300);
                opponent.setTint(0xff0000);
                this.cameras.main.shake(300, 0.02);
                
                // Clear opponent tint
                this.time.delayedCall(300, () => opponent.clearTint());
            }
        }
        
        // Fire kick affects the ball - make it undefendable
        const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
        if (ballDistance < 120) {
            // Apply fire effect to ball
            this.ball.setTint(0xff4500);
            this.ball.fireKicked = true;
            
            // Powerful kick towards opponent's goal
            const ballDirection = player.x < 400 ? 1 : -1;
            this.ball.setVelocity(ballDirection * 600, -200);
            
            // Clear fire effect after 3 seconds
            this.time.delayedCall(3000, () => {
                this.ball.clearTint();
                this.ball.fireKicked = false;
            });
        }
        
        // Clear player tint
        this.time.delayedCall(800, () => player.clearTint());
    }
    
    executeIceBlast(player, opponent) {
        // Create ice projectile
        const projectile = this.add.circle(player.x, player.y - 20, 8, 0x00bfff);
        this.physics.add.existing(projectile);
        
        // Set projectile velocity
        const direction = player.flipX ? -1 : 1;
        projectile.body.setVelocity(direction * 300, 0);
        projectile.body.setGravityY(-300);
        
        // Handle collision with opponent
        this.physics.add.overlap(projectile, opponent, () => {
            // Check if opponent is immune
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            
            if (opponentPower.immune || opponentPower.shieldActive) {
                // Immunity or shield blocks the attack - projectile bounces off
                projectile.body.setVelocity(-projectile.body.velocity.x, -Math.abs(projectile.body.velocity.y));
                
                // Visual effect for shield bounce
                if (opponentPower.shieldActive) {
                    opponent.setTint(0x9370db);
                    this.time.delayedCall(200, () => opponent.clearTint());
                }
                return;
            }
            
            opponent.setVelocity(0, 0);
            opponent.setTint(0x87ceeb);
            
            // Actually freeze the opponent - disable movement
            opponentPower.frozen = true;
            opponentPower.frozenUntil = Date.now() + 2000; // 2 seconds
            
            // Clear freeze after 2 seconds
            this.time.delayedCall(2000, () => {
                opponentPower.frozen = false;
                opponent.clearTint();
            });
            
            projectile.destroy();
        });
        
        // Auto-destroy after 2 seconds
        this.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }
    
    executeElectricDash(player) {
        // Electric dash with yellow tint
        const direction = player.flipX ? -1 : 1;
        player.setVelocityX(direction * 500);
        player.setTint(0xffff00);
        
        // Scale effect
        this.tweens.add({
            targets: player,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
        
        // Electric dash can damage opponents - check during dash
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        const checkElectricCollision = () => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
            if (distance < 60) {
                // Check if opponent is immune
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (!opponentPower.immune) {
                    // Electric shock effect
                    opponent.setVelocity(direction * 400, -200);
                    opponent.setTint(0xffff00);
                    this.cameras.main.shake(200, 0.02);
                    
                    // Clear opponent tint
                    this.time.delayedCall(400, () => opponent.clearTint());
                }
            }
        };
        
        // Check for collisions during the dash
        this.time.addEvent({
            delay: 50,
            callback: checkElectricCollision,
            repeat: 10
        });
        
        // Clear tint
        this.time.delayedCall(500, () => player.clearTint());
    }
    
    executeBounceShield(player) {
        // Visual shield effect
        player.setTint(0x9370db);
        
        // Create visible shield ring around player
        const shield = this.add.circle(player.x, player.y, 40, 0x9370db, 0.3);
        shield.setStrokeStyle(3, 0x9370db);
        
        // Make shield follow player
        const followShield = () => {
            if (shield.active) {
                shield.x = player.x;
                shield.y = player.y;
            }
        };
        
        // Update shield position every frame
        const shieldTimer = this.time.addEvent({
            delay: 16,
            callback: followShield,
            repeat: 187 // 3 seconds at 60fps
        });
        
        // Bounce effect on player
        this.tweens.add({
            targets: player,
            alpha: 0.8,
            duration: 200,
            yoyo: true,
            repeat: 15, // Longer effect
            onComplete: () => {
                player.setAlpha(1);
                player.clearTint();
            }
        });
        
        // Shield bounces projectiles back
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        this.powers[playerKey].shieldActive = true;
        
        // Remove shield after 3 seconds
        this.time.delayedCall(3000, () => {
            if (shield.active) shield.destroy();
            this.powers[playerKey].shieldActive = false;
            shieldTimer.remove();
        });
    }
    
    executeGroundPound(player, opponent) {
        // Grant immunity for 5 seconds
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        const power = this.powers[playerKey];
        
        power.immune = true;
        power.immuneUntil = Date.now() + 5000; // 5 seconds
        
        // Visual effect - golden tint for immunity
        player.setTint(0xffd700); // Gold color
        
        // Immunity flash effect
        this.tweens.add({
            targets: player,
            alpha: 0.8,
            duration: 200,
            yoyo: true,
            repeat: -1, // Infinite repeat
            onComplete: () => {
                player.setAlpha(1);
            }
        });
        
        // Stop the flashing when immunity ends
        this.time.delayedCall(5000, () => {
            this.tweens.killTweensOf(player);
            player.setAlpha(1);
        });
    }
    
    executeSpinKick(player) {
        // Spin effect
        player.setTint(0x87ceeb);
        
        // Create wind effect around player
        const windEffect = this.add.circle(player.x, player.y, 60, 0x87ceeb, 0.2);
        windEffect.setStrokeStyle(2, 0x87ceeb);
        
        // Wind effect follows player
        const followWind = () => {
            if (windEffect.active) {
                windEffect.x = player.x;
                windEffect.y = player.y;
            }
        };
        
        // Update wind position every frame
        const windTimer = this.time.addEvent({
            delay: 16,
            callback: followWind,
            repeat: 93 // 1.5 seconds at 60fps
        });
        
        // Rotation tween
        this.tweens.add({
            targets: player,
            rotation: player.rotation + (Math.PI * 6),
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                player.setRotation(0);
                player.clearTint();
                if (windEffect.active) windEffect.destroy();
                windTimer.remove();
            }
        });
        
        // Spin kick affects nearby opponents and ball
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        const checkSpinEffect = () => {
            // Check opponent
            const opponentDistance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
            if (opponentDistance < 80) {
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (!opponentPower.immune && !opponentPower.shieldActive) {
                    // Spin the opponent away
                    const spinDirection = opponent.x > player.x ? 1 : -1;
                    opponent.setVelocity(spinDirection * 300, -150);
                    opponent.setTint(0x87ceeb);
                    this.time.delayedCall(300, () => opponent.clearTint());
                }
            }
            
            // Check ball
            const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
            if (ballDistance < 90) {
                // Apply spin effect to ball
                this.ball.setTint(0x87ceeb);
                const ballDirection = this.ball.x > player.x ? 1 : -1;
                this.ball.setVelocity(ballDirection * 400, -100);
                
                // Clear ball tint
                this.time.delayedCall(500, () => this.ball.clearTint());
            }
        };
        
        // Check for spin effects during the spin
        this.time.addEvent({
            delay: 100,
            callback: checkSpinEffect,
            repeat: 14 // Check 15 times during 1.5 seconds
        });
    }







    startMatchTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
        loop: true
    });
}

    updateTimer() {
        if (this.gameOver) return;
        
        this.matchTime--;
        this.timerText.setText(this.formatTime(this.matchTime));
        
        if (this.matchTime <= 10) {
            this.timerText.setStyle({ fill: '#ff0000' });
        } else if (this.matchTime <= 30) {
            this.timerText.setStyle({ fill: '#ffa500' });
        }
        
        if (this.matchTime <= 0) {
            this.handleTimeUp();
        }
    }

    formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

    handleTimeUp() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        let winner, winMessage;
        
        if (this.leftScore > this.rightScore) {
        winner = 'left';
        winMessage = 'Time\'s Up! Left Player Wins!';
        } else if (this.rightScore > this.leftScore) {
        winner = 'right';
        winMessage = 'Time\'s Up! Right Player Wins!';
    } else {
        winner = 'tie';
        winMessage = 'Time\'s Up! It\'s a Tie!';
    }
    
        this.handleGameOver(winner, winMessage);
}

    handlePlayerBallCollision(player, ball) {
        if (this.gameOver) return;
        
        // Check if this is a fire ball and handle special logic
        if (ball.fireKicked) {
            // Determine which player this is
            const isPlayer1 = player === this.player1;
            const playerKey = isPlayer1 ? 'player1' : 'player2';
            const playerPower = this.powers[playerKey];
            
            // Check if player has any active power that can deflect the fire ball
            const canDeflect = playerPower.immune || playerPower.shieldActive || this.isPlayerPowerActive(playerKey);
            
            if (!canDeflect) {
                // Fire ball passes through - no collision response
                console.log('Fire ball passes through player without active power');
                return;
            } else {
                // Player has active power - they can deflect the fire ball
                console.log('Player with active power deflects fire ball');
                
                // Add special deflection effect
                this.cameras.main.shake(200, 0.02);
                
                // Give the ball a powerful deflection
                const deflectionDirection = isPlayer1 ? -1 : 1;
                ball.setVelocity(deflectionDirection * 500, -250);
                
                // Visual feedback for successful deflection
                player.setTint(0x00ff00);
                this.time.delayedCall(300, () => player.clearTint());
                
                // Clear fire effect since it was deflected
                ball.clearTint();
                ball.fireKicked = false;
                
                return;
            }
        }
        
        // Normal ball collision logic (existing code)
        const ballVelocityX = ball.body.velocity.x;
        const ballVelocityY = ball.body.velocity.y;
        const playerVelocityX = player.body.velocity.x;
        const playerVelocityY = player.body.velocity.y;
        
        const deltaX = ball.x - player.x;
        const deltaY = ball.y - player.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < 1) return;
        
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        
        const separationDistance = 35;
        const separationForce = Math.max(0, separationDistance - distance);
        if (separationForce > 0) {
            ball.x += normalX * separationForce;
            ball.y += normalY * separationForce;
        }
        
        const isPlayer1 = player === this.player1;
        const correctDirection = isPlayer1 ? 1 : -1;
        
        const playerIsMoving = Math.abs(playerVelocityX) > 50 || Math.abs(playerVelocityY) > 50;
        const playerIsGrounded = player.body.touching.down;
        const isHeadCollision = deltaY < -15 && Math.abs(deltaX) < 30;
        
        if (playerIsMoving && playerIsGrounded && !isHeadCollision) {
            const kickPower = 280;
            let kickDirection = playerVelocityX > 0 ? 1 : playerVelocityX < 0 ? -1 : correctDirection;
            
            if ((isPlayer1 && kickDirection < 0) || (!isPlayer1 && kickDirection > 0)) {
                kickDirection = correctDirection;
            }
            
            ball.setVelocityX(kickDirection * kickPower);
            ball.setVelocityY(-200);
            player.setVelocityX(playerVelocityX * 0.7);
            
        } else {
            const bounceStrength = 1.1;
            const minBounceSpeed = 180;
            
            const incomingSpeed = Math.sqrt(ballVelocityX * ballVelocityX + ballVelocityY * ballVelocityY);
            const bounceSpeed = Math.max(incomingSpeed * bounceStrength, minBounceSpeed);
            
            if (isHeadCollision) {
                ball.setVelocityX(correctDirection * bounceSpeed * 0.8);
                ball.setVelocityY(-Math.abs(bounceSpeed * 0.6));
            } else {
                let bounceX = normalX * bounceSpeed;
                let bounceY = normalY * bounceSpeed;
                
                if ((isPlayer1 && bounceX < 0) || (!isPlayer1 && bounceX > 0)) {
                    bounceX = (bounceX * 0.3) + (correctDirection * bounceSpeed * 0.7);
                }
                
                ball.setVelocityX(bounceX);
                ball.setVelocityY(bounceY);
                
                if (deltaY > 0) {
                    ball.setVelocityY(Math.max(ball.body.velocity.y, -120));
                }
            }
            
            if (incomingSpeed > 100) {
                player.setVelocityX(playerVelocityX + (-normalX * 20));
            }
        }
    }
    
    // Helper function to check if a player has any active power
    isPlayerPowerActive(playerKey) {
        const playerSprite = playerKey === 'player1' ? this.player1 : this.player2;
        const characterId = selectedCharacters[playerKey];
        const currentTime = Date.now();
        
        // Check if player is currently using their power (within the last 2 seconds)
        const power = this.powers[playerKey];
        const recentlyUsed = (currentTime - power.lastUsed) < 2000; // 2 seconds
        
        // Check for specific active power effects
        switch (characterId) {
            case 'volt':
                // Check if player has yellow tint (electric dash)
                return playerSprite.tintTopLeft === 0xffff00 || recentlyUsed;
            case 'whirlwind':
                // Check if player has blue tint (spin kick)
                return playerSprite.tintTopLeft === 0x87ceeb || recentlyUsed;
            case 'blaze':
                // Check if player has fire tint (flame uppercut)
                return playerSprite.tintTopLeft === 0xff4500 || recentlyUsed;
            case 'frostbite':
                // Frostbite doesn't have a defensive power, but recently used counts
                return recentlyUsed;
            case 'jellyhead':
                // Shield is already checked above with shieldActive
                return false;
            case 'brick':
                // Immunity is already checked above with immune
                return false;
            default:
                return false;
        }
    }

    handlePlayerPlayerCollision(player1, player2) {
        if (this.gameOver) return;
        
        const deltaX = player2.x - player1.x;
        const deltaY = player2.y - player1.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < 1) return; // Prevent division by zero
        
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        
        const p1VelX = player1.body.velocity.x;
        const p1VelY = player1.body.velocity.y;
        const p2VelX = player2.body.velocity.x;
        const p2VelY = player2.body.velocity.y;
        
        const relativeVelX = p1VelX - p2VelX;
        const relativeVelY = p1VelY - p2VelY;
        
        // Simple collision physics
        const collisionStrength = 0.3;
        const pushForce = (relativeVelX * normalX + relativeVelY * normalY) * collisionStrength;
        
        // Apply velocity changes
        player1.setVelocityX(p1VelX - pushForce * normalX);
        player1.setVelocityY(p1VelY - pushForce * normalY);
        
        player2.setVelocityX(p2VelX + pushForce * normalX);
        player2.setVelocityY(p2VelY + pushForce * normalY);
        
        // Safe separation that prevents ground penetration
        const separationForce = 3;
        const groundLevel = 550; // Ground is at y=575, but players have origins at bottom, so effective ground is ~550
        
        // Calculate proposed new positions
        const newP1X = player1.x - normalX * separationForce;
        const newP1Y = player1.y - normalY * separationForce;
        const newP2X = player2.x + normalX * separationForce;
        const newP2Y = player2.y + normalY * separationForce;
        
        // Apply separation, but prevent going below ground
        player1.x = newP1X;
        player1.y = Math.min(newP1Y, groundLevel); // Don't go below ground
        
        player2.x = newP2X;
        player2.y = Math.min(newP2Y, groundLevel); // Don't go below ground
        
        // If a player would be pushed into the ground, give them an upward boost instead
        if (newP1Y > groundLevel) {
            player1.setVelocityY(Math.min(player1.body.velocity.y, -100)); // Upward boost
        }
        if (newP2Y > groundLevel) {
            player2.setVelocityY(Math.min(player2.body.velocity.y, -100)); // Upward boost
        }
    }

    handleGoalScored(scoringPlayer) {
        if (this.gameOver) return;
    
    if (scoringPlayer === 'left') {
            this.leftScore++;
            this.powers.player1.goals++;
    } else {
            this.rightScore++;
            this.powers.player2.goals++;
    }
    
        this.scoreText.setText(`Left: ${this.leftScore} | Right: ${this.rightScore}`);
    
        this.ball.setPosition(400, 450); // Reset ball to same level as players
        this.ball.setVelocity(0, 0);
    
        if (this.leftScore >= 3 || this.rightScore >= 3) {
        const winMessage = scoringPlayer === 'left' ? 'Left Player Wins!' : 'Right Player Wins!';
            this.handleGameOver(scoringPlayer, winMessage);
    }
}

    handleGameOver(winner, customMessage = null) {
        this.gameOver = true;
    
        if (this.timerEvent) {
            this.timerEvent.remove();
    }
    
        this.ball.setVelocity(0, 0);
        this.ball.body.setGravityY(0);
    
    let winnerText;
    if (customMessage) {
        winnerText = customMessage;
    } else {
        winnerText = winner === 'left' ? 'Left Player Wins!' : 
                    winner === 'right' ? 'Right Player Wins!' : 
                    'It\'s a Tie!';
    }
    
        this.gameOverText = this.add.text(400, 200, winnerText, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    
        this.add.text(400, 260, 'Press R to restart | Press C to choose characters', {
            fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-R', this.restartGame, this);
        this.input.keyboard.on('keydown-C', this.chooseCharacters, this);
    }

    restartGame() {
        this.scene.restart();
    }

    chooseCharacters() {
        // Reset selected characters
        selectedCharacters = {
            player1: null,
            player2: null
        };
        this.scene.start('CharacterSelectionScene');
    }

    update() {
        this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        
        if (this.gameOver) return;
        
        // Update power system
        this.updatePowerSystem();
        
        // Handle power activation
        if (Phaser.Input.Keyboard.JustDown(this.powerKeys.E)) {
            this.activatePower('player1');
        }
        if (Phaser.Input.Keyboard.JustDown(this.powerKeys.K)) {
            this.activatePower('player2');
        }
        
        const speed = 160;
        const jumpSpeed = 330;
        
        // Player 1 movement (WASD) - with animations
        if (!this.powers.player1.frozen) {
            if (this.wasd.A.isDown) {
                this.player1.setVelocityX(-speed);
                this.player1.setFlipX(true);
                if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_walk_anim') {
                    this.player1.play('player1_walk_anim');
                }
            } else if (this.wasd.D.isDown) {
                this.player1.setVelocityX(speed);
                this.player1.setFlipX(false);
                if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_walk_anim') {
                    this.player1.play('player1_walk_anim');
                }
            } else {
                this.player1.setVelocityX(0);
                if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_idle_anim') {
                    this.player1.play('player1_idle_anim');
                }
            }
            
            if (this.wasd.W.isDown && this.player1.body.touching.down) {
                this.player1.setVelocityY(-jumpSpeed);
            }
        } else {
            // Frozen - stop horizontal movement but allow gravity
            this.player1.setVelocityX(0);
        }
        
        // Player 2 movement (Arrow keys) - with animations
        if (!this.powers.player2.frozen) {
            if (this.cursors.left.isDown) {
                this.player2.setVelocityX(-speed);
                this.player2.setFlipX(true);
                if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_walk_anim') {
                    this.player2.play('player2_walk_anim');
                }
            } else if (this.cursors.right.isDown) {
                this.player2.setVelocityX(speed);
                this.player2.setFlipX(false);
                if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_walk_anim') {
                    this.player2.play('player2_walk_anim');
                }
            } else {
                this.player2.setVelocityX(0);
                if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_idle_anim') {
                    this.player2.play('player2_idle_anim');
                }
            }
            
            if (this.cursors.up.isDown && this.player2.body.touching.down) {
                this.player2.setVelocityY(-jumpSpeed);
            }
        } else {
            // Frozen - stop horizontal movement but allow gravity
            this.player2.setVelocityX(0);
        }
    }

    initializeSocket() {
// Socket.io connection setup
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
            this.connectionStatusText.setText('Socket: Connected ✅');
            this.connectionStatusText.setStyle({ fill: '#00ff00' });
            this.socketText.setText(`Socket ID: ${this.socket.id}`);
            
            this.socket.emit('hello from client', {
            message: 'Hello from Phaser client!',
            timestamp: new Date().toISOString()
        });
        });
        
        this.socket.on('hello from server', (data) => {
            this.connectionStatusText.setText('Socket: Server responded ✅');
        });
        
        this.socket.on('connect_error', (error) => {
            this.connectionStatusText.setText('Socket: Connection Error ❌');
            this.connectionStatusText.setStyle({ fill: '#ff0000' });
        });
        
        this.socket.on('disconnect', (reason) => {
            this.connectionStatusText.setText('Socket: Disconnected ❌');
            this.connectionStatusText.setStyle({ fill: '#ff0000' });
            this.socketText.setText('Socket ID: Disconnected');
        });
    }
}

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
    scene: [CharacterSelectionScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config); 
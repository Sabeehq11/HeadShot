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

// XP and Progression System
const XP_SYSTEM = {
    // XP rewards per match
    XP_WINNER: 50,
    XP_LOSER: 25,
    
    // XP thresholds for each level
    XP_THRESHOLDS: [
        0,    // Level 1 (base)
        100,  // Level 2 (bronze)
        250,  // Level 3 (silver)
        500,  // Level 4 (gold)
        1000  // Level 5 (shadow)
    ],
    
    // Skin types for each level
    SKIN_TYPES: {
        1: 'base',
        2: 'bronze',
        3: 'silver',
        4: 'gold',
        5: 'shadow'
    },
    
    // Calculate level from XP
    calculateLevel(xp) {
        for (let i = this.XP_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= this.XP_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    },
    
    // Get XP needed for next level
    getXPForNextLevel(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        if (currentLevel >= this.XP_THRESHOLDS.length) {
            return null; // Max level reached
        }
        return this.XP_THRESHOLDS[currentLevel] - currentXP;
    },
    
    // Get all unlocked skins for a player
    getUnlockedSkins(xp) {
        const level = this.calculateLevel(xp);
        const unlockedSkins = [];
        for (let i = 1; i <= level; i++) {
            unlockedSkins.push(this.SKIN_TYPES[i]);
        }
        return unlockedSkins;
    }
};

// Player Progress System
const PLAYER_PROGRESS = {
    // Load player progress from localStorage
    loadPlayerProgress(playerId) {
        const key = `${playerId}_progress`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                // Validate structure
                if (progress.xp !== undefined && progress.equippedSkins !== undefined) {
                    return progress;
                }
            } catch (e) {
                console.warn(`Failed to parse saved progress for ${playerId}:`, e);
            }
        }
        
        // Return default progress if no valid save found
        return this.getDefaultProgress();
    },
    
    // Save player progress to localStorage
    savePlayerProgress(playerId, progress) {
        const key = `${playerId}_progress`;
        try {
            localStorage.setItem(key, JSON.stringify(progress));
            console.log(`Progress saved for ${playerId}:`, progress);
        } catch (e) {
            console.error(`Failed to save progress for ${playerId}:`, e);
        }
    },
    
    // Get default progress for new players
    getDefaultProgress() {
        const defaultSkins = {};
        Object.keys(CHARACTERS).forEach(charKey => {
            defaultSkins[charKey] = 'base';
        });
        
        return {
            xp: 0,
            equippedSkins: defaultSkins
        };
    },
    
    // Add XP to a player
    addXP(playerId, xpAmount) {
        const progress = this.loadPlayerProgress(playerId);
        const oldLevel = XP_SYSTEM.calculateLevel(progress.xp);
        
        progress.xp += xpAmount;
        const newLevel = XP_SYSTEM.calculateLevel(progress.xp);
        
        this.savePlayerProgress(playerId, progress);
        
        // Return level up information
        return {
            oldXP: progress.xp - xpAmount,
            newXP: progress.xp,
            oldLevel: oldLevel,
            newLevel: newLevel,
            leveledUp: newLevel > oldLevel
        };
    },
    
    // Equip a skin for a character
    equipSkin(playerId, characterKey, skinType) {
        const progress = this.loadPlayerProgress(playerId);
        const unlockedSkins = XP_SYSTEM.getUnlockedSkins(progress.xp);
        
        if (unlockedSkins.includes(skinType)) {
            progress.equippedSkins[characterKey] = skinType;
            this.savePlayerProgress(playerId, progress);
            return true;
        }
        
        return false; // Skin not unlocked
    },
    
    // Get equipped skin for a character
    getEquippedSkin(playerId, characterKey) {
        const progress = this.loadPlayerProgress(playerId);
        return progress.equippedSkins[characterKey] || 'base';
    }
};

// Initialize player progress on game start
let player1Progress = PLAYER_PROGRESS.loadPlayerProgress('player1');
let player2Progress = PLAYER_PROGRESS.loadPlayerProgress('player2');

// Global character selection state
let selectedCharacters = {
    player1: null,
    player2: null
};

// Global map selection state
let selectedMap = 'nightcity';

// Global session state for tracking wins across matches
let SessionState = {
    player1Wins: 0,
    player2Wins: 0,
    totalRoundsPlayed: 0
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
        this.player1Grid = [];
        this.player2Grid = [];
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        this.lockerElements = [];
        this.lockerCharElements = [];
        
        // Add fallback functions if CharacterSpriteHelper is missing functions
        if (!CharacterSpriteHelper.getSkinDisplayName) {
            CharacterSpriteHelper.getSkinDisplayName = function(skinType) {
                const names = {
                    'base': 'Base',
                    'bronze': 'Bronze',
                    'silver': 'Silver',
                    'gold': 'Gold',
                    'shadow': 'Shadow'
                };
                return names[skinType] || skinType;
            };
        }
        
        if (!CharacterSpriteHelper.getAllSkinTypes) {
            CharacterSpriteHelper.getAllSkinTypes = function() {
                return ['base', 'bronze', 'silver', 'gold', 'shadow'];
            };
        }
        
        if (!CharacterSpriteHelper.getSkinRarityColor) {
            CharacterSpriteHelper.getSkinRarityColor = function(skinType) {
                const colors = {
                    'base': 0xffffff,    // white
                    'bronze': 0xcd7f32,  // bronze
                    'silver': 0xc0c0c0,  // silver
                    'gold': 0xffd700,    // gold
                    'shadow': 0x800080   // purple
                };
                return colors[skinType] || 0xffffff;
            };
        }
    }

    init() {
        // Reset scene state when entering from another scene
        this.characterKeys = Object.keys(CHARACTERS);
        this.player1Selection = 0;
        this.player2Selection = 0;
        this.player1Confirmed = false;
        this.player2Confirmed = false;
        this.player1UI = null;
        this.player2UI = null;
        this.charactersDisplay = [];
        this.player1Grid = [];
        this.player2Grid = [];
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        this.lockerElements = [];
        this.lockerCharElements = [];
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
            } else {
                console.error(`No sprite config found for character: ${key}`);
            }
        });

        // Load map thumbnails
        this.load.image('nightcity_thumb', 'assets/Sprites/Backgrounds/nightcity.png');
        this.load.image('ch_thumb', 'assets/Sprites/Backgrounds/ch.png');
        this.load.image('skyline_thumb', 'assets/Sprites/Backgrounds/skyline.png');
        this.load.image('nature_thumb', 'assets/Sprites/Backgrounds/nature.png');
        this.load.image('nighttree_thumb', 'assets/Sprites/Backgrounds/nighttree.png');
        this.load.image('outsideworld_thumb', 'assets/Sprites/Backgrounds/outsideworld.png');
    }

    create() {
        // Debug CharacterSpriteHelper
        console.log('CharacterSpriteHelper available:', typeof CharacterSpriteHelper);
        console.log('getSkinDisplayName available:', typeof CharacterSpriteHelper?.getSkinDisplayName);
        console.log('getAllSkinTypes available:', typeof CharacterSpriteHelper?.getAllSkinTypes);
        console.log('CHARACTERS keys:', Object.keys(CHARACTERS));
        
        // Add fallback functions if CharacterSpriteHelper is missing functions
        if (!CharacterSpriteHelper.getSkinDisplayName) {
            CharacterSpriteHelper.getSkinDisplayName = function(skinType) {
                const names = {
                    'base': 'Base',
                    'bronze': 'Bronze',
                    'silver': 'Silver',
                    'gold': 'Gold',
                    'shadow': 'Shadow'
                };
                return names[skinType] || skinType;
            };
        }
        
        if (!CharacterSpriteHelper.getAllSkinTypes) {
            CharacterSpriteHelper.getAllSkinTypes = function() {
                return ['base', 'bronze', 'silver', 'gold', 'shadow'];
            };
        }
        
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 30, '⚡ CHARACTER SELECTION ⚡', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Split screen divider
        this.add.rectangle(400, 300, 4, 600, 0x555555);

        // Player 1 Side (Left)
        this.add.rectangle(200, 80, 380, 40, 0x003300, 0.8);
        this.add.text(200, 80, 'Player 1', {
            fontSize: '24px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Player 1 controls
        this.add.text(200, 110, 'A/D to navigate • W to select', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Player 1 Locker button
        this.player1LockerBtn = this.add.rectangle(340, 80, 80, 30, 0x444444, 0.8);
        this.player1LockerText = this.add.text(340, 80, 'LOCKER', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.player1LockerBtn.setInteractive();
        this.player1LockerBtn.on('pointerdown', () => this.openLocker('player1'));
        
        // Add hover effects
        this.player1LockerBtn.on('pointerover', () => {
            this.player1LockerBtn.setFillStyle(0x666666, 0.9);
            this.player1LockerText.setStyle({ fill: '#00ff00' });
        });
        this.player1LockerBtn.on('pointerout', () => {
            this.player1LockerBtn.setFillStyle(0x444444, 0.8);
            this.player1LockerText.setStyle({ fill: '#ffffff' });
        });

        // Player 2 Side (Right)
        this.add.rectangle(600, 80, 380, 40, 0x000033, 0.8);
        this.add.text(600, 80, 'Player 2', {
            fontSize: '24px',
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Player 2 controls
        this.add.text(600, 110, '← → to navigate • ↑ to select', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Player 2 Locker button
        this.player2LockerBtn = this.add.rectangle(740, 80, 80, 30, 0x444444, 0.8);
        this.player2LockerText = this.add.text(740, 80, 'LOCKER', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.player2LockerBtn.setInteractive();
        this.player2LockerBtn.on('pointerdown', () => this.openLocker('player2'));
        
        // Add hover effects
        this.player2LockerBtn.on('pointerover', () => {
            this.player2LockerBtn.setFillStyle(0x666666, 0.9);
            this.player2LockerText.setStyle({ fill: '#0080ff' });
        });
        this.player2LockerBtn.on('pointerout', () => {
            this.player2LockerBtn.setFillStyle(0x444444, 0.8);
            this.player2LockerText.setStyle({ fill: '#ffffff' });
        });

        // Create character grids for each player
        this.createSplitCharacterDisplay();

        // Create player UI panels
        this.createPlayerUI();

        // Setup keyboard controls
        this.setupControls();

        // Update display
        this.updateDisplay();
    }

    createSplitCharacterDisplay() {
        this.charactersDisplay = [];
        this.player1Grid = [];
        this.player2Grid = [];

        // Grid settings
        const gridCols = 3;
        const gridRows = 2;
        const cellWidth = 110;
        const cellHeight = 120;
        
        // Player 1 grid (left side)
        const p1StartX = 90;
        const p1StartY = 150;
        
        // Player 2 grid (right side)
        const p2StartX = 490;
        const p2StartY = 150;

        this.characterKeys.forEach((key, index) => {
            const character = CHARACTERS[key];
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            
            // Get equipped skin for preview
            const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', key);
            const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', key);
            
            // Player 1 character preview
            const p1X = p1StartX + (col * cellWidth);
            const p1Y = p1StartY + (row * cellHeight);
            
            const p1Sprite = this.createCharacterPreview(p1X, p1Y, key, p1EquippedSkin);
            const p1Name = this.add.text(p1X, p1Y + 50, character.name, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);
            
            // Player 1 skin indicator
            const p1SkinText = this.add.text(p1X, p1Y + 70, CharacterSpriteHelper.getSkinDisplayName(p1EquippedSkin), {
                fontSize: '10px',
                fill: CharacterSpriteHelper.getSkinRarityColor(p1EquippedSkin),
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5);

            this.player1Grid.push({
                sprite: p1Sprite,
                name: p1Name,
                skinText: p1SkinText,
                character: key,
                index: index
            });

            // Player 2 character preview
            const p2X = p2StartX + (col * cellWidth);
            const p2Y = p2StartY + (row * cellHeight);
            
            const p2Sprite = this.createCharacterPreview(p2X, p2Y, key, p2EquippedSkin);
            const p2Name = this.add.text(p2X, p2Y + 50, character.name, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);
            
            // Player 2 skin indicator
            const p2SkinText = this.add.text(p2X, p2Y + 70, CharacterSpriteHelper.getSkinDisplayName(p2EquippedSkin), {
                fontSize: '10px',
                fill: CharacterSpriteHelper.getSkinRarityColor(p2EquippedSkin),
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5);

            this.player2Grid.push({
                sprite: p2Sprite,
                name: p2Name,
                skinText: p2SkinText,
                character: key,
                index: index
            });
        });
    }

    createCharacterPreview(x, y, characterKey, skinType) {
        const character = CHARACTERS[characterKey];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        let sprite;
        
        // Check if the sprite texture exists
        if (this.textures.exists(`${characterKey}_preview`)) {
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                // For sprite sheets (Tiny Heroes), use static frame
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(1.8)
                      .setOrigin(0.5)
                      .setFrame(0);
            } else {
                // For single frames (Mini Pixel Pack)
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(2.5)
                      .setOrigin(0.5);
            }
        } else {
            // Create a placeholder if sprite doesn't exist
            console.error(`Sprite not found for character: ${characterKey}`);
            sprite = this.add.rectangle(x, y, 32, 32, character.color);
            sprite.setScale(2);
            
            // Add character name as text
            this.add.text(x, y, characterKey.charAt(0).toUpperCase(), {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }

        // Apply skin tint if not base skin
        if (skinType !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(skinType);
            sprite.setTint(skinColor);
        }

        // Add subtle hover effect
        sprite.setInteractive();
        sprite.on('pointerover', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX * 1.1,
                scaleY: sprite.scaleY * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        sprite.on('pointerout', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX / 1.1,
                scaleY: sprite.scaleY / 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        return sprite;
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
        // Ensure grids are properly initialized
        if (!this.player1Grid || !this.player2Grid || !this.characterKeys) {
            console.error('updateDisplay called before proper initialization');
            return;
        }
        
        // Reset all character displays to normal state
        this.player1Grid.forEach((display, index) => {
            if (!display || !display.sprite) return;
            
            // Reset tint and scale
            display.sprite.clearTint();
            
            // Get equipped skin and apply tint
            const characterKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', characterKey);
            
            if (equippedSkin !== 'base') {
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
                display.sprite.setTint(skinColor);
            }
            
            // Set normal scale
            const character = CHARACTERS[characterKey];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(1.8);
            } else {
                display.sprite.setScale(2.5);
            }
        });

        this.player2Grid.forEach((display, index) => {
            if (!display || !display.sprite) return;
            
            // Reset tint and scale
            display.sprite.clearTint();
            
            // Get equipped skin and apply tint
            const characterKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', characterKey);
            
            if (equippedSkin !== 'base') {
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
                display.sprite.setTint(skinColor);
            }
            
            // Set normal scale
            const character = CHARACTERS[characterKey];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(1.8);
            } else {
                display.sprite.setScale(2.5);
            }
        });

        // Highlight Player 1 selection
        if (!this.player1Confirmed && 
            this.player1Selection >= 0 && 
            this.player1Selection < this.player1Grid.length) {
            
            const p1Display = this.player1Grid[this.player1Selection];
            const p1CharacterKey = this.characterKeys[this.player1Selection];
            const p1Character = CHARACTERS[p1CharacterKey];
            
            if (p1Character && p1Display.sprite) {
                const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
                
                // Add green selection overlay
                p1Display.sprite.setTint(0x00ff00);
                
                // Increase scale for selection
                if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
                    p1Display.sprite.setScale(2.2);
                } else {
                    p1Display.sprite.setScale(3.0);
                }
            }
        }

        // Highlight Player 2 selection
        if (!this.player2Confirmed && 
            this.player2Selection >= 0 && 
            this.player2Selection < this.player2Grid.length) {
            
            const p2Display = this.player2Grid[this.player2Selection];
            const p2CharacterKey = this.characterKeys[this.player2Selection];
            const p2Character = CHARACTERS[p2CharacterKey];
            
            if (p2Character && p2Display.sprite) {
                const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
                
                // Add blue selection overlay
                p2Display.sprite.setTint(0x0080ff);
                
                // Increase scale for selection
                if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
                    p2Display.sprite.setScale(2.2);
                } else {
                    p2Display.sprite.setScale(3.0);
                }
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
            this.player1UI.status.setText('Press W to confirm');
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
            this.player2UI.status.setText('Press ↑ to confirm');
            this.player2UI.status.setStyle({ fill: '#cccccc' });
        }
    }

    openLocker(playerId) {
        console.log(`Opening locker for ${playerId}`);
        
        // Prevent multiple lockers from opening
        if (this.lockerOpen) {
            return;
        }
        
        this.lockerOpen = true;
        this.currentLockerPlayer = playerId;
        
        // Create modal backdrop - much darker for better visibility
        this.lockerBackdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        this.lockerBackdrop.setInteractive();
        this.lockerBackdrop.on('pointerdown', () => this.closeLocker());
        
        // Create modal panel - darker and more opaque
        this.lockerPanel = this.add.rectangle(400, 300, 700, 500, 0x1a1a1a, 0);
        this.lockerPanel.setStrokeStyle(4, playerId === 'player1' ? 0x00ff00 : 0x0080ff);
        this.lockerPanel.setScale(0.8);
        
        // Animate backdrop fade in to full opacity
        this.tweens.add({
            targets: this.lockerBackdrop,
            alpha: 0.95,
            duration: 300,
            ease: 'Power2'
        });
        
        // Animate panel fade in and scale up to full opacity
        this.tweens.add({
            targets: this.lockerPanel,
            alpha: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Title
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const level = XP_SYSTEM.calculateLevel(progress.xp);
        this.lockerTitle = this.add.text(400, 80, `${playerId.toUpperCase()} LOCKER`, {
            fontSize: '24px',
            fill: playerId === 'player1' ? '#00ff00' : '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        
        // XP and Level info
        this.lockerXPInfo = this.add.text(400, 110, `Level ${level} • ${progress.xp} XP`, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 4 }
        }).setOrigin(0.5);
        
        // Close button
        this.lockerCloseBtn = this.add.rectangle(650, 80, 60, 30, 0x660000, 0.8);
        this.lockerCloseBtn.setInteractive();
        this.lockerCloseBtn.on('pointerdown', () => this.closeLocker());
        this.lockerCloseText = this.add.text(650, 80, 'CLOSE', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add hover effects to close button
        this.lockerCloseBtn.on('pointerover', () => {
            this.lockerCloseBtn.setFillStyle(0x880000, 0.9);
            this.lockerCloseText.setStyle({ fill: '#ffdddd' });
        });
        this.lockerCloseBtn.on('pointerout', () => {
            this.lockerCloseBtn.setFillStyle(0x660000, 0.8);
            this.lockerCloseText.setStyle({ fill: '#ffffff' });
        });
        
        // Create character skin grids
        this.createLockerContent(playerId);
        
        // Store locker elements for cleanup
        this.lockerElements = [
            this.lockerBackdrop,
            this.lockerPanel,
            this.lockerTitle,
            this.lockerXPInfo,
            this.lockerCloseBtn,
            this.lockerCloseText
        ];
    }
    
    createLockerContent(playerId) {
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const unlockedSkins = XP_SYSTEM.getUnlockedSkins(progress.xp);
        
        // Grid settings
        const startX = 150;
        const startY = 160;
        const charSpacing = 90;
        const skinSpacing = 50;
        
        this.lockerCharElements = [];
        
        // Add large dark background for entire locker content area
        const contentBackground = this.add.rectangle(400, 280, 650, 400, 0x0f0f0f, 0.98);
        contentBackground.setStrokeStyle(2, 0x333333);
        this.lockerCharElements.push(contentBackground);
        
        this.characterKeys.forEach((charKey, charIndex) => {
            const character = CHARACTERS[charKey];
            const charX = startX + (charIndex * charSpacing);
            
            // Character name
            const charName = this.add.text(charX, startY - 20, character.name, {
                fontSize: '12px',
                fill: '#ffffff',
                backgroundColor: '#222222',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);
            
            this.lockerCharElements.push(charName);
            
            // Skin options for this character
            const allSkins = CharacterSpriteHelper.getAllSkinTypes();
            allSkins.forEach((skinType, skinIndex) => {
                const skinY = startY + (skinIndex * skinSpacing);
                const isUnlocked = unlockedSkins.includes(skinType);
                const isEquipped = progress.equippedSkins[charKey] === skinType;
                
                // Add dark background for each skin preview area
                const skinBg = this.add.rectangle(charX, skinY, 70, 40, 0x222222, 0.95);
                if (isEquipped) {
                    skinBg.setStrokeStyle(3, 0x00ff00); // Green border for equipped
                } else if (isUnlocked) {
                    skinBg.setStrokeStyle(2, 0x888888); // Gray border for unlocked
                } else {
                    skinBg.setStrokeStyle(1, 0x555555); // Dark border for locked
                }
                this.lockerCharElements.push(skinBg);
                
                // Create skin preview
                const skinPreview = this.createSkinPreview(charX, skinY, charKey, skinType, isUnlocked, isEquipped);
                this.lockerCharElements.push(skinPreview);
                
                // Skin name and status
                const skinName = this.add.text(charX + 25, skinY - 10, CharacterSpriteHelper.getSkinDisplayName(skinType), {
                    fontSize: '10px',
                    fill: isUnlocked ? '#ffffff' : '#666666',
                    backgroundColor: '#000000',
                    padding: { x: 3, y: 1 }
                }).setOrigin(0, 0.5);
                
                this.lockerCharElements.push(skinName);
                
                // Status indicator
                let statusText = '';
                let statusColor = '#cccccc';
                
                if (isEquipped) {
                    statusText = 'EQUIPPED';
                    statusColor = '#00ff00';
                } else if (isUnlocked) {
                    statusText = 'UNLOCKED';
                    statusColor = '#ffffff';
                } else {
                    const requiredXP = XP_SYSTEM.XP_THRESHOLDS[Object.keys(XP_SYSTEM.SKIN_TYPES).find(k => XP_SYSTEM.SKIN_TYPES[k] === skinType) - 1];
                    statusText = `${requiredXP} XP`;
                    statusColor = '#ff6666';
                }
                
                const statusLabel = this.add.text(charX + 25, skinY + 10, statusText, {
                    fontSize: '8px',
                    fill: statusColor,
                    backgroundColor: '#000000',
                    padding: { x: 2, y: 1 }
                }).setOrigin(0, 0.5);
                
                this.lockerCharElements.push(statusLabel);
                
                // Add click handler for unlocked skins
                if (isUnlocked) {
                    skinPreview.setInteractive();
                    skinPreview.on('pointerdown', () => {
                        this.equipSkin(playerId, charKey, skinType);
                    });
                }
            });
        });
    }
    
    createSkinPreview(x, y, charKey, skinType, isUnlocked, isEquipped) {
        const character = CHARACTERS[charKey];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        let preview;
        
        // Create character preview using the loaded sprite
        if (this.textures.exists(`${charKey}_preview`)) {
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                preview = this.add.image(x, y, `${charKey}_preview`);
                preview.setScale(0.8).setOrigin(0.5).setFrame(0);
            } else {
                preview = this.add.image(x, y, `${charKey}_preview`);
                preview.setScale(1.2).setOrigin(0.5);
            }
        } else {
            // Fallback to colored rectangle
            preview = this.add.rectangle(x, y, 20, 20, character.color, 0.8);
        }
        
        // Apply skin tint and states
        if (isUnlocked) {
            if (skinType !== 'base') {
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(skinType);
                preview.setTint(skinColor);
            }
            preview.setAlpha(1.0);
        } else {
            preview.setTint(0x333333);
            preview.setAlpha(0.4);
        }
        
        // Add visual feedback for equipped skin
        if (isEquipped) {
            // Add pulsing animation to equipped skin
            this.tweens.add({
                targets: preview,
                alpha: { from: 1, to: 0.6 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Make it interactive if unlocked
        if (isUnlocked) {
            preview.setInteractive();
            preview.on('pointerdown', () => {
                this.equipSkin(this.currentLockerPlayer, charKey, skinType);
                this.closeLocker();
            });
            
            preview.on('pointerover', () => {
                preview.setScale(preview.scaleX * 1.1, preview.scaleY * 1.1);
            });
            
            preview.on('pointerout', () => {
                preview.setScale(preview.scaleX / 1.1, preview.scaleY / 1.1);
            });
        }
        
        return preview;
    }
    
    equipSkin(playerId, charKey, skinType) {
        const success = PLAYER_PROGRESS.equipSkin(playerId, charKey, skinType);
        
        if (success) {
            console.log(`${playerId} equipped ${skinType} skin for ${charKey}`);
            
            // Update local progress
            if (playerId === 'player1') {
                player1Progress = PLAYER_PROGRESS.loadPlayerProgress('player1');
            } else {
                player2Progress = PLAYER_PROGRESS.loadPlayerProgress('player2');
            }
            
            // Close and reopen locker to refresh display
            this.closeLocker();
            this.openLocker(playerId);
            
            // Update the character selection display
            this.updateCharacterSelectionDisplay();
        }
    }
    
    updateCharacterSelectionDisplay() {
        // Update the character previews in the selection screen with equipped skins
        this.player1Grid.forEach((display, index) => {
            const charKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', charKey);
            
            // Update skin text
            display.skinText.setText(CharacterSpriteHelper.getSkinDisplayName(equippedSkin));
            display.skinText.setStyle({ fill: CharacterSpriteHelper.getSkinRarityColor(equippedSkin) });
            
            // Update sprite tint
            display.sprite.clearTint();
            if (equippedSkin !== 'base') {
                display.sprite.setTint(CharacterSpriteHelper.getSkinRarityColor(equippedSkin));
            }
        });
        
        this.player2Grid.forEach((display, index) => {
            const charKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', charKey);
            
            // Update skin text
            display.skinText.setText(CharacterSpriteHelper.getSkinDisplayName(equippedSkin));
            display.skinText.setStyle({ fill: CharacterSpriteHelper.getSkinRarityColor(equippedSkin) });
            
            // Update sprite tint
            display.sprite.clearTint();
            if (equippedSkin !== 'base') {
                display.sprite.setTint(CharacterSpriteHelper.getSkinRarityColor(equippedSkin));
            }
        });
    }
    
    closeLocker() {
        if (!this.lockerOpen) return;
        
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        
        // Clean up locker elements
        if (this.lockerElements) {
            this.lockerElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.lockerElements = [];
        }
        
        // Clean up character elements
        if (this.lockerCharElements) {
            this.lockerCharElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.lockerCharElements = [];
        }
        
        // Clean up any other locker-related elements
        if (this.lockerBackdrop) this.lockerBackdrop.destroy();
        if (this.lockerPanel) this.lockerPanel.destroy();
        if (this.lockerTitle) this.lockerTitle.destroy();
        if (this.lockerXPInfo) this.lockerXPInfo.destroy();
        if (this.lockerCloseBtn) this.lockerCloseBtn.destroy();
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

            // Wait a moment then start map selection
            this.time.delayedCall(1500, () => {
                this.scene.start('MapSelectScene');
            });
        }
    }
}

// Map Selection Scene
class MapSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectScene' });
        this.selectedMapKey = 'nightcity'; // Default selection
    }

    preload() {
        // Load all map images for thumbnails
        this.load.image('nightcity', 'assets/Sprites/Backgrounds/nightcity.png');
        this.load.image('ch', 'assets/Sprites/Backgrounds/ch.png');
        this.load.image('skyline', 'assets/Sprites/Backgrounds/skyline.png');
        this.load.image('nature', 'assets/Sprites/Backgrounds/nature.png');
        this.load.image('nighttree', 'assets/Sprites/Backgrounds/nighttree.png');
        this.load.image('outsideworld', 'assets/Sprites/Backgrounds/outsideworld.png');
        
        console.log('MapSelectScene: Loading map images...');
    }

    create() {
        console.log('MapSelectScene: Creating map selection screen...');
        
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 50, '🗺️ MAP SELECTION 🗺️', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 100, 'Choose your battleground!', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Additional instruction for selection
        this.add.text(400, 130, 'Click on a map to select it', {
            fontSize: '16px',
            fill: '#cccccc',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Create map thumbnails
        this.createMapThumbnails();

        // Create selected map status
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'Night City' : 
                             this.selectedMapKey === 'ch' ? 'Ch' : 
                             this.selectedMapKey === 'skyline' ? 'Skyline' : 
                             this.selectedMapKey === 'nature' ? 'Nature' : 
                             this.selectedMapKey === 'nighttree' ? 'Night Tree' : 
                             this.selectedMapKey === 'outsideworld' ? 'Outside World' : this.selectedMapKey;
        this.selectedMapStatus = this.add.text(400, 380, `Selected: ${initialMapName}`, {
            fontSize: '18px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Create Start Match button
        this.createStartButton();
    }

    createMapThumbnails() {
        const mapConfigs = [
            // Top row
            {
                key: 'nightcity',
                name: 'Night City',
                x: 200,
                y: 160,
                description: 'Neon-lit cityscape under starry night sky'
            },
            {
                key: 'ch',
                name: 'Ch',
                x: 400,
                y: 160,
                description: 'Action-packed urban battlefield'
            },
            {
                key: 'skyline',
                name: 'Skyline',
                x: 600,
                y: 160,
                description: 'Urban skyline cityscape'
            },
            // Bottom row
            {
                key: 'nature',
                name: 'Nature',
                x: 200,
                y: 280,
                description: 'Natural outdoor environment'
            },
            {
                key: 'nighttree',
                name: 'Night Tree',
                x: 400,
                y: 280,
                description: 'Mysterious forest under moonlight'
            },
            {
                key: 'outsideworld',
                name: 'Outside World',
                x: 600,
                y: 280,
                description: 'Vast outdoor landscape'
            }
        ];

        this.mapThumbnails = [];

        mapConfigs.forEach(config => {
            // Create clickable background for better interaction (invisible)
            const clickArea = this.add.rectangle(config.x, config.y, 160, 110, 0x000000, 0);
            clickArea.setInteractive();

            // Create thumbnail image
            const thumbnail = this.add.image(config.x, config.y, config.key);
            thumbnail.setScale(0.20); // Smaller scale for 6-grid layout
            thumbnail.setOrigin(0.5);
            thumbnail.setInteractive();

            // Create selection border around image only (initially hidden)
            const border = this.add.rectangle(config.x, config.y, 115, 65, 0xff0000, 0);
            border.setStrokeStyle(3, 0xff0000);
            border.setVisible(false);

            // Map name
            const nameText = this.add.text(config.x, config.y + 80, config.name, {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);

            // Map description
            const descText = this.add.text(config.x, config.y + 110, config.description, {
                fontSize: '14px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 },
                wordWrap: { width: 180, useAdvancedWrap: true }
            }).setOrigin(0.5);

            // Click handlers for both thumbnail and click area
            const selectHandler = () => {
                console.log('Selected map:', config.key);
                this.selectMap(config.key);
            };

            thumbnail.on('pointerdown', selectHandler);
            clickArea.on('pointerdown', selectHandler);

            // Hover effects
            const hoverIn = () => {
                if (this.selectedMapKey !== config.key) {
                    thumbnail.setTint(0xcccccc);
                }
            };

            const hoverOut = () => {
                if (this.selectedMapKey !== config.key) {
                    thumbnail.clearTint();
                }
            };

            thumbnail.on('pointerover', hoverIn);
            thumbnail.on('pointerout', hoverOut);
            clickArea.on('pointerover', hoverIn);
            clickArea.on('pointerout', hoverOut);

            // Store references
            this.mapThumbnails.push({
                key: config.key,
                thumbnail,
                border,
                nameText,
                descText,
                clickArea
            });
        });

        // Select default map
        this.selectMap(this.selectedMapKey);
    }

    selectMap(mapKey) {
        this.selectedMapKey = mapKey;
        selectedMap = mapKey; // Update global variable

        console.log('Map selected:', mapKey);

        // Update visual selection
        this.mapThumbnails.forEach(mapData => {
            if (mapData.key === mapKey) {
                // Selected map styling
                mapData.border.setVisible(true);
                mapData.nameText.setStyle({ fill: '#ffffff' });
                mapData.thumbnail.clearTint();
            } else {
                // Unselected map styling
                mapData.border.setVisible(false);
                mapData.nameText.setStyle({ fill: '#ffffff' });
                mapData.thumbnail.clearTint();
            }
        });

        // Update start button text
        if (this.startButton) {
            const mapName = mapKey === 'nightcity' ? 'Night City' : 
                          mapKey === 'ch' ? 'Ch' : 
                          mapKey === 'skyline' ? 'Skyline' : 
                          mapKey === 'nature' ? 'Nature' : 
                          mapKey === 'nighttree' ? 'Night Tree' : 
                          mapKey === 'outsideworld' ? 'Outside World' : mapKey;
            this.startButton.setText(`Start Match on ${mapName}`);
        }

        // Update selected map status
        if (this.selectedMapStatus) {
            const mapName = mapKey === 'nightcity' ? 'Night City' : 
                          mapKey === 'ch' ? 'Ch' : 
                          mapKey === 'skyline' ? 'Skyline' : 
                          mapKey === 'nature' ? 'Nature' : 
                          mapKey === 'nighttree' ? 'Night Tree' : 
                          mapKey === 'outsideworld' ? 'Outside World' : mapKey;
            this.selectedMapStatus.setText(`Selected: ${mapName}`);
        }
    }

    createStartButton() {
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'Night City' : 
                             this.selectedMapKey === 'ch' ? 'Ch' : 
                             this.selectedMapKey === 'skyline' ? 'Skyline' : 
                             this.selectedMapKey === 'nature' ? 'Nature' : 
                             this.selectedMapKey === 'nighttree' ? 'Night Tree' : 
                             this.selectedMapKey === 'outsideworld' ? 'Outside World' : this.selectedMapKey;
        this.startButton = this.add.text(400, 420, `Start Match on ${initialMapName}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#228b22',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.startButton.setInteractive();

        this.startButton.on('pointerdown', () => {
            this.startMatch();
        });

        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ backgroundColor: '#32cd32' });
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ backgroundColor: '#228b22' });
        });
    }

    startMatch() {
        // Show loading message
        this.add.text(400, 520, 'Loading match...', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Start the game scene after a brief delay
        this.time.delayedCall(1000, () => {
            this.scene.start('GameScene');
        });
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load selected background
        this.load.image(selectedMap, `assets/Sprites/Backgrounds/${selectedMap}.png`);

        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Get equipped skins
        const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', selectedCharacters.player1);
        const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', selectedCharacters.player2);

        // Load Player 1 character sprites with equipped skin
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

        // Load Player 2 character sprites with equipped skin
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

        // Store equipped skins for create method
        this.p1EquippedSkin = p1EquippedSkin;
        this.p2EquippedSkin = p2EquippedSkin;
    
        // Load grass ground texture
        this.load.image('grass', 'assets/Sprites/Backgrounds/grass.png');
    
        // Load pixel art soccer ball sprite
        this.load.image('ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Load goal sprite
        this.load.image('goalPost', 'assets/Sprites/goals/Head Ball/Assets/Sprites/porta.png');
    }

    calculatePowerCooldown(playerId) {
        // Base cooldown is 15 seconds
        const baseCooldown = 15000;
        
        // Get the selected character for this player
        const selectedCharacter = playerId === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        
        // Get the equipped skin for this character
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const equippedSkin = progress.equippedSkins[selectedCharacter] || 'base';
        
        // Calculate cooldown reduction based on skin tier
        let cooldownReduction = 0;
        switch (equippedSkin) {
            case 'base':
                cooldownReduction = 0; // No reduction for base skin
                break;
            case 'bronze':
                cooldownReduction = 3000; // -3 seconds
                break;
            case 'silver':
                cooldownReduction = 6000; // -6 seconds
                break;
            case 'gold':
                cooldownReduction = 9000; // -9 seconds
                break;
            case 'shadow':
                cooldownReduction = 12000; // -12 seconds
                break;
            default:
                cooldownReduction = 0;
        }
        
        // Calculate final cooldown (minimum 1 second)
        const finalCooldown = Math.max(1000, baseCooldown - cooldownReduction);
        
        console.log(`🎮 ${playerId} Power Cooldown: ${finalCooldown/1000}s (${equippedSkin} skin: -${cooldownReduction/1000}s)`);
        
        return finalCooldown;
    }

    create() {
        // Add background first (behind everything)
        this.add.image(0, 0, selectedMap)
            .setOrigin(0)
            .setDepth(-1)
            .setScrollFactor(0)
            .setScale(1.39, 1.85); // All backgrounds are now 576x324, scale to fit 800x600

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
                cooldown: this.calculatePowerCooldown('player1'), // Dynamic cooldown based on skin
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
                cooldown: this.calculatePowerCooldown('player2'), // Dynamic cooldown based on skin
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                shieldActive: false
            }
        };
        
        // Initialize chaos manager
        const initialDelay = this.getRandomChaosDelay();
        this.chaosManager = {
            active: false,
            currentEvent: null,
            nextEventTime: Date.now() + initialDelay,
            eventDuration: 0,
            eventEndTime: 0,
            originalGravity: 300,
            originalPlayer1Speed: 160,
            originalPlayer2Speed: 160,
            meteors: [],
            clonedBall: null,
            eventBanner: null,
            originalPlayer1Scale: null,
            originalPlayer2Scale: null,
            screenFlipped: false,
            lastDebugTime: 0,
            darkOverlay: null,
            player1Light: null,
            player2Light: null,
            ballLight: null,
            originalPlayer1MaxVelocity: null,
            originalPlayer2MaxVelocity: null,
            originalBallMaxVelocity: null
        };
        
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
    
        // Create ground using grass texture
        const ground = this.add.image(400, 575, 'grass');
        ground.setOrigin(0.5, 0.5); // Center the image
        ground.setDisplaySize(800, 50); // Stretch to full screen width and maintain 50px height
        this.physics.add.existing(ground, true);
        
        // Create Player 1 with selected character sprite
        this.player1 = this.physics.add.sprite(200, 450, 'player1_idle');
        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player1.setMass(1);
        this.player1.setDrag(100);
        this.player1.setMaxVelocity(300, 800); // Adjusted for better gameplay feel
        
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
        
        // Apply Player 1 equipped skin tint
        if (this.p1EquippedSkin && this.p1EquippedSkin !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(this.p1EquippedSkin);
            this.player1.setTint(skinColor);
        }
        
        // Create Player 2 with selected character sprite
        this.player2 = this.physics.add.sprite(600, 450, 'player2_idle');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        this.player2.setMass(1);
        this.player2.setDrag(100);
        this.player2.setMaxVelocity(300, 800); // Adjusted for better gameplay feel
        
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
        
        // Apply Player 2 equipped skin tint
        if (this.p2EquippedSkin && this.p2EquippedSkin !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(this.p2EquippedSkin);
            this.player2.setTint(skinColor);
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

    getRandomChaosDelay() {
        // Random delay around 7 seconds (6000-8000ms)
        const delay = 6000 + Math.random() * 2000;
        return delay;
    }

    createUI() {
        // Create score display
        this.leftScoreText = this.add.text(100, 50, 'Player 1: 0', { 
            fontSize: '24px', 
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        this.rightScoreText = this.add.text(700, 50, 'Player 2: 0', { 
            fontSize: '24px', 
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0);

        // Create timer display
        this.timerText = this.add.text(400, 50, 'Time: 60', { 
            fontSize: '24px', 
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0);

        // Create connection status display
        this.connectionStatusText = this.add.text(400, 580, 'Socket: Connecting...', { 
            fontSize: '12px', 
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5, 1);

        // Create socket ID display
        this.socketText = this.add.text(10, 580, 'Socket ID: Not connected', { 
            fontSize: '12px', 
            fill: '#888888',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0, 1);

        // Create power status displays
        this.createPowerStatusUI();
    }

    createPowerStatusUI() {
        // Player 1 Power Status
        this.player1PowerText = this.add.text(100, 100, 'Power: Ready', { 
            fontSize: '14px', 
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });

        // Player 2 Power Status
        this.player2PowerText = this.add.text(700, 100, 'Power: Ready', { 
            fontSize: '14px', 
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
    }

    updatePowerStatusUI() {
        const currentTime = Date.now();
        
        // Update Player 1 power status
        if (this.powers.player1.ready) {
            this.player1PowerText.setText('Power: Ready [E]');
            this.player1PowerText.setStyle({ fill: '#00ff00' });
        } else {
            const timeLeft = Math.max(0, this.powers.player1.cooldown - (currentTime - this.powers.player1.lastUsed));
            this.player1PowerText.setText(`Power: ${(timeLeft/1000).toFixed(1)}s`);
            this.player1PowerText.setStyle({ fill: '#ff0000' });
        }
        
        // Update Player 2 power status
        if (this.powers.player2.ready) {
            this.player2PowerText.setText('Power: Ready [K]');
            this.player2PowerText.setStyle({ fill: '#0080ff' });
        } else {
            const timeLeft = Math.max(0, this.powers.player2.cooldown - (currentTime - this.powers.player2.lastUsed));
            this.player2PowerText.setText(`Power: ${(timeLeft/1000).toFixed(1)}s`);
            this.player2PowerText.setStyle({ fill: '#ff0000' });
        }
    }

    startMatchTimer() {
        this.matchTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.gameOver) return;
        
        this.matchTime--;
        this.timerText.setText(`Time: ${this.matchTime}`);
        
        if (this.matchTime <= 0) {
            this.handleTimeUp();
        }
    }

    handleTimeUp() {
        this.gameOver = true;
        
        // Determine winner based on score
        let winner;
        if (this.leftScore > this.rightScore) {
            winner = 'Player 1';
        } else if (this.rightScore > this.leftScore) {
            winner = 'Player 2';
        } else {
            winner = 'Draw';
        }
        
        this.handleGameOver(winner);
    }

    handleGoalScored(scorer) {
        if (this.gameOver) return;
        
        if (scorer === 'left') {
            this.leftScore++;
            this.leftScoreText.setText(`Player 1: ${this.leftScore}`);
            this.powers.player1.goals++;
        } else {
            this.rightScore++;
            this.rightScoreText.setText(`Player 2: ${this.rightScore}`);
            this.powers.player2.goals++;
        }
        
        // Reset ball position
        this.ball.setPosition(400, 450);
        this.ball.setVelocity(0, 0);
        
        // Check for game end (first to 3 goals or time up)
        if (this.leftScore >= 3 || this.rightScore >= 3) {
            this.handleGameOver(scorer === 'left' ? 'Player 1' : 'Player 2');
        }
    }

    handleGameOver(winner) {
        this.gameOver = true;
        
        // Award XP based on results
        let p1XP = 0;
        let p2XP = 0;
        
        if (winner === 'Player 1') {
            p1XP = 50; // Winner gets 50 XP
            p2XP = 25; // Loser gets 25 XP
        } else if (winner === 'Player 2') {
            p1XP = 25; // Loser gets 25 XP
            p2XP = 50; // Winner gets 50 XP
        } else {
            p1XP = 35; // Draw gives 35 XP each
            p2XP = 35;
        }
        
        // Add XP to player progress
        const p1Result = PLAYER_PROGRESS.addXP('player1', p1XP);
        const p2Result = PLAYER_PROGRESS.addXP('player2', p2XP);
        
        // Update session stats
        if (winner === 'Player 1') {
            SessionState.player1Wins++;
        } else if (winner === 'Player 2') {
            SessionState.player2Wins++;
        }
        SessionState.totalRoundsPlayed++;
        
        // Show XP gain screen
        this.showXPGainScreen(winner, p1Result, p2Result);
    }

    showXPGainScreen(winner, p1Result, p2Result) {
        // Create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Winner announcement
        const winnerText = winner === 'Draw' ? 'DRAW!' : `${winner} WINS!`;
        const winnerColor = winner === 'Player 1' ? '#00ff00' : winner === 'Player 2' ? '#0080ff' : '#ffff00';
        
        this.add.text(400, 150, winnerText, {
            fontSize: '48px',
            fill: winnerColor,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // Final score
        this.add.text(400, 220, `Final Score: ${this.leftScore} - ${this.rightScore}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // XP gains
        this.add.text(400, 280, 'XP GAINED:', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        
        // Player 1 XP
        const p1LevelText = p1Result.leveledUp ? ` (LEVEL UP! ${p1Result.oldLevel} → ${p1Result.newLevel})` : '';
        this.add.text(400, 320, `Player 1: +${p1Result.newXP - p1Result.oldXP} XP${p1LevelText}`, {
            fontSize: '16px',
            fill: p1Result.leveledUp ? '#00ff00' : '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Player 2 XP
        const p2LevelText = p2Result.leveledUp ? ` (LEVEL UP! ${p2Result.oldLevel} → ${p2Result.newLevel})` : '';
        this.add.text(400, 350, `Player 2: +${p2Result.newXP - p2Result.oldXP} XP${p2LevelText}`, {
            fontSize: '16px',
            fill: p2Result.leveledUp ? '#0080ff' : '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Session stats
        this.add.text(400, 400, `Session Stats: ${SessionState.player1Wins}-${SessionState.player2Wins} (${SessionState.totalRoundsPlayed} rounds)`, {
            fontSize: '14px',
            fill: '#cccccc',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        
        // Fight Now button
        const fightBtn = this.add.text(300, 480, '🔥 Fight Now [F]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#cc3300',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // Continue button (moved slightly right)
        const continueBtn = this.add.text(500, 480, 'Continue [SPACE]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#228b22',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // Add space key listener
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('CharacterSelectionScene');
        });
        
        // Add F key listener for fight mode
        this.input.keyboard.once('keydown-F', () => {
            this.scene.start('FightScene');
        });
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
        
        // Calculate kick velocity based on player input and position
        let kickVelocityX = correctDirection * 200;
        let kickVelocityY = -150;
        
        // Add player momentum
        if (Math.abs(playerVelocityX) > 10) {
            kickVelocityX += playerVelocityX * 0.5;
        }
        
        // Stronger kick if player is moving toward ball
        if ((correctDirection > 0 && playerVelocityX > 0) || (correctDirection < 0 && playerVelocityX < 0)) {
            kickVelocityX *= 1.5;
            kickVelocityY = -200;
        }
        
        ball.setVelocity(kickVelocityX, kickVelocityY);
    }

    isPlayerPowerActive(playerKey) {
        const power = this.powers[playerKey];
        const currentTime = Date.now();
        
        // Check if any power effects are currently active
        return power.immune || power.shieldActive || power.frozen || 
               (power.immuneUntil && currentTime < power.immuneUntil) ||
               (power.frozenUntil && currentTime < power.frozenUntil);
    }

    handlePlayerPlayerCollision(player1, player2) {
        // Simple bounce effect
        const pushForce = 50;
        if (player1.x < player2.x) {
            player1.setVelocityX(-pushForce);
            player2.setVelocityX(pushForce);
        } else {
            player1.setVelocityX(pushForce);
            player2.setVelocityX(-pushForce);
        }
    }

    update() {
        if (this.gameOver) return;
        
        // Update power system
        this.updatePowerSystem();
        
        // Update chaos events
        this.updateChaosManager();
        
        // Calculate movement speeds based on chaos events
        let horizontalSpeed = 160;
        let jumpSpeed = 330;
        let airMovementSpeed = 100; // Normal mode: allow air control at reduced speed
        
        if (this.chaosManager.currentEvent === 'zero_gravity') {
            horizontalSpeed = 100; // Slower horizontal movement for slow motion
            jumpSpeed = 200; // Slower jumps for slow motion
            airMovementSpeed = 80; // Slower air movement
        }
        
        // Player 1 controls (WASD) - check if frozen
        if (!this.powers.player1.frozen) {
            if (this.wasd.A.isDown) {
                if (this.player1.body.touching.down) {
                    this.player1.setVelocityX(-horizontalSpeed);
                    this.player1.play('player1_walk_anim', true);
                } else if (airMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player1.setVelocityX(-airMovementSpeed);
                }
                this.player1.setFlipX(true); // Face left
            } else if (this.wasd.D.isDown) {
                if (this.player1.body.touching.down) {
                    this.player1.setVelocityX(horizontalSpeed);
                    this.player1.play('player1_walk_anim', true);
                } else if (airMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player1.setVelocityX(airMovementSpeed);
                }
                this.player1.setFlipX(false); // Face right
            } else {
                this.player1.setVelocityX(0);
                if (this.player1.body.touching.down) {
                    this.player1.play('player1_idle_anim', true);
                }
            }
            
            if (this.wasd.W.isDown && this.player1.body.touching.down) {
                this.player1.setVelocityY(-jumpSpeed);
            }
        }
        
        // Player 2 controls (Arrow Keys) - check if frozen
        if (!this.powers.player2.frozen) {
            if (this.cursors.left.isDown) {
                if (this.player2.body.touching.down) {
                    this.player2.setVelocityX(-horizontalSpeed);
                    this.player2.play('player2_walk_anim', true);
                } else if (airMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player2.setVelocityX(-airMovementSpeed);
                }
                this.player2.setFlipX(true); // Face left
            } else if (this.cursors.right.isDown) {
                if (this.player2.body.touching.down) {
                    this.player2.setVelocityX(horizontalSpeed);
                    this.player2.play('player2_walk_anim', true);
                } else if (airMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player2.setVelocityX(airMovementSpeed);
                }
                this.player2.setFlipX(false); // Face right
            } else {
                this.player2.setVelocityX(0);
                if (this.player2.body.touching.down) {
                    this.player2.play('player2_idle_anim', true);
                }
            }
            
            if (this.cursors.up.isDown && this.player2.body.touching.down) {
                this.player2.setVelocityY(-jumpSpeed);
            }
        }
        
        // Power activation
        if (this.powerKeys.E.isDown) {
            this.activatePower('player1');
        }
        
        if (this.powerKeys.K.isDown) {
            this.activatePower('player2');
        }
        
        // Update UI
        this.updatePowerStatusUI();
        
        // Apply chaos effects
        this.applyChaosEffects();
        
        // Ball safety check - prevent ball from getting trapped between players
        this.preventBallSqueezing();
    }

    updatePowerSystem() {
        const currentTime = Date.now();
        
        // Update Player 1 power
        if (!this.powers.player1.ready) {
            if (currentTime - this.powers.player1.lastUsed >= this.powers.player1.cooldown) {
                this.powers.player1.ready = true;
            }
        }
        
        // Update Player 2 power
        if (!this.powers.player2.ready) {
            if (currentTime - this.powers.player2.lastUsed >= this.powers.player2.cooldown) {
                this.powers.player2.ready = true;
            }
        }
    }

    activatePower(player) {
        if (!this.powers[player].ready) return;
        
        // Mark power as used
        this.powers[player].ready = false;
        this.powers[player].lastUsed = Date.now();
        
        // Recalculate cooldown based on current equipped skin
        this.powers[player].cooldown = this.calculatePowerCooldown(player);
        
        // Get selected character for this player
        const characterKey = player === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        const character = CHARACTERS[characterKey];
        const playerSprite = player === 'player1' ? this.player1 : this.player2;
        
        // Apply character-specific power
        this.applyCharacterPower(player, character, playerSprite);
    }

    applyCharacterPower(player, character, playerSprite) {
        // Get opponent for power interactions
        const opponent = player === 'player1' ? this.player2 : this.player1;
        
        // Character-specific powers based on character name
        switch (character.name.toLowerCase()) {
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
        // Create fire start effect
        this.createBlazeStartEffect(player);
        
        // Launch player upward with flame effect
        player.setVelocityY(-400);
        player.setTint(0xff4500);
        
        // Create fire loop effect that follows player
        this.createBlazeLoopEffect(player);
        
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
        
        // Clear player tint and create end effect
        this.time.delayedCall(800, () => {
            player.clearTint();
            this.createBlazeEndEffect(player);
        });
    }

    createBlazeStartEffect(player) {
        // Create start fire effect - explosive burst
        const startEffect = this.add.graphics();
        startEffect.setDepth(5);
        startEffect.x = player.x;
        startEffect.y = player.y;
        
        // Create flame particles
        const flames = [];
        for (let i = 0; i < 8; i++) {
            const flame = this.add.circle(player.x, player.y, 6, 0xff4500);
            flame.setDepth(5);
            flame.setAlpha(0.8);
            
            // Random spread pattern
            const angle = (i * Math.PI * 2) / 8;
            const radius = 20 + Math.random() * 15;
            
            // Animate flame burst
            this.tweens.add({
                targets: flame,
                x: player.x + Math.cos(angle) * radius,
                y: player.y + Math.sin(angle) * radius,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 400,
                ease: 'Power2',
                onComplete: () => flame.destroy()
            });
            
            flames.push(flame);
        }
        
        // Central burst effect
        const centerFlame = this.add.circle(player.x, player.y, 15, 0xff4500);
        centerFlame.setDepth(5);
        centerFlame.setAlpha(0.9);
        
        this.tweens.add({
            targets: centerFlame,
            scaleX: 2.0,
            scaleY: 2.0,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => centerFlame.destroy()
        });
        
        // Cleanup start effect
        this.time.delayedCall(500, () => {
            if (startEffect.active) startEffect.destroy();
        });
    }

    createBlazeLoopEffect(player) {
        // Create loop fire effect that follows player
        const loopFlames = [];
        
        // Create multiple flame particles that orbit around player
        for (let i = 0; i < 6; i++) {
            const flame = this.add.circle(player.x, player.y, 4, 0xff4500);
            flame.setDepth(5);
            flame.setAlpha(0.7);
            
            // Store reference to player for following
            flame.blazePlayer = player;
            flame.blazeAngle = (i * Math.PI * 2) / 6;
            flame.blazeRadius = 25;
            
            loopFlames.push(flame);
        }
        
        // Update loop flames to follow player with orbital motion
        const loopTimer = this.time.addEvent({
            delay: 32, // ~30 FPS
            repeat: 24, // 0.8 seconds
            callback: () => {
                loopFlames.forEach((flame, index) => {
                    if (flame.active && flame.blazePlayer) {
                        // Orbital motion around player
                        flame.blazeAngle += 0.2;
                        const x = flame.blazePlayer.x + Math.cos(flame.blazeAngle) * flame.blazeRadius;
                        const y = flame.blazePlayer.y + Math.sin(flame.blazeAngle) * flame.blazeRadius;
                        
                        flame.setPosition(x, y);
                        
                        // Flickering effect
                        flame.setAlpha(0.5 + Math.random() * 0.3);
                    }
                });
            }
        });
        
        // Cleanup loop effect
        this.time.delayedCall(800, () => {
            loopFlames.forEach(flame => {
                if (flame.active) flame.destroy();
            });
            loopTimer.remove();
        });
    }

    createBlazeEndEffect(player) {
        // Create end fire effect - smaller burst
        const endFlames = [];
        
        for (let i = 0; i < 4; i++) {
            const flame = this.add.circle(player.x, player.y, 4, 0xff4500);
            flame.setDepth(5);
            flame.setAlpha(0.6);
            
            // Random upward motion
            const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/4;
            const speed = 20 + Math.random() * 10;
            
            this.tweens.add({
                targets: flame,
                x: player.x + Math.cos(angle) * speed,
                y: player.y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => flame.destroy()
            });
            
            endFlames.push(flame);
        }
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
        
        // Clear tint after dash
        this.time.delayedCall(500, () => {
            player.clearTint();
        });
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
            player.clearTint();
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

    updateChaosManager() {
        if (this.gameOver) return;
        
        try {
            const currentTime = Date.now();
            
            // Check if current event should end
            if (this.chaosManager.active && currentTime >= this.chaosManager.eventEndTime) {
                this.endChaosEvent();
            }
            
            // Check if it's time for next event (only if no event is active)
            if (!this.chaosManager.active && currentTime >= this.chaosManager.nextEventTime) {
                this.startRandomChaosEvent();
            }
            
            // Update meteors if active
            if (this.chaosManager.currentEvent === 'meteor_drop' && this.chaosManager.meteors.length > 0) {
                this.updateMeteors();
            }
            
            // Update darkroom lights if active
            if (this.chaosManager.currentEvent === 'darkroom' && this.chaosManager.darkOverlay) {
                this.updateDarkroomLights();
            }
        } catch (error) {
            console.error('🌪️ Error in chaos manager:', error);
        }
    }

    startRandomChaosEvent() {
        if (this.chaosManager.active) return;
        
        const events = ['zero_gravity', 'flip_screen', 'speed_boost', 'meteor_drop', 'ball_clone', 'big_head', 'darkroom'];
        const eventType = events[Math.floor(Math.random() * events.length)];
        
        this.chaosManager.active = true;
        this.chaosManager.currentEvent = eventType;
        this.chaosManager.eventDuration = 8000 + Math.random() * 4000; // 8-12 seconds
        this.chaosManager.eventEndTime = Date.now() + this.chaosManager.eventDuration;
        
        // Store original values
        this.chaosManager.originalPlayer1Scale = { x: this.player1.scaleX, y: this.player1.scaleY };
        this.chaosManager.originalPlayer2Scale = { x: this.player2.scaleX, y: this.player2.scaleY };
        
        console.log(`🌪️ Chaos Event Started: ${eventType.toUpperCase()} (${this.chaosManager.eventDuration/1000}s)`);
        
        // Show event banner
        this.showEventBanner(eventType);
        
        // Execute specific event
        switch (eventType) {
            case 'zero_gravity':
                this.startZeroGravityEvent();
                break;
            case 'flip_screen':
                this.startFlipScreenEvent();
                break;
            case 'speed_boost':
                this.startSpeedBoostEvent();
                break;
            case 'meteor_drop':
                this.startMeteorDropEvent();
                break;
            case 'ball_clone':
                this.startBallCloneEvent();
                break;
            case 'big_head':
                this.startBigHeadEvent();
                break;
            case 'darkroom':
                this.startDarkroomEvent();
                break;
        }
    }

    showEventBanner(eventType) {
        const eventNames = {
            'zero_gravity': '🌀 ZERO GRAVITY!',
            'flip_screen': '🔄 FLIP SCREEN!',
            'speed_boost': '⚡ SPEED BOOST!',
            'meteor_drop': '☄️ METEOR DROP!',
            'ball_clone': '⚽ BALL CLONE!',
            'big_head': '🧠 BIG HEAD MODE!',
            'darkroom': '🌑 DARKROOM!'
        };
        
        const eventColors = {
            'zero_gravity': '#00bfff',
            'flip_screen': '#ff69b4',
            'speed_boost': '#ffff00',
            'meteor_drop': '#ff4500',
            'ball_clone': '#32cd32',
            'big_head': '#9370db',
            'darkroom': '#696969'
        };
        
        const bannerText = eventNames[eventType] || '🌪️ CHAOS EVENT!';
        const bannerColor = eventColors[eventType] || '#ff0000';
        
        // Create banner
        this.chaosManager.eventBanner = this.add.text(400, 200, bannerText, {
            fontSize: '32px',
            fill: bannerColor,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // Animate banner entrance
        this.tweens.add({
            targets: this.chaosManager.eventBanner,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            ease: 'Bounce.easeOut',
            yoyo: true,
            repeat: 1
        });
        
        // Auto-remove banner after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.chaosManager.eventBanner) {
                this.chaosManager.eventBanner.destroy();
                this.chaosManager.eventBanner = null;
            }
        });
    }

    startZeroGravityEvent() {
        console.log('🌀 Zero Gravity Event: Slow motion physics');
        
        // Store original values for restoration
        this.chaosManager.originalGravity = this.physics.world.gravity.y;
        this.chaosManager.originalPlayer1MaxVelocity = this.player1.body.maxVelocity.y;
        this.chaosManager.originalPlayer2MaxVelocity = this.player2.body.maxVelocity.y;
        this.chaosManager.originalBallMaxVelocity = this.ball.body.maxVelocity.y;
        this.chaosManager.originalPlayer1Drag = this.player1.body.drag.x;
        this.chaosManager.originalPlayer2Drag = this.player2.body.drag.x;
        this.chaosManager.originalBallDrag = this.ball.body.drag.x;
        this.chaosManager.originalPlayer1DragY = this.player1.body.drag.y;
        this.chaosManager.originalPlayer2DragY = this.player2.body.drag.y;
        this.chaosManager.originalBallDragY = this.ball.body.drag.y;
        
        // Reduce gravity for slow motion effect
        this.physics.world.gravity.y = 150; // Slower falling, like slow motion
        
        // Slow down all movement for slow motion effect
        this.player1.body.setMaxVelocity(180, 250); // Slower but not too slow
        this.player2.body.setMaxVelocity(180, 250); // Slower but not too slow
        this.ball.body.setMaxVelocity(220, 300); // Slower ball movement
        
        // Keep normal drag - we want slow motion, not floating
        // No drag changes needed for slow motion
    }
    
    endZeroGravityEvent() {
        // Restore original gravity
        this.physics.world.gravity.y = this.chaosManager.originalGravity;
        
        // Restore original max velocities
        this.player1.body.setMaxVelocity(300, this.chaosManager.originalPlayer1MaxVelocity);
        this.player2.body.setMaxVelocity(300, this.chaosManager.originalPlayer2MaxVelocity);
        this.ball.body.setMaxVelocity(350, this.chaosManager.originalBallMaxVelocity);
        
        // Restore original drag values (both X and Y) - only if they were changed
        if (this.chaosManager.originalPlayer1DragY !== undefined) {
            this.player1.body.setDrag(this.chaosManager.originalPlayer1Drag, this.chaosManager.originalPlayer1DragY);
            this.player2.body.setDrag(this.chaosManager.originalPlayer2Drag, this.chaosManager.originalPlayer2DragY);
            this.ball.body.setDrag(this.chaosManager.originalBallDrag, this.chaosManager.originalBallDragY);
        } else {
            // Fallback to just X drag if Y drag wasn't stored
            this.player1.body.setDrag(this.chaosManager.originalPlayer1Drag);
            this.player2.body.setDrag(this.chaosManager.originalPlayer2Drag);
            this.ball.body.setDrag(this.chaosManager.originalBallDrag);
        }
    }
    
    startFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Flipping camera horizontally');
        this.cameras.main.setRotation(Math.PI); // Rotate 180 degrees (upside down)
        this.chaosManager.screenFlipped = true;
    }
    
    endFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Restoring camera orientation');
        this.cameras.main.setRotation(0); // Restore normal orientation
        this.chaosManager.screenFlipped = false;
    }
    
    startSpeedBoostEvent() {
        console.log('⚡ Speed Boost Event: Doubling player speeds');
        // Speed boost will be applied in applyChaosEffects
    }
    
    startMeteorDropEvent() {
        console.log('☄️ Meteor Drop Event: Spawning meteors');
        this.chaosManager.meteors = [];
        
        // Create meteors periodically
        const meteorTimer = this.time.addEvent({
            delay: 800,
            callback: () => this.spawnMeteor(),
            repeat: -1
        });
        
        // Store timer for cleanup
        this.chaosManager.meteorTimer = meteorTimer;
    }
    
    spawnMeteor() {
        const meteor = this.add.circle(Math.random() * 800, -50, 8, 0xff4500);
        this.physics.add.existing(meteor);
        
        meteor.body.setVelocity(
            -50 + Math.random() * 100, // Random horizontal velocity
            150 + Math.random() * 100   // Downward velocity
        );
        meteor.body.setBounce(0.8, 0.6);
        meteor.body.setCollideWorldBounds(true);
        
        // Add collision with players - now with stun functionality
        this.physics.add.collider(meteor, this.player1, (meteor, player) => {
            // Apply knockback
            player.setVelocity(
                (player.x - meteor.x) * 2, // Knock away from meteor
                -200 // Upward knock
            );
            
            // Stun effect
            this.powers.player1.frozen = true;
            this.powers.player1.frozenUntil = Date.now() + 1000; // 1 second stun
            player.setTint(0xff4500);
            
            // Clear stun
            this.time.delayedCall(1000, () => {
                this.powers.player1.frozen = false;
                player.clearTint();
            });
            
            meteor.destroy();
        });
        
        this.physics.add.collider(meteor, this.player2, (meteor, player) => {
            // Apply knockback
            player.setVelocity(
                (player.x - meteor.x) * 2, // Knock away from meteor
                -200 // Upward knock
            );
            
            // Stun effect
            this.powers.player2.frozen = true;
            this.powers.player2.frozenUntil = Date.now() + 1000; // 1 second stun
            player.setTint(0xff4500);
            
            // Clear stun
            this.time.delayedCall(1000, () => {
                this.powers.player2.frozen = false;
                player.clearTint();
            });
            
            meteor.destroy();
        });
        
        this.chaosManager.meteors.push(meteor);
        
        // Auto-destroy meteor after 8 seconds
        this.time.delayedCall(8000, () => {
            if (meteor.active) meteor.destroy();
        });
    }
    
    startBallCloneEvent() {
        // Create cloned ball
        this.chaosManager.clonedBall = this.physics.add.sprite(300, 450, 'ball');
        this.chaosManager.clonedBall.setScale(0.5);
        this.chaosManager.clonedBall.setOrigin(0.5, 1);
        this.chaosManager.clonedBall.setBounce(0.6);
        this.chaosManager.clonedBall.setCollideWorldBounds(true);
        this.chaosManager.clonedBall.setDrag(100);
        this.chaosManager.clonedBall.setMass(0.5);
        this.chaosManager.clonedBall.setMaxVelocity(350, 500);
        this.chaosManager.clonedBall.setTint(0x00ff00); // Green tint to distinguish
        
        // Add physics collisions for cloned ball
        this.physics.add.collider(this.chaosManager.clonedBall, this.player1, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.chaosManager.clonedBall, this.player2, this.handlePlayerBallCollision, null, this);
        
        // Add ground collision - find ground body from existing static bodies
        const groundBody = this.physics.world.staticBodies.entries.find(body => body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'grass');
        if (groundBody) {
            this.physics.add.collider(this.chaosManager.clonedBall, groundBody.gameObject);
        }
        
        // Add goal detection for cloned ball
        this.physics.add.overlap(this.chaosManager.clonedBall, this.leftGoal, () => this.handleGoalScored('right'));
        this.physics.add.overlap(this.chaosManager.clonedBall, this.rightGoal, () => this.handleGoalScored('left'));
    }
    
    startBigHeadEvent() {
        console.log('🧠 Big Head Event: Scaling up player heads');
        // Scale up both players
        this.player1.setScale(this.player1.scaleX * 1.5, this.player1.scaleY * 1.5);
        this.player2.setScale(this.player2.scaleX * 1.5, this.player2.scaleY * 1.5);
    }
    
    startDarkroomEvent() {
        console.log('🌑 Darkroom Event: Creating dark overlay with lights');
        
        // Create dark overlay
        this.chaosManager.darkOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);
        this.chaosManager.darkOverlay.setDepth(10);
        
        // Create light circles around players and ball
        this.chaosManager.player1Light = this.add.circle(this.player1.x, this.player1.y, 80, 0xffffff, 0.3);
        this.chaosManager.player1Light.setDepth(11);
        this.chaosManager.player1Light.setBlendMode(Phaser.BlendModes.ADD);
        
        this.chaosManager.player2Light = this.add.circle(this.player2.x, this.player2.y, 80, 0xffffff, 0.3);
        this.chaosManager.player2Light.setDepth(11);
        this.chaosManager.player2Light.setBlendMode(Phaser.BlendModes.ADD);
        
        this.chaosManager.ballLight = this.add.circle(this.ball.x, this.ball.y, 60, 0xffffff, 0.3);
        this.chaosManager.ballLight.setDepth(11);
        this.chaosManager.ballLight.setBlendMode(Phaser.BlendModes.ADD);
    }
    
    updateMeteors() {
        // Clean up destroyed meteors
        this.chaosManager.meteors = this.chaosManager.meteors.filter(meteor => meteor.active);
    }
    
    updateDarkroomLights() {
        // Update light positions to follow players and ball
        if (this.chaosManager.player1Light) {
            this.chaosManager.player1Light.x = this.player1.x;
            this.chaosManager.player1Light.y = this.player1.y;
        }
        
        if (this.chaosManager.player2Light) {
            this.chaosManager.player2Light.x = this.player2.x;
            this.chaosManager.player2Light.y = this.player2.y;
        }
        
        if (this.chaosManager.ballLight) {
            this.chaosManager.ballLight.x = this.ball.x;
            this.chaosManager.ballLight.y = this.ball.y;
        }
    }

    endChaosEvent() {
        if (!this.chaosManager.active) return;
        
        const eventType = this.chaosManager.currentEvent;
        console.log(`🌪️ Chaos Event Ended: ${eventType.toUpperCase()}`);
        
        // Clean up event-specific effects
        switch (eventType) {
            case 'zero_gravity':
                this.physics.world.gravity.y = this.chaosManager.originalGravity;
                this.endZeroGravityEvent();
                break;
            case 'flip_screen':
                this.endFlipScreenEvent();
                break;
            case 'speed_boost':
                // Speed boost effects are handled in applyChaosEffects
                break;
            case 'meteor_drop':
                // Clean up meteors
                this.chaosManager.meteors.forEach(meteor => {
                    if (meteor && meteor.active) meteor.destroy();
                });
                this.chaosManager.meteors = [];
                
                // Clean up meteor timer
                if (this.chaosManager.meteorTimer) {
                    this.chaosManager.meteorTimer.destroy();
                    this.chaosManager.meteorTimer = null;
                }
                break;
            case 'ball_clone':
                if (this.chaosManager.clonedBall) {
                    this.chaosManager.clonedBall.destroy();
                    this.chaosManager.clonedBall = null;
                }
                break;
            case 'big_head':
                // Restore original player scales
                this.player1.setScale(this.chaosManager.originalPlayer1Scale.x, this.chaosManager.originalPlayer1Scale.y);
                this.player2.setScale(this.chaosManager.originalPlayer2Scale.x, this.chaosManager.originalPlayer2Scale.y);
                break;
            case 'darkroom':
                if (this.chaosManager.darkOverlay) this.chaosManager.darkOverlay.destroy();
                if (this.chaosManager.player1Light) this.chaosManager.player1Light.destroy();
                if (this.chaosManager.player2Light) this.chaosManager.player2Light.destroy();
                if (this.chaosManager.ballLight) this.chaosManager.ballLight.destroy();
                break;
        }
        
        // Reset chaos manager
        this.chaosManager.active = false;
        this.chaosManager.currentEvent = null;
        this.chaosManager.nextEventTime = Date.now() + this.getRandomChaosDelay();
        
        if (this.chaosManager.eventBanner) {
            this.chaosManager.eventBanner.destroy();
            this.chaosManager.eventBanner = null;
        }
    }

    applyChaosEffects() {
        if (!this.chaosManager.active) return;
        
        const eventType = this.chaosManager.currentEvent;
        
        switch (eventType) {
            case 'speed_boost':
                // Double movement speed during speed boost
                if (this.wasd.A.isDown || this.wasd.D.isDown) {
                    this.player1.body.velocity.x *= 2;
                }
                if (this.cursors.left.isDown || this.cursors.right.isDown) {
                    this.player2.body.velocity.x *= 2;
                }
                break;
            case 'darkroom':
                // Update light positions - handled in updateDarkroomLights
                break;
            case 'flip_screen':
                // Screen flip effects are handled by camera rotation
                break;
            case 'zero_gravity':
                // Gravity effects are handled by physics world gravity
                break;
            case 'meteor_drop':
                // Meteor effects are handled by individual meteor objects
                break;
            case 'ball_clone':
                // Ball clone effects are handled by cloned ball object
                break;
            case 'big_head':
                // Big head effects are handled by scale changes
                break;
        }
    }

    preventBallSqueezing() {
        const p1ToBall = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, this.ball.x, this.ball.y);
        const p2ToBall = Phaser.Math.Distance.Between(this.player2.x, this.player2.y, this.ball.x, this.ball.y);
        const p1ToP2 = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, this.player2.x, this.player2.y);
        
        // If ball is too close to both players, give it a slight push
        if (p1ToBall < 40 && p2ToBall < 40 && p1ToP2 < 80) {
            this.ball.setVelocityY(-100);
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

// Fight Scene
class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
        this.gameOver = false;
        this.player1HP = 3;
        this.player2HP = 3;
        this.blastCooldown = 3000; // 3 seconds
        this.player1BlastReady = true;
        this.player2BlastReady = true;
        this.player1LastBlast = 0;
        this.player2LastBlast = 0;
    }

    preload() {
        // Load selected background (same as soccer match)
        this.load.image(selectedMap, `assets/Sprites/Backgrounds/${selectedMap}.png`);

        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Load Player 1 character sprites
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        if (p1SpriteConfig) {
            if (p1SpriteConfig.type === 'sprite_sheet') {
                this.load.spritesheet('player1_idle', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player1_walk', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                this.load.image('player1_idle', p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file);
                this.load.image('player1_walk', p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file);
            }
        }

        // Load Player 2 character sprites
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        if (p2SpriteConfig) {
            if (p2SpriteConfig.type === 'sprite_sheet') {
                this.load.spritesheet('player2_idle', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player2_walk', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                this.load.image('player2_idle', p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file);
                this.load.image('player2_walk', p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file);
            }
        }

        // Load ground texture
        this.load.image('grass', 'assets/Sprites/Backgrounds/grass.png');
        
        // Load blast effect sprites for each character
        this.loadBlastEffects();
    }

    loadBlastEffects() {
        // Load sprite sheets with proper frame data for animations
        
        // Blaze → Fire sprite sheet with 8 frames (128x128 each) - using FireFreePack
        this.load.spritesheet('fire_blast', 
            'assets/Sprites/Powers/Blaze/FireFreePack/No_compressed/128/Fire_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Volt → Lightning sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('lightning_blast', 
            'assets/Sprites/Powers/Volt/LightningFreePack/128/Lightning_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Whirlwind → Energy sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('energy_blast', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Frostbite → Keep individual ice sprites (smaller size)
        this.load.image('ice_blast', 'assets/Sprites/Powers/Frostbite/ice_shard/I5050-1.png');
        
        // Brick → Smoke sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('smoke_blast', 
            'assets/Sprites/Powers/Brick/SmokeFreePack_v2/NoCompressed/128/Smoke_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Jellyhead → Energy sprite sheet variant with 8 frames (128x128 each)
        this.load.spritesheet('jelly_blast', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_2_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
    }

    create() {
        // Add background
        this.add.image(0, 0, selectedMap)
            .setOrigin(0)
            .setDepth(-1)
            .setScrollFactor(0)
            .setScale(1.39, 1.85);

        // Create ground
        const ground = this.add.image(400, 575, 'grass');
        ground.setOrigin(0.5, 0.5);
        ground.setDisplaySize(800, 50);
        this.physics.add.existing(ground, true);

        // Get selected characters and their sprite configs
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);

        // Create players
        this.player1 = this.physics.add.sprite(200, 450, 'player1_idle');
        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player1.setMass(1);
        this.player1.setDrag(100);
        this.player1.setMaxVelocity(300, 800);

        this.player2 = this.physics.add.sprite(600, 450, 'player2_idle');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        this.player2.setMass(1);
        this.player2.setDrag(100);
        this.player2.setMaxVelocity(300, 800);

        // Set player scales and collision bodies
        this.setupPlayerSprite(this.player1, p1SpriteConfig);
        this.setupPlayerSprite(this.player2, p2SpriteConfig);

        // Apply equipped skin tints
        const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', selectedCharacters.player1);
        const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', selectedCharacters.player2);
        
        if (p1EquippedSkin !== 'base') {
            this.player1.setTint(CharacterSpriteHelper.getSkinRarityColor(p1EquippedSkin));
        }
        if (p2EquippedSkin !== 'base') {
            this.player2.setTint(CharacterSpriteHelper.getSkinRarityColor(p2EquippedSkin));
        }

        // Create animations
        this.createPlayerAnimations(p1SpriteConfig, p2SpriteConfig);

        // Start with idle animations
        this.player1.play('player1_idle_anim');
        this.player2.play('player2_idle_anim');

        // Physics collisions
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.player1, this.player2, this.handlePlayerCollision, null, this);

        // Create controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.blastKeys = this.input.keyboard.addKeys('E,K');

        // Create UI
        this.createFightUI();
        
        // Create blast animations
        this.createBlastAnimations();
    }

    setupPlayerSprite(player, spriteConfig) {
        if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
            player.setScale(2.0);
            player.setOrigin(0.5, 1);
            player.body.setSize(24, 30);
            player.body.setOffset(4, 2);
        } else {
            player.setScale(3.0);
            player.setOrigin(0.5, 1);
            player.body.setSize(16, 16);
            player.body.setOffset(0, 0);
        }
    }

    createPlayerAnimations(p1SpriteConfig, p2SpriteConfig) {
        // Create Player 1 animations
        if (p1SpriteConfig.type === 'sprite_sheet') {
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
        }

        // Create Player 2 animations
        if (p2SpriteConfig.type === 'sprite_sheet') {
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
        }
    }

    createFightUI() {
        // Title
        this.add.text(400, 30, '⚔️ FIGHT MODE ⚔️', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Player 1 HP Hearts
        this.player1Hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(50 + (i * 40), 80, '❤️', {
                fontSize: '24px'
            });
            this.player1Hearts.push(heart);
        }

        // Player 2 HP Hearts
        this.player2Hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(710 - (i * 40), 80, '❤️', {
                fontSize: '24px'
            });
            this.player2Hearts.push(heart);
        }

        // Player names
        this.add.text(50, 110, `Player 1: ${CHARACTERS[selectedCharacters.player1].name}`, {
            fontSize: '16px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });

        this.add.text(750, 110, `Player 2: ${CHARACTERS[selectedCharacters.player2].name}`, {
            fontSize: '16px',
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);

        // Blast cooldown displays
        this.player1BlastText = this.add.text(50, 140, 'Blast: Ready [E]', {
            fontSize: '14px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });

        this.player2BlastText = this.add.text(750, 140, 'Blast: Ready [K]', {
            fontSize: '14px',
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
    }

    createBlastAnimations() {
        // Create animations for sprite sheet-based powers
        
        // Fire blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'blaze_blast_anim',
            frames: this.anims.generateFrameNumbers('fire_blast', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // Lightning blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'volt_blast_anim',
            frames: this.anims.generateFrameNumbers('lightning_blast', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1
        });

        // Energy blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'whirlwind_blast_anim',
            frames: this.anims.generateFrameNumbers('energy_blast', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Smoke blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'brick_blast_anim',
            frames: this.anims.generateFrameNumbers('smoke_blast', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        // Jelly blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'jellyhead_blast_anim',
            frames: this.anims.generateFrameNumbers('jelly_blast', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });
    }

    handlePlayerCollision(player1, player2) {
        // Simple knockback effect
        const pushForce = 100;
        if (player1.x < player2.x) {
            player1.setVelocityX(-pushForce);
            player2.setVelocityX(pushForce);
        } else {
            player1.setVelocityX(pushForce);
            player2.setVelocityX(-pushForce);
        }
    }

    update() {
        if (this.gameOver) return;

        // Update blast cooldowns
        this.updateBlastCooldowns();

        // Player 1 movement (WASD)
        if (this.wasd.A.isDown) {
            this.player1.setVelocityX(-160);
            this.player1.setFlipX(true);
            if (this.player1.body.touching.down) {
                this.player1.play('player1_walk_anim', true);
            }
        } else if (this.wasd.D.isDown) {
            this.player1.setVelocityX(160);
            this.player1.setFlipX(false);
            if (this.player1.body.touching.down) {
                this.player1.play('player1_walk_anim', true);
            }
        } else {
            this.player1.setVelocityX(0);
            if (this.player1.body.touching.down) {
                this.player1.play('player1_idle_anim', true);
            }
        }

        if (this.wasd.W.isDown && this.player1.body.touching.down) {
            this.player1.setVelocityY(-330);
        }

        // Player 2 movement (Arrow keys)
        if (this.cursors.left.isDown) {
            this.player2.setVelocityX(-160);
            this.player2.setFlipX(true);
            if (this.player2.body.touching.down) {
                this.player2.play('player2_walk_anim', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player2.setVelocityX(160);
            this.player2.setFlipX(false);
            if (this.player2.body.touching.down) {
                this.player2.play('player2_walk_anim', true);
            }
        } else {
            this.player2.setVelocityX(0);
            if (this.player2.body.touching.down) {
                this.player2.play('player2_idle_anim', true);
            }
        }

        if (this.cursors.up.isDown && this.player2.body.touching.down) {
            this.player2.setVelocityY(-330);
        }

        // Blast attacks
        if (this.blastKeys.E.isDown && this.player1BlastReady) {
            this.fireBlast('player1');
        }

        if (this.blastKeys.K.isDown && this.player2BlastReady) {
            this.fireBlast('player2');
        }
    }

    updateBlastCooldowns() {
        const currentTime = Date.now();

        // Update Player 1 blast cooldown
        if (!this.player1BlastReady) {
            const timeLeft = Math.max(0, this.blastCooldown - (currentTime - this.player1LastBlast));
            if (timeLeft <= 0) {
                this.player1BlastReady = true;
                this.player1BlastText.setText('Blast: Ready [E]');
                this.player1BlastText.setStyle({ fill: '#00ff00' });
            } else {
                this.player1BlastText.setText(`Blast: ${(timeLeft/1000).toFixed(1)}s`);
                this.player1BlastText.setStyle({ fill: '#ff0000' });
            }
        }

        // Update Player 2 blast cooldown
        if (!this.player2BlastReady) {
            const timeLeft = Math.max(0, this.blastCooldown - (currentTime - this.player2LastBlast));
            if (timeLeft <= 0) {
                this.player2BlastReady = true;
                this.player2BlastText.setText('Blast: Ready [K]');
                this.player2BlastText.setStyle({ fill: '#0080ff' });
            } else {
                this.player2BlastText.setText(`Blast: ${(timeLeft/1000).toFixed(1)}s`);
                this.player2BlastText.setStyle({ fill: '#ff0000' });
            }
        }
    }

    fireBlast(player) {
        const isPlayer1 = player === 'player1';
        const playerSprite = isPlayer1 ? this.player1 : this.player2;
        const opponent = isPlayer1 ? this.player2 : this.player1;
        const characterKey = isPlayer1 ? selectedCharacters.player1 : selectedCharacters.player2;

        // Set blast on cooldown
        if (isPlayer1) {
            this.player1BlastReady = false;
            this.player1LastBlast = Date.now();
        } else {
            this.player2BlastReady = false;
            this.player2LastBlast = Date.now();
        }

        // Create blast projectile
        this.createBlastProjectile(playerSprite, opponent, characterKey, isPlayer1);
    }

    createBlastProjectile(player, opponent, characterKey, isPlayer1) {
        const direction = player.flipX ? -1 : 1;
        const startX = player.x + (direction * 40);
        const startY = player.y - 30;

        // Create projectile based on character type
        const blastTexture = this.getBlastTexture(characterKey);
        let blast;
        
        // Create sprite or animated sprite based on character
        if (characterKey === 'frostbite') {
            // Frostbite uses static ice sprite (very small)
            blast = this.add.image(startX, startY, blastTexture);
            blast.setScale(0.3);
        } else {
            // Other characters use animated sprites - make them bigger
            blast = this.add.sprite(startX, startY, blastTexture);
            
            // Set scale based on character for better visibility
            if (characterKey === 'brick') {
                blast.setScale(1.1); // Make Brick's smoke blast bigger for visibility
            } else {
                blast.setScale(0.9); // Normal size for other animated sprites
            }
            
            // Play the appropriate animation
            const animKey = `${characterKey}_blast_anim`;
            blast.play(animKey);
        }
        
        // Add physics
        this.physics.add.existing(blast);
        
        // Set collision body for dodging - slightly smaller than visual
        blast.body.setSize(blast.width * 0.7, blast.height * 0.7);

        // Set projectile velocity - faster and more direct
        blast.body.setVelocity(direction * 500, -60);
        blast.body.setGravityY(120);

        // Add slight rotation for dynamics
        blast.setRotation(direction > 0 ? 0.2 : -0.2);

        // Improved collision detection - only hits if actually touching
        const collider = this.physics.add.overlap(blast, opponent, () => {
            this.handleBlastHit(opponent, isPlayer1);
            this.createBlastImpactEffect(blast.x, blast.y, characterKey);
            blast.destroy();
        });

        // Auto-destroy after 2.5 seconds
        this.time.delayedCall(2500, () => {
            if (blast.active) {
                this.createBlastImpactEffect(blast.x, blast.y, characterKey);
                blast.destroy();
            }
        });

        // Add simple launch effect
        this.createSimpleLaunchEffect(player, characterKey);
    }

    getBlastTexture(characterKey) {
        const textureMap = {
            'blaze': 'fire_blast',
            'volt': 'lightning_blast',
            'whirlwind': 'energy_blast',
            'frostbite': 'ice_blast',
            'brick': 'smoke_blast',
            'jellyhead': 'jelly_blast'
        };
        return textureMap[characterKey] || 'energy_blast';
    }

    createSimpleLaunchEffect(player, characterKey) {
        // Create simple launch effect for smaller projectiles
        const effectColor = CHARACTERS[characterKey].color;
        
        // Create a simple burst effect around the player
        for (let i = 0; i < 6; i++) {
            const particle = this.add.circle(player.x, player.y - 15, 4, effectColor);
            particle.setAlpha(0.8);
            particle.setDepth(10);
            
            const angle = (i * Math.PI * 2) / 6;
            const speed = 40 + Math.random() * 20;
            
            this.tweens.add({
                targets: particle,
                x: player.x + Math.cos(angle) * speed,
                y: player.y - 15 + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }



    createBlastImpactEffect(x, y, characterKey) {
        // Create simple impact effect for smaller projectiles
        const effectColor = CHARACTERS[characterKey].color;
        
        // Light screen shake for impact
        this.cameras.main.shake(100, 0.01);
        
        // Create simple impact particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, effectColor);
            particle.setAlpha(0.9);
            particle.setDepth(15);
            
            const angle = (i * Math.PI * 2) / 8;
            const speed = 30 + Math.random() * 20;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }



    handleBlastHit(opponent, attackerIsPlayer1) {
        const isOpponentPlayer1 = opponent === this.player1;
        
        // Deal damage
        if (isOpponentPlayer1) {
            this.player1HP--;
            this.updateHeartsDisplay();
        } else {
            this.player2HP--;
            this.updateHeartsDisplay();
        }

        // Apply knockback
        const knockbackForce = attackerIsPlayer1 ? 300 : -300;
        opponent.setVelocity(knockbackForce, -200);

        // Visual feedback
        opponent.setTint(0xff0000);
        this.cameras.main.shake(200, 0.02);
        
        this.time.delayedCall(300, () => {
            // Restore original tint
            const opponentKey = isOpponentPlayer1 ? selectedCharacters.player1 : selectedCharacters.player2;
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin(
                isOpponentPlayer1 ? 'player1' : 'player2', 
                opponentKey
            );
            
            if (equippedSkin !== 'base') {
                opponent.setTint(CharacterSpriteHelper.getSkinRarityColor(equippedSkin));
            } else {
                opponent.clearTint();
            }
        });

        // Check for fight end
        if (this.player1HP <= 0 || this.player2HP <= 0) {
            this.handleFightEnd();
        }
    }

    updateHeartsDisplay() {
        // Update Player 1 hearts
        for (let i = 0; i < 3; i++) {
            if (i < this.player1HP) {
                this.player1Hearts[i].setText('❤️');
            } else {
                this.player1Hearts[i].setText('💔');
            }
        }

        // Update Player 2 hearts
        for (let i = 0; i < 3; i++) {
            if (i < this.player2HP) {
                this.player2Hearts[i].setText('❤️');
            } else {
                this.player2Hearts[i].setText('💔');
            }
        }
    }

    handleFightEnd() {
        this.gameOver = true;
        
        const winner = this.player1HP > 0 ? 'Player 1' : 'Player 2';
        
        // Create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Winner announcement
        this.add.text(400, 200, `${winner} Wins the Fight!`, {
            fontSize: '48px',
            fill: winner === 'Player 1' ? '#00ff00' : '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Restart fight button
        const restartBtn = this.add.text(300, 350, 'Restart Fight [R]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#228b22',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Character select button
        const selectBtn = this.add.text(500, 350, 'Character Select [C]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#4444aa',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Add key listeners
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });

        this.input.keyboard.once('keydown-C', () => {
            this.scene.start('CharacterSelectionScene');
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
    scene: [CharacterSelectionScene, MapSelectScene, GameScene, FightScene]
};

// Initialize the game
const game = new Phaser.Game(config); 
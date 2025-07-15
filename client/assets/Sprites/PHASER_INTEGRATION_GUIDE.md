# 🎮 SuperHead Showdown - Phaser Sprite Integration Guide

This guide shows you how to integrate the processed "big head" sprites into your Phaser game.

## 📋 Prerequisites

1. **First, run the head processing script:**
   ```bash
   cd client/assets/Sprites
   pip install pillow numpy
   python3 process_heads.py
   ```

2. **Include the character config in your HTML:**
   ```html
   <script src="assets/Sprites/characterConfig.js"></script>
   <script src="game.js"></script>
   ```

---

## 🔧 Basic Integration

### 1. Loading Sprite Sheets (Tiny Heroes)

```javascript
// In your Phaser Scene's preload() function
preload() {
    // Load character config
    const pinkMonster = CharacterSpriteHelper.getCharacterConfig('tinyHeroes', 'pinkMonster');
    
    // Load sprite sheets
    this.load.spritesheet('pinkMonster_idle', 
        pinkMonster.basePath + pinkMonster.animations.idle.file, 
        { frameWidth: 64, frameHeight: 64 } // Adjust based on your sprite dimensions
    );
    
    this.load.spritesheet('pinkMonster_walk', 
        pinkMonster.basePath + pinkMonster.animations.walk.file, 
        { frameWidth: 64, frameHeight: 64 }
    );
    
    this.load.spritesheet('pinkMonster_run', 
        pinkMonster.basePath + pinkMonster.animations.run.file, 
        { frameWidth: 64, frameHeight: 64 }
    );
}
```

### 2. Loading Single Frame Images (Mini Pixel Pack)

```javascript
preload() {
    const drscience = CharacterSpriteHelper.getCharacterConfig('miniPixelPack', 'drscience');
    
    // Load single frame images for idle and walk
    const idleAnim = drscience.animations.idle;
    const walkAnim = drscience.animations.walk;
    
    this.load.image('drscience_idle', drscience.basePath + idleAnim.file);
    this.load.image('drscience_walk', drscience.basePath + walkAnim.file);
}
```

---

## 🎯 Complete Character Class

Here's a complete character class that handles both sprite types:

```javascript
class SuperHeadCharacter {
    constructor(scene, x, y, category, characterId) {
        this.scene = scene;
        this.config = CharacterSpriteHelper.getCharacterConfig(category, characterId);
        this.category = category;
        this.characterId = characterId;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, this.getDefaultTexture());
        this.sprite.setCollideWorldBounds(true);
        
        // Load animations
        this.loadAnimations();
        
        // Start with default animation
        this.playAnimation(this.config.defaultAnimation);
    }
    
    getDefaultTexture() {
        if (this.config.type === 'sprite_sheet') {
            return `${this.characterId}_${this.config.defaultAnimation}`;
        } else {
            return `${this.characterId}_${this.config.defaultAnimation}_0`;
        }
    }
    
    loadAnimations() {
        Object.keys(this.config.animations).forEach(animName => {
            const anim = this.config.animations[animName];
            const key = `${this.characterId}_${animName}`;
            
            if (this.config.type === 'sprite_sheet') {
                // Sprite sheet animation
                this.scene.anims.create({
                    key: key,
                    frames: this.scene.anims.generateFrameNumbers(`${this.characterId}_${animName}`, {
                        start: 0,
                        end: anim.frames - 1
                    }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            } else {
                // Individual frame animation
                const frames = [];
                for (let i = 0; i < anim.frames; i++) {
                    frames.push({ key: `${this.characterId}_${animName}_${i}` });
                }
                
                this.scene.anims.create({
                    key: key,
                    frames: frames,
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            }
        });
    }
    
    playAnimation(animationName) {
        const key = `${this.characterId}_${animationName}`;
        if (this.scene.anims.exists(key)) {
            this.sprite.play(key);
        }
    }
    
    // Movement methods
    moveLeft() {
        this.sprite.setVelocityX(-160);
        this.playAnimation('walk');
    }
    
    moveRight() {
        this.sprite.setVelocityX(160);
        this.playAnimation('walk');
    }
    
    stop() {
        this.sprite.setVelocityX(0);
        this.playAnimation('idle');
    }
    
    jump() {
        if (this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-500);
            this.playAnimation('jump');
        }
    }
    
    attack() {
        this.playAnimation('attack1');
    }
}
```

---

## 🎨 Usage Examples

### 1. Simple Character Creation

```javascript
// In your scene's create() function
create() {
    // Create a Pink Monster
    this.player1 = new SuperHeadCharacter(this, 200, 400, 'tinyHeroes', 'pinkMonster');
    
    // Create a Mini Pixel Pack character
this.player2 = new SuperHeadCharacter(this, 600, 400, 'miniPixelPack', 'drscience');
}
```

### 2. Character Selection Integration

```javascript
// Update your existing character selection to use sprite characters
const SPRITE_CHARACTERS = {
    blaze: { category: 'tinyHeroes', id: 'pinkMonster' },
    frostbite: { category: 'tinyHeroes', id: 'pinkMonster' },
    volt: { category: 'tinyHeroes', id: 'owletMonster' },
    jellyhead: { category: 'miniPixelPack', id: 'drscience' },
    brick: { category: 'miniPixelPack', id: 'capp' },
    whirlwind: { category: 'miniPixelPack', id: 'tanker' }
};

// In your GameScene create() function
create() {
    // Get selected characters
    const p1Sprite = SPRITE_CHARACTERS[selectedCharacters.player1];
    const p2Sprite = SPRITE_CHARACTERS[selectedCharacters.player2];
    
    // Create sprite characters instead of colored rectangles
    this.player1 = new SuperHeadCharacter(this, 200, 450, p1Sprite.category, p1Sprite.id);
    this.player2 = new SuperHeadCharacter(this, 600, 450, p2Sprite.category, p2Sprite.id);
}
```

### 3. Advanced Asset Loading

```javascript
// Utility function to load all character assets
function loadAllCharacterAssets(scene) {
    // Load all Tiny Heroes
    const tinyHeroes = CharacterSpriteHelper.getCharactersByCategory('tinyHeroes');
    Object.keys(tinyHeroes).forEach(heroId => {
        const hero = tinyHeroes[heroId];
        Object.keys(hero.animations).forEach(animName => {
            const anim = hero.animations[animName];
            const key = `${heroId}_${animName}`;
            
            // Calculate frame dimensions (you may need to adjust these)
            const frameWidth = heroId === 'pinkMonster' ? 64 : 64;
            const frameHeight = heroId === 'pinkMonster' ? 64 : 64;
            
            scene.load.spritesheet(key, hero.basePath + anim.file, {
                frameWidth: frameWidth,
                frameHeight: frameHeight
            });
        });
    });
    
    // Load all Mini Pixel Pack characters
const miniPixelPack = CharacterSpriteHelper.getCharactersByCategory('miniPixelPack');
Object.keys(miniPixelPack).forEach(characterId => {
    const character = miniPixelPack[characterId];
    Object.keys(character.animations).forEach(animName => {
        const anim = character.animations[animName];
        
        const framePath = character.basePath + anim.file;
        scene.load.image(`${characterId}_${animName}`, framePath);
    });
});
}

// Use in your preload function
preload() {
    loadAllCharacterAssets(this);
}
```

---

## 🔄 Animation State Management

```javascript
class AnimationController {
    constructor(character) {
        this.character = character;
        this.currentState = 'idle';
        this.stateTimer = 0;
    }
    
    update(delta) {
        this.stateTimer += delta;
        
        // Handle animation state transitions
        switch (this.currentState) {
            case 'attack1':
                // Attack animation is temporary
                if (this.stateTimer > 500) { // 500ms attack duration
                    this.setState('idle');
                }
                break;
                
            case 'jump':
                // Switch to idle when landing
                if (this.character.sprite.body.touching.down) {
                    this.setState('idle');
                }
                break;
        }
    }
    
    setState(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.stateTimer = 0;
            this.character.playAnimation(newState);
        }
    }
}
```

---

## 🎲 Random Character Selection

```javascript
// Utility to get a random character
function getRandomCharacter() {
    const allIds = CharacterSpriteHelper.getAllCharacterIds();
    const randomIndex = Math.floor(Math.random() * allIds.length);
    return allIds[randomIndex];
}

// Use in your game
const randomChar = getRandomCharacter();
const player = new SuperHeadCharacter(scene, x, y, randomChar.category, randomChar.id);
```

---

## ⚙️ Configuration Tips

### Frame Size Detection
```javascript
// You may need to adjust frame sizes based on your processed sprites
const FRAME_SIZES = {
    'pinkMonster': { width: 64, height: 64 },
    'owletMonster': { width: 64, height: 64 },
    'dudeMonster': { width: 64, height: 64 },
    'drscience': { width: 32, height: 32 },
    'capp': { width: 32, height: 32 },
    'tanker': { width: 32, height: 32 }
};
```

### Performance Optimization
```javascript
// Only load animations you'll actually use
const ESSENTIAL_ANIMATIONS = ['idle', 'walk', 'jump', 'attack1'];

// Filter animations when loading
Object.keys(character.animations)
    .filter(animName => ESSENTIAL_ANIMATIONS.includes(animName))
    .forEach(animName => {
        // Load only essential animations
    });
```

---

## 🐛 Troubleshooting

### Common Issues:

1. **Sprites not loading:** Check file paths in `characterConfig.js`
2. **Animation not playing:** Verify frame counts match actual sprite sheets
3. **Sprites too small/large:** Adjust sprite scale: `sprite.setScale(2.0)`
4. **Frame timing issues:** Adjust `frameRate` in animation configs

### Debug Helper:
```javascript
// Add this to see what's loaded
console.log('Available characters:', CharacterSpriteHelper.getAllCharacterIds());
console.log('Pink Monster config:', CharacterSpriteHelper.getCharacterConfig('tinyHeroes', 'pinkMonster'));
```

---

## 🎉 You're Ready!

Your sprites are now organized and ready for use in SuperHead Showdown! The big head modifications will give your game that distinctive cartoon look while maintaining smooth animations.

**Next Steps:**
1. Run the processing script
2. Test with a simple character
3. Integrate with your existing character selection system
4. Add special effects and powers for each character type

Happy coding! 🚀 
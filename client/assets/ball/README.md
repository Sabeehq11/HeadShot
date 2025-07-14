# Soccer Ball Sprite Guide

## Current Setup
The game currently generates a placeholder soccer ball sprite programmatically using Phaser's graphics API. This creates a white circle with black pentagon shapes to simulate a soccer ball pattern.

## To Replace with Real Sprite

### 1. Find a Soccer Ball Sprite
- Visit [itch.io](https://itch.io) and search for "soccer ball sprite" or "football sprite"
- Look for game assets tagged as "sprites", "2D", or "game assets"
- Recommended size: 50x50 pixels (or larger - it will be scaled)
- Format: PNG with transparency preferred

### 2. Save the Sprite
- Download your chosen soccer ball sprite
- Save it as `ball.png` in this directory (`/client/assets/ball/`)
- The file should be exactly: `/client/assets/ball/ball.png`

### 3. Update the Game Code
Once you have a real sprite file, you need to update the `preload()` function in `/client/game.js`:

**Remove this section:**
```javascript
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
```

**Replace with:**
```javascript
// Load soccer ball sprite
this.load.image('ball', 'assets/ball/ball.png');
```

### 4. Recommended Sprite Specifications
- **Size**: 50x50 to 128x128 pixels
- **Format**: PNG with transparency
- **Style**: Top-down view or side view
- **Colors**: Traditional black and white soccer ball pattern, or stylized to match your game's art style

### 5. Free Resources
Some places to find free soccer ball sprites:
- [OpenGameArt.org](https://opengameart.org)
- [Kenney.nl](https://kenney.nl) (Game Assets)
- [itch.io](https://itch.io) (filter by "Free" and "Game Assets")

The current placeholder will work perfectly for development and testing! 
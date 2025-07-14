# Goal Post Sprite Guide

## Current Setup
The game currently uses simple white rectangles to represent goal posts:
- Left goal: White lines at x=10, covering y=300 to y=500
- Right goal: White lines at x=790, covering y=300 to y=500
- Goal detection zones: Invisible rectangles (20px wide, 200px tall)

## Goal Post Sprites to Find

### 1. Find Goal Post Sprites
Visit [itch.io](https://itch.io) and search for:
- "soccer goal sprites" or "football goal sprites" 
- "goal post game assets"
- "sports game sprites"

### 2. Recommended Sprite Specifications
- **Left Goal**: Should face right (opening toward center)
- **Right Goal**: Should face left (opening toward center)
- **Size**: 20px wide × 200px tall (or scalable)
- **Format**: PNG with transparency
- **Style**: Side view, fits your game's art style

### 3. Save the Sprites
Download your chosen goal post sprites and save them as:
- `/client/assets/goals/left_goal.png`
- `/client/assets/goals/right_goal.png`

## Code Changes to Add Real Sprites

### 1. Update the preload() function
**Replace this section:**
```javascript
// Create goal post placeholder graphics (will be invisible but can be replaced with sprites)
this.add.graphics()
    .fillStyle(0xff0000)
    .fillRect(0, 0, 20, 200)
    .generateTexture('goalPost', 20, 200);
```

**With:**
```javascript
// Load goal post sprites
this.load.image('leftGoal', 'assets/goals/left_goal.png');
this.load.image('rightGoal', 'assets/goals/right_goal.png');
```

### 2. Update the create() function
**Replace this section:**
```javascript
// Add visual goal post indicators (can be replaced with sprites later)
this.add.rectangle(10, 300, 15, 5, 0xffffff); // Left goal top
this.add.rectangle(10, 500, 15, 5, 0xffffff); // Left goal bottom
this.add.rectangle(10, 400, 5, 200, 0xffffff); // Left goal post

this.add.rectangle(790, 300, 15, 5, 0xffffff); // Right goal top
this.add.rectangle(790, 500, 15, 5, 0xffffff); // Right goal bottom
this.add.rectangle(790, 400, 5, 200, 0xffffff); // Right goal post
```

**With:**
```javascript
// Add goal post sprites
this.add.image(10, 400, 'leftGoal');
this.add.image(790, 400, 'rightGoal');
```

## Alternative: Single Goal Post Sprite

If you find a single goal post sprite, you can:

1. **Save as**: `/client/assets/goals/goal_post.png`

2. **Load in preload():**
```javascript
this.load.image('goalPost', 'assets/goals/goal_post.png');
```

3. **Add in create():**
```javascript
// Add goal posts (flip the right one)
this.add.image(10, 400, 'goalPost');
const rightGoalPost = this.add.image(790, 400, 'goalPost');
rightGoalPost.setFlipX(true); // Flip horizontally for right side
```

## Goal Detection Zones

The invisible goal detection zones will remain the same:
```javascript
leftGoal = this.add.rectangle(10, 400, 20, 200, 0xff0000, 0); // Invisible
rightGoal = this.add.rectangle(790, 400, 20, 200, 0xff0000, 0); // Invisible
```

These zones can be adjusted if needed:
- **Width**: Change the 3rd parameter (20) to make goals easier/harder to score
- **Height**: Change the 4th parameter (200) to adjust goal height
- **Position**: Change x,y coordinates to move goals

## Free Resources for Goal Post Sprites
- [OpenGameArt.org](https://opengameart.org)
- [Kenney.nl](https://kenney.nl) - Game Assets
- [itch.io](https://itch.io) - Filter by "Free" and "Game Assets"
- [Freepik](https://www.freepik.com) - Game sprites section

## Current System Works Great!
The current white rectangle system provides clear visual feedback and works perfectly for gameplay testing. You can continue developing other features and add professional sprites later! 
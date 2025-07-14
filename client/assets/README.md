# Timer Styling Guide

## Current Timer Setup
The match timer is currently displayed at the top center of the screen with:
- **Position**: x=400, y=60 (centered)
- **Format**: "1:00" (MM:SS)
- **Colors**: Yellow (#ffff00) → Orange (#ffa500) → Red (#ff0000) as time runs out
- **Font**: Default Phaser font, 28px
- **Background**: Simple black background with padding

## Custom Font Styling

### 1. Web Fonts (Google Fonts)
Add to your `index.html` `<head>` section:
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
```

Then update the timer text style in `create()`:
```javascript
timerText = this.add.text(400, 60, formatTime(matchTime), {
    fontSize: '32px',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '900',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
});
```

### 2. Game-Specific Fonts
Download game fonts from:
- [dafont.com](https://www.dafont.com) (Sports/LCD categories)
- [1001fonts.com](https://www.1001fonts.com)
- [Google Fonts](https://fonts.google.com) (Orbitron, Press Start 2P, Roboto Mono)

**Popular Game Timer Fonts:**
- **Orbitron**: Futuristic, sci-fi style
- **Press Start 2P**: Retro 8-bit style
- **Roboto Mono**: Clean monospace
- **Digital-7**: Classic digital clock style

### 3. Custom Font Implementation
1. Download font files (.ttf, .woff, .woff2)
2. Place in `/client/assets/fonts/`
3. Add to CSS:
```css
@font-face {
    font-family: 'CustomTimer';
    src: url('assets/fonts/timer-font.woff2') format('woff2');
}
```

## Background Banner Styling

### 1. Simple Banner Background
Replace the current black background with a styled banner:
```javascript
// Create timer banner background
const timerBanner = this.add.rectangle(400, 60, 200, 50, 0x1a1a1a);
timerBanner.setStrokeStyle(3, 0xffffff);

// Create timer text without background
timerText = this.add.text(400, 60, formatTime(matchTime), {
    fontSize: '32px',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '900',
    fill: '#ffff00'
});
```

### 2. Gradient Banner
```javascript
// Create gradient banner (requires graphics)
const bannerGraphics = this.add.graphics();
bannerGraphics.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x4a4a4a, 0x4a4a4a);
bannerGraphics.fillRect(300, 35, 200, 50);
```

### 3. Animated Background
```javascript
// Create pulsing background when time is low
if (matchTime <= 10) {
    this.tweens.add({
        targets: timerBanner,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}
```

## Advanced Timer Effects

### 1. Countdown Warning Effects
Update your `updateTimer()` function:
```javascript
function updateTimer() {
    if (gameOver) return;
    
    matchTime--;
    timerText.setText(formatTime(matchTime));
    
    // Color changes with effects
    if (matchTime <= 10) {
        timerText.setStyle({ 
            fill: '#ff0000',
            fontSize: '36px' // Larger when critical
        });
        
        // Add screen shake effect
        gameScene.cameras.main.shake(100, 0.01);
        
        // Add warning sound (if you have audio)
        // gameScene.sound.play('warningBeep');
        
    } else if (matchTime <= 30) {
        timerText.setStyle({ 
            fill: '#ffa500',
            fontSize: '32px'
        });
    }
    
    // Time up check
    if (matchTime <= 0) {
        handleTimeUp();
    }
}
```

### 2. Timer Icon/Symbol
Add a clock icon next to the timer:
```javascript
// Create clock icon (simple circle with lines)
const clockIcon = this.add.graphics();
clockIcon.lineStyle(2, 0xffffff);
clockIcon.strokeCircle(350, 60, 15);
clockIcon.lineTo(350, 60);
clockIcon.lineTo(350, 45); // Hour hand
clockIcon.lineTo(365, 60); // Minute hand
clockIcon.stroke();
```

### 3. Progress Bar Timer
Alternative visual representation:
```javascript
// Create timer progress bar
const timerBarBg = this.add.rectangle(400, 90, 200, 10, 0x444444);
const timerBarFill = this.add.rectangle(400, 90, 200, 10, 0x00ff00);

// Update in updateTimer()
const progress = matchTime / 60;
timerBarFill.scaleX = progress;
timerBarFill.fillColor = progress > 0.5 ? 0x00ff00 : progress > 0.25 ? 0xffff00 : 0xff0000;
```

## Complete Styled Timer Example

Here's a complete implementation with all enhancements:

```javascript
function createStyledTimer() {
    // Banner background
    const timerBanner = this.add.rectangle(400, 60, 220, 60, 0x1a1a1a);
    timerBanner.setStrokeStyle(3, 0xffffff);
    
    // Clock icon
    const clockIcon = this.add.graphics();
    clockIcon.lineStyle(2, 0xffffff);
    clockIcon.strokeCircle(330, 60, 12);
    clockIcon.lineTo(330, 60);
    clockIcon.lineTo(330, 48);
    clockIcon.lineTo(342, 60);
    clockIcon.stroke();
    
    // Styled timer text
    timerText = this.add.text(400, 60, formatTime(matchTime), {
        fontSize: '32px',
        fontFamily: 'Orbitron, monospace',
        fontWeight: '900',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
    });
    timerText.setOrigin(0.5, 0.5);
    
    // Timer label
    this.add.text(470, 60, 'TIME', {
        fontSize: '14px',
        fontFamily: 'Orbitron, monospace',
        fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
}
```

## Timer Sound Effects

### 1. Find Timer Sounds
- **Countdown beeps**: Every 5 seconds in final 30 seconds
- **Warning sounds**: Final 10 seconds
- **Time up sound**: When timer reaches 0

### 2. Implementation
```javascript
// In preload()
this.load.audio('timerBeep', 'assets/sounds/timer-beep.wav');
this.load.audio('timeWarning', 'assets/sounds/time-warning.wav');
this.load.audio('timeUp', 'assets/sounds/time-up.wav');

// In updateTimer()
if (matchTime <= 10) {
    this.sound.play('timerBeep');
} else if (matchTime === 0) {
    this.sound.play('timeUp');
}
```

The current simple timer works great for gameplay testing, but these enhancements will make it look and feel much more professional! 
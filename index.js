// ===========================================
// TURRET GAME PRACTICE CANVAS SETUP
// ===========================================

// GAME CONFIGURATION
// Change this value to scale the entire canvas and everything on it
const viewScale = 2; // Try values like 1, 1.5, 2, 2.5, 3, etc.

// Base canvas dimensions (logical resolution)
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// ===========================================
// CANVAS SETUP
// ===========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the actual canvas size based on scale
canvas.width = CANVAS_WIDTH * viewScale;
canvas.height = CANVAS_HEIGHT * viewScale;

// Scale the drawing context so everything draws at the scaled size
ctx.scale(viewScale, viewScale);

// Disable image smoothing for pixel-perfect sprites
ctx.imageSmoothingEnabled = false;

// Update the display info
document.getElementById('scaleDisplay').textContent = viewScale + 'x';
document.getElementById('sizeDisplay').textContent = canvas.width + 'x' + canvas.height;

// ===========================================
// GAME STATE
// ===========================================

let gameRunning = true;
let lastTime = 0;

// UI Controls
let showGrid = true;
let showCoordinates = false;

// Turret control variables
let Player1TurretAngle = 0; // Angle in degrees (0-360) - 90 = Up

// Turret angle limits
const TURRET_MIN_ANGLE = -90; // Minimum angle (left limit)
const TURRET_MAX_ANGLE = 0;  // Maximum angle (right limit)

// Example game objects (you can modify/remove these)
const gameObjects = {
    // Icicle object - centered on canvas
    icicle: {
        x: CANVAS_WIDTH/2 - 36,
        y: CANVAS_HEIGHT/2 - 22, // Starting position
        originalY: CANVAS_HEIGHT/2 - 34, // Remember original position
        fallDistance: 0, // How far it has fallen
        maxFallDistance: 122, // Maximum fall distance
        fallPerClick: 122/16, // Pixels to fall per click
        isAnimating: false,
        stillImage: 'Sorted Assets/sprites/Icicle Shake/1.svg'
    },
        
    // Monkey object - positioned somewhere else
    monkey: {
        x: -5, // Left side of canvas
        y: 292, // Near bottom
        originalX: -4,
        originalY: 292,
        isAnimating: false,
        stillImage: 'Sorted Assets/sprites/MonkeyIdle_Player1/1.svg' // Your still monkey image
    },
    
    // Turret object - with rotation capabilities
    turret: {
        x: 94, // Visual sprite position X
        y: 349, // Visual sprite position Y
        centerX: 101, // Rotation center = sprite position + offset to barrel
        centerY: 379, // Rotation center = sprite position + offset to barrel
        angle: 0, // Will be calculated
        isAnimating: false,
        stillImage: 'Sorted Assets/sprites/TurretExtension_Player1/1.svg'
    },
    
    // Snowpile object - starts with startup animation
    snowpile: {
        x: -32, // Position where you want the snowpile
        y: -42, // Adjust as needed
        currentFrame: 1, // Start at frame 1
        maxStartupFrame: 46, // Frames 1-46 for startup
        maxAddFrame: 92, // Maximum frame for add snow (up to frame 92)
        isStartupComplete: false,
        isAnimating: false, // Don't start animating immediately - wait for game to start
        stillImage: 'Sorted Assets/sprites/Snowpile_Player1/1.svg' // Start with frame 1
    },
    
    // AimGuide for Player 1 - mirrored and positioned on right side
    aimGuidePlayer1: {
        x: 98, // Left side of canvas (adjust as needed)
        y: 300, // Vertical position (adjust as needed)
        isVisible: true, // Whether to show the aim guide
        mirrored: true, // Should be horizontally flipped
        stillImage: 'Sorted Assets/sprites/AimGuide_Player2/1.svg'
    },
    
    // Aim Slider for Player 1
    aimSlider: {
        x: 167, // Match turret.x
        y: 370, // Match turret.y
        centerX: 100, // Match turret.centerX
        centerY: 379, // Match turret.centerY
        angle: 0,
        isActive: true,
        activeImage: 'Sorted Assets/sprites/AimSlider/1.svg',
        inactiveImage: 'Sorted Assets/sprites/AimSlider/2.svg'
    }
};

// ===========================================
// ANIMATION SYSTEM
// ===========================================

// Animation objects for triggered animations
const animations = {
    IcicleShakes: [],
    MonkeyAnimations: [],
    TurretFires: [],
    SnowpileStartups: [], // For the initial 1-46 frame animation
    SnowpileAdds: [], // For additional snow animations
};

// Animation templates - define your animations here
const animationTemplates = {
    IcicleShake: {
        frames: [
            'Sorted Assets/sprites/Icicle Shake/1.svg',
            'Sorted Assets/sprites/Icicle Shake/2.svg',
            'Sorted Assets/sprites/Icicle Shake/3.svg',
            'Sorted Assets/sprites/Icicle Shake/4.svg',
            'Sorted Assets/sprites/Icicle Shake/5.svg',
            'Sorted Assets/sprites/Icicle Shake/6.svg',
            'Sorted Assets/sprites/Icicle Shake/7.svg',
        ],
        frameTime: 100, // milliseconds per frame
        loop: false
    },

    // New monkey animation
    MonkeyAnimation: {
        frames: [
            'Sorted Assets/sprites/MonkeyIdle_Player1/1.svg',
            'Sorted Assets/sprites/MonkeyIdle_Player1/2.svg',
            'Sorted Assets/sprites/MonkeyIdle_Player1/3.svg',
            'Sorted Assets/sprites/MonkeyIdle_Player1/4.svg',
            // Add more frames as needed
        ],
        frameTime: 150, // Slightly slower animation
        loop: false // Or true if you want it to loop
    },
    
    // Turret firing animation
    TurretFire: {
        frames: [
            'Sorted Assets/sprites/TurretExtension_Player1/1.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/2.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/3.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/4.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/5.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/6.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/7.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/8.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/9.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/10.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/11.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/12.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/13.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/14.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/15.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/16.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/17.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/18.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/19.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/20.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/21.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/22.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/23.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/24.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/25.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/26.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/27.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/28.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/29.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/30.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/31.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/32.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/33.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/34.svg',
            'Sorted Assets/sprites/TurretExtension_Player1/35.svg'
        ],
        frameTime: 40,
        loop: false
    },
    
    // Snowpile startup animation (frames 1-46)
    SnowpileStartup: {
        frames: [
            'Sorted Assets/sprites/Snowpile_Player1/1.svg',
            'Sorted Assets/sprites/Snowpile_Player1/2.svg',
            'Sorted Assets/sprites/Snowpile_Player1/3.svg',
            'Sorted Assets/sprites/Snowpile_Player1/4.svg',
            'Sorted Assets/sprites/Snowpile_Player1/5.svg',
            'Sorted Assets/sprites/Snowpile_Player1/6.svg',
            'Sorted Assets/sprites/Snowpile_Player1/7.svg',
            'Sorted Assets/sprites/Snowpile_Player1/8.svg',
            'Sorted Assets/sprites/Snowpile_Player1/9.svg',
            'Sorted Assets/sprites/Snowpile_Player1/10.svg',
            'Sorted Assets/sprites/Snowpile_Player1/11.svg',
            'Sorted Assets/sprites/Snowpile_Player1/12.svg',
            'Sorted Assets/sprites/Snowpile_Player1/13.svg',
            'Sorted Assets/sprites/Snowpile_Player1/14.svg',
            'Sorted Assets/sprites/Snowpile_Player1/15.svg',
            'Sorted Assets/sprites/Snowpile_Player1/16.svg',
            'Sorted Assets/sprites/Snowpile_Player1/17.svg',
            'Sorted Assets/sprites/Snowpile_Player1/18.svg',
            'Sorted Assets/sprites/Snowpile_Player1/19.svg',
            'Sorted Assets/sprites/Snowpile_Player1/20.svg',
            'Sorted Assets/sprites/Snowpile_Player1/21.svg',
            'Sorted Assets/sprites/Snowpile_Player1/22.svg',
            'Sorted Assets/sprites/Snowpile_Player1/23.svg',
            'Sorted Assets/sprites/Snowpile_Player1/24.svg',
            'Sorted Assets/sprites/Snowpile_Player1/25.svg',
            'Sorted Assets/sprites/Snowpile_Player1/26.svg',
            'Sorted Assets/sprites/Snowpile_Player1/27.svg',
            'Sorted Assets/sprites/Snowpile_Player1/28.svg',
            'Sorted Assets/sprites/Snowpile_Player1/29.svg',
            'Sorted Assets/sprites/Snowpile_Player1/30.svg',
            'Sorted Assets/sprites/Snowpile_Player1/31.svg',
            'Sorted Assets/sprites/Snowpile_Player1/32.svg',
            'Sorted Assets/sprites/Snowpile_Player1/33.svg',
            'Sorted Assets/sprites/Snowpile_Player1/34.svg',
            'Sorted Assets/sprites/Snowpile_Player1/35.svg',
            'Sorted Assets/sprites/Snowpile_Player1/36.svg',
            'Sorted Assets/sprites/Snowpile_Player1/37.svg',
            'Sorted Assets/sprites/Snowpile_Player1/38.svg',
            'Sorted Assets/sprites/Snowpile_Player1/39.svg',
            'Sorted Assets/sprites/Snowpile_Player1/40.svg',
            'Sorted Assets/sprites/Snowpile_Player1/41.svg',
            'Sorted Assets/sprites/Snowpile_Player1/42.svg',
            'Sorted Assets/sprites/Snowpile_Player1/43.svg',
            'Sorted Assets/sprites/Snowpile_Player1/44.svg',
            'Sorted Assets/sprites/Snowpile_Player1/45.svg',
            'Sorted Assets/sprites/Snowpile_Player1/46.svg'
        ],
        frameTime: 60, // Adjust speed as needed
        loop: false
    },
    
    // Snowpile add snow animation (frames 47-92)
    SnowpileAdd: {
        frames: [
            'Sorted Assets/sprites/Snowpile_Player1/47.svg',
            'Sorted Assets/sprites/Snowpile_Player1/48.svg',
            'Sorted Assets/sprites/Snowpile_Player1/49.svg',
            'Sorted Assets/sprites/Snowpile_Player1/50.svg',
            'Sorted Assets/sprites/Snowpile_Player1/51.svg',
            'Sorted Assets/sprites/Snowpile_Player1/52.svg',
            'Sorted Assets/sprites/Snowpile_Player1/53.svg',
            'Sorted Assets/sprites/Snowpile_Player1/54.svg',
            'Sorted Assets/sprites/Snowpile_Player1/55.svg',
            'Sorted Assets/sprites/Snowpile_Player1/56.svg',
            'Sorted Assets/sprites/Snowpile_Player1/57.svg',
            'Sorted Assets/sprites/Snowpile_Player1/58.svg',
            'Sorted Assets/sprites/Snowpile_Player1/59.svg',
            'Sorted Assets/sprites/Snowpile_Player1/60.svg',
            'Sorted Assets/sprites/Snowpile_Player1/61.svg',
            'Sorted Assets/sprites/Snowpile_Player1/62.svg',
            'Sorted Assets/sprites/Snowpile_Player1/63.svg',
            'Sorted Assets/sprites/Snowpile_Player1/64.svg',
            'Sorted Assets/sprites/Snowpile_Player1/65.svg',
            'Sorted Assets/sprites/Snowpile_Player1/66.svg',
            'Sorted Assets/sprites/Snowpile_Player1/67.svg',
            'Sorted Assets/sprites/Snowpile_Player1/68.svg',
            'Sorted Assets/sprites/Snowpile_Player1/69.svg',
            'Sorted Assets/sprites/Snowpile_Player1/70.svg',
            'Sorted Assets/sprites/Snowpile_Player1/71.svg',
            'Sorted Assets/sprites/Snowpile_Player1/72.svg',
            'Sorted Assets/sprites/Snowpile_Player1/73.svg',
            'Sorted Assets/sprites/Snowpile_Player1/74.svg',
            'Sorted Assets/sprites/Snowpile_Player1/75.svg',
            'Sorted Assets/sprites/Snowpile_Player1/76.svg',
            'Sorted Assets/sprites/Snowpile_Player1/77.svg',
            'Sorted Assets/sprites/Snowpile_Player1/78.svg',
            'Sorted Assets/sprites/Snowpile_Player1/79.svg',
            'Sorted Assets/sprites/Snowpile_Player1/80.svg',
            'Sorted Assets/sprites/Snowpile_Player1/81.svg',
            'Sorted Assets/sprites/Snowpile_Player1/82.svg',
            'Sorted Assets/sprites/Snowpile_Player1/83.svg',
            'Sorted Assets/sprites/Snowpile_Player1/84.svg',
            'Sorted Assets/sprites/Snowpile_Player1/85.svg',
            'Sorted Assets/sprites/Snowpile_Player1/86.svg',
            'Sorted Assets/sprites/Snowpile_Player1/87.svg',
            'Sorted Assets/sprites/Snowpile_Player1/88.svg',
            'Sorted Assets/sprites/Snowpile_Player1/89.svg',
            'Sorted Assets/sprites/Snowpile_Player1/90.svg',
            'Sorted Assets/sprites/Snowpile_Player1/91.svg',
            'Sorted Assets/sprites/Snowpile_Player1/92.svg'
        ],
        frameTime: 100,
        loop: false
    }
};

// Function to create an animation instance
function createAnimation(templateName, x, y) {
    const template = animationTemplates[templateName];
    if (!template) return null;
    
    return {
        x: x,
        y: y,
        frames: template.frames,
        currentFrame: 0,
        frameTime: template.frameTime,
        timeSinceLastFrame: 0,
        loop: template.loop,
        finished: false
    };
}

// Function to trigger an animation at a specific location
function triggerAnimation(type, x, y) {
    const animation = createAnimation(type, x, y);
    if (animation) {
        animations[type + 's'].push(animation);
        
        // If it's an icicle shake, mark the icicle as animating
        if (type === 'IcicleShake') {
            gameObjects.icicle.isAnimating = true;
        }

        // If it's a monkey animation, mark the monkey as animating
        if (type === 'MonkeyAnimation') {
            gameObjects.monkey.isAnimating = true;
        }
        
        // If it's a turret fire, mark the turret as animating
        if (type === 'TurretFire') {
            gameObjects.turret.isAnimating = true;
        }
        
        // If it's a snowpile animation, mark the snowpile as animating
        if (type === 'SnowpileStartup' || type === 'SnowpileAdd') {
            gameObjects.snowpile.isAnimating = true;
        }
    }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Draw a rotated sprite around a center point with better loading handling
function drawRotatedSprite(imagePath, x, y, centerX, centerY, angleRadians) {
    if (isImageReady(imagePath)) {
        const img = imageCache[imagePath];
        ctx.save(); // Save current canvas state
        
        // Move to rotation center
        ctx.translate(centerX, centerY);
        
        // Rotate
        ctx.rotate(angleRadians);
        
        // Draw sprite offset from center
        ctx.drawImage(img, x - centerX, y - centerY);
        
        ctx.restore(); // Restore canvas state
    }
    // If image isn't loaded, we simply don't draw anything (no flash)
}

// Draw a mirrored sprite at given position with better loading handling
function drawMirroredSprite(imagePath, x, y, flipHorizontal = false, flipVertical = false, width = null, height = null) {
    if (isImageReady(imagePath)) {
        const img = imageCache[imagePath];
        ctx.save();
        
        if (flipHorizontal || flipVertical) {
            // Calculate sprite dimensions
            const spriteWidth = width || img.width;
            const spriteHeight = height || img.height;
            
            // Move to the center of where the sprite will be drawn
            ctx.translate(x + spriteWidth/2, y + spriteHeight/2);
            
            // Apply mirroring
            ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
            
            // Draw sprite centered on the transform origin
            if (width && height) {
                ctx.drawImage(img, -spriteWidth/2, -spriteHeight/2, spriteWidth, spriteHeight);
            } else {
                ctx.drawImage(img, -spriteWidth/2, -spriteHeight/2);
            }
        } else {
            // No mirroring, draw normally
            if (width && height) {
                ctx.drawImage(img, x, y, width, height);
            } else {
                ctx.drawImage(img, x, y);
            }
        }
        
        ctx.restore();
    }
    // If image isn't loaded, we simply don't draw anything (no flash)
}

// Enhanced image loading with progress tracking for SVGs
const imageCache = {};
const imageLoadStates = {}; // Track loading states
let totalSVGsToLoad = 0;
let loadedSVGsCount = 0;

function loadImage(src) {
    if (!imageCache[src]) {
        imageCache[src] = new Image();
        imageLoadStates[src] = 'loading';
        totalSVGsToLoad++;
        
        imageCache[src].onload = () => {
            imageLoadStates[src] = 'loaded';
            loadedSVGsCount++;
            updateLoadingProgress();
        };
        
        imageCache[src].onerror = () => {
            imageLoadStates[src] = 'error';
            console.error(`Failed to load image: ${src}`);
        };
        
        imageCache[src].src = src;
    }
    return imageCache[src];
}

function updateLoadingProgress() {
    const percentage = Math.round((loadedSVGsCount / totalSVGsToLoad) * 100);
    
    // Update browser console with loading progress
    if (loadedSVGsCount % 10 === 0 || percentage >= 90) {
        console.log(`🎮 SVG Loading Progress: ${loadedSVGsCount}/${totalSVGsToLoad} (${percentage}%)`);
    }
    
    // Could add UI progress bar here if needed
    // document.getElementById('loadingBar').style.width = percentage + '%';
}

// Helper function to check if image is ready to draw
function isImageReady(src) {
    return imageLoadStates[src] === 'loaded' && 
           imageCache[src] && 
           imageCache[src].complete && 
           imageCache[src].naturalWidth !== 0;
}

// Draw a sprite at given position with better loading handling
function drawSprite(imagePath, x, y, width = null, height = null) {
    if (isImageReady(imagePath)) {
        const img = imageCache[imagePath];
        if (width && height) {
            ctx.drawImage(img, x, y, width, height);
        } else {
            ctx.drawImage(img, x, y);
        }
    }
    // If image isn't loaded, we simply don't draw anything (no flash)
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Clipping utility functions for snowpile
function setClippingRegion(x, y, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
}

function clearClippingRegion() {
    ctx.restore();
}

// Optimized progressive loading system for crisp 1800x1200 scaling
function optimizedSVGLoading() {
    // Phase 1: Critical - Game can't start without these (loads in ~100ms)
    const critical = [
        'Sorted Assets/sprites/Background/Background.svg',
        'Sorted Assets/sprites/FloorAndCeiling/1.svg',
        'Sorted Assets/sprites/Snowpile_Player1/1.svg',
        'Sorted Assets/sprites/Snowpile_Player1/45.svg',
        'Sorted Assets/sprites/Snowpile_Player1/46.svg',
        'Sorted Assets/sprites/Snowpile_Player1/47.svg',
        'Sorted Assets/sprites/TurretExtension_Player1/1.svg',
        'Sorted Assets/sprites/MonkeyIdle_Player1/1.svg',
        'Sorted Assets/sprites/Icicle Shake/1.svg',
        'Sorted Assets/sprites/AimGuide_Player2/1.svg',
        'Sorted Assets/sprites/AimSlider/1.svg',
        'Sorted Assets/sprites/AimSlider/2.svg'
    ];
    
    // Phase 2: High Priority - User will likely need these soon (loads in first 500ms)
    const highPriority = [
        ...Array.from({length: 7}, (_, i) => `Sorted Assets/sprites/Icicle Shake/${i + 1}.svg`),
        ...Array.from({length: 15}, (_, i) => `Sorted Assets/sprites/TurretExtension_Player1/${i + 1}.svg`),
        ...Array.from({length: 20}, (_, i) => `Sorted Assets/sprites/Snowpile_Player1/${i + 1}.svg`)
    ];
    
    // Phase 3: Medium Priority - Background loading (loads gradually over 3 seconds)
    const mediumPriority = [
        ...Array.from({length: 25}, (_, i) => `Sorted Assets/sprites/Snowpile_Player1/${i + 21}.svg`),
        ...Array.from({length: 20}, (_, i) => `Sorted Assets/sprites/TurretExtension_Player1/${i + 16}.svg`),
        ...Array.from({length: 4}, (_, i) => `Sorted Assets/sprites/MonkeyIdle_Player1/${i + 1}.svg`)
    ];
    
    // Phase 4: On-Demand - Only load when S key is pressed (saves bandwidth)
    const onDemand = Array.from({length: 47}, (_, i) => `Sorted Assets/sprites/Snowpile_Player1/${i + 47}.svg`);
    
    console.log(`Phase 1: Loading ${critical.length} critical SVGs...`);
    
    // Load critical immediately
    critical.forEach(img => loadImage(img));
    
    // Load high priority after brief delay
    setTimeout(() => {
        console.log(`Phase 2: Loading ${highPriority.length} high priority SVGs...`);
        highPriority.forEach((img, i) => {
            setTimeout(() => loadImage(img), i * 10); // Staggered to prevent blocking
        });
    }, 150);
    
    // Load medium priority in background
    setTimeout(() => {
        console.log(`Phase 3: Background loading ${mediumPriority.length} medium priority SVGs...`);
        mediumPriority.forEach((img, i) => {
            setTimeout(() => loadImage(img), i * 25); // Slower, non-blocking
        });
    }, 1000);
    
    // Store on-demand list for later loading
    window.onDemandSVGs = onDemand;
    window.svgLoadingComplete = {
        critical: false,
        highPriority: false,
        mediumPriority: false
    };
    
    // Track loading completion
    setTimeout(() => {
        window.svgLoadingComplete.critical = true;
        console.log('✅ Critical SVGs loaded - Game ready!');
    }, 200);
    
    setTimeout(() => {
        window.svgLoadingComplete.highPriority = true;
        console.log('✅ High priority SVGs loaded - Smooth gameplay ready!');
    }, 2000);
    
    setTimeout(() => {
        window.svgLoadingComplete.mediumPriority = true;
        console.log('✅ Medium priority SVGs loaded - All animations ready!');
    }, 8000);
}

// ===========================================
// GAME LOOP
// ===========================================

function update(deltaTime) {
    // Update game logic here
    // deltaTime is in milliseconds since last frame
    
    // Update turret rotation based on Player1TurretAngle
    // Your SVG is rotated 48° clockwise from vertical, so subtract 48° to compensate
    gameObjects.turret.angle = (Player1TurretAngle + 42) * (Math.PI / 180);
    
    // Debug logging (remove later)
    if (deltaTime === 0) {
        console.log(`Player1TurretAngle = ${Player1TurretAngle}°`);
        console.log(`SVG compensated angle = ${Player1TurretAngle - 48}° (accounting for 48° SVG rotation)`);
        console.log(`Calculated turret.angle = ${gameObjects.turret.angle} radians`);
    }
    
    // Update all active animations
    updateAnimations(deltaTime);
    
    // Example: You can update turret rotations, snowball positions, etc.
}

function updateAnimations(deltaTime) {
    // Update all animation types
    Object.keys(animations).forEach(animationType => {
        const animationList = animations[animationType];
        
        for (let i = animationList.length - 1; i >= 0; i--) {
            const anim = animationList[i];
            
            anim.timeSinceLastFrame += deltaTime;
            
            // Check if it's time for the next frame
            if (anim.timeSinceLastFrame >= anim.frameTime) {
                anim.currentFrame++;
                anim.timeSinceLastFrame = 0;
                
                // Check if animation is finished
                if (anim.currentFrame >= anim.frames.length) {
                    if (anim.loop) {
                        anim.currentFrame = 0; // Loop back to start
                    } else {
                        anim.finished = true;
                        
                        // If icicle shake animation finished, reset state
                        if (animationType === 'IcicleShakes') {
                            gameObjects.icicle.isAnimating = false;
                        }
                        
                        // If monkey animation finished, reset state
                        if (animationType === 'MonkeyAnimations') {
                            gameObjects.monkey.isAnimating = false;
                        }
                        
                        // If turret fire animation finished, reset state
                        if (animationType === 'TurretFires') {
                            gameObjects.turret.isAnimating = false;
                        }
                        
                        // If snowpile startup animation finished, mark startup complete
                        if (animationType === 'SnowpileStartups') {
                            gameObjects.snowpile.isAnimating = false;
                            gameObjects.snowpile.isStartupComplete = true;
                            gameObjects.snowpile.currentFrame = 46; // Set to frame 46 (final startup frame)
                            // Ensure the still image matches the last frame for smooth transition
                            gameObjects.snowpile.stillImage = animationTemplates.SnowpileStartup.frames[45]; // Frame 46 (index 45)
                        }
                        
                        // If snowpile add animation finished, reset state
                        if (animationType === 'SnowpileAdds') {
                            gameObjects.snowpile.isAnimating = false;
                            // Don't modify currentFrame here - it's already set in addSnow()
                        }
                        
                        animationList.splice(i, 1); // Remove finished animation
                    }
                }
            }
        }
    });
}

function render() {
    // Clear the canvas
    clearCanvas();
    
    // Set background color (optional)
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // ===========================================
    // BACKGROUND LAYER (Furthest back)
    // ===========================================
    // Background
    drawSprite('Sorted Assets/sprites/Background/Background.svg', 0, 0);
    
    // AimGuide_Player2 - drawn above background but behind all other elements
    if (gameObjects.aimGuidePlayer1.isVisible) {
        drawMirroredSprite(
            gameObjects.aimGuidePlayer1.stillImage,
            gameObjects.aimGuidePlayer1.x,
            gameObjects.aimGuidePlayer1.y,
            gameObjects.aimGuidePlayer1.mirrored
        );
    }
    
    // ===========================================
    // MIDDLE LAYER (Game objects behind floor/ceiling)
    // ===========================================
    
    // Draw icicle BEFORE floor/ceiling so it appears behind them
    if (!gameObjects.icicle.isAnimating) {
        drawSprite(gameObjects.icicle.stillImage, gameObjects.icicle.x, gameObjects.icicle.y);
    }
    
    // Draw non-snowpile animations BEFORE floor/ceiling
    drawAnimationsExceptSnowpile();
    
    // Static obstacles/terrain that should be behind floor/ceiling
    // drawSprite('Sorted Assets/sprites/MetalObstacle/1.svg', 300, 250);
    // drawSprite('Sorted Assets/sprites/IceBlockDamaged/1.svg', 200, 200);
    
    // ===========================================
    // FOREGROUND LAYER (Floor and ceiling on top)
    // ===========================================
    
    // Floor and ceiling - drawn AFTER icicle so they appear in front
    drawSprite('Sorted Assets/sprites/FloorAndCeiling/1.svg', 0, -50);

    // Draw turret - either still image with rotation or let animation system handle it
    if (!gameObjects.turret.isAnimating) {
        drawRotatedSprite(
            gameObjects.turret.stillImage, 
            gameObjects.turret.x, 
            gameObjects.turret.y, 
            gameObjects.turret.centerX, 
            gameObjects.turret.centerY, 
            gameObjects.turret.angle
        );
    }

    // Draw Aim Slider (Player 1) - rotates with turret, above floor/ceiling
    const aimSlider = gameObjects.aimSlider;
    // Set aimSlider.angle to match Player1TurretAngle (no SVG compensation)
    aimSlider.angle = Player1TurretAngle * (Math.PI / 180);
    const aimSliderImage = aimSlider.isActive ? aimSlider.activeImage : aimSlider.inactiveImage;
    drawRotatedSprite(
        aimSliderImage,
        aimSlider.x,
        aimSlider.y,
        aimSlider.centerX,
        aimSlider.centerY,
        aimSlider.angle
    );
    
    // Draw snowpile - always show it (before, during, and after startup)
    // Draw both static snowpile AND snowpile animations AFTER floor/ceiling
    setClippingRegion(0, 0, CANVAS_WIDTH, 385);
    
    // Draw snowpile animations (startup/add) - these should be in front of floor/ceiling
    drawSnowpileAnimations();
    
    if (!gameObjects.snowpile.isAnimating) {
        // Always draw the current still image when not animating
        drawSprite(gameObjects.snowpile.stillImage, gameObjects.snowpile.x, gameObjects.snowpile.y);
    }
    
    clearClippingRegion();
    
    // Draw monkey After floor/ceiling so it appears in front of them
    if (!gameObjects.monkey.isAnimating) {
        drawSprite(gameObjects.monkey.stillImage, gameObjects.monkey.x, gameObjects.monkey.y);
    }    
    
    // Turret bases and other foreground elements
    // drawSprite('Sorted Assets/sprites/TurretExtension_Player1/1.svg', 50, 300);
    // drawSprite('Sorted Assets/sprites/TurretExtension_Player1/1.svg', 500, 300);
    
    // Chimneys or other foreground elements
    // drawSprite('Sorted Assets/sprites/Chimney/1.svg', 150, 280);
    
    // ===========================================
    // UI LAYER (Always on top)
    // ===========================================
    
    // Draw grid if enabled (always on top for reference)
    if (showGrid) {
        drawGrid();
    }
}

function drawAnimationsExceptSnowpile() {
    Object.keys(animations).forEach(animationType => {
        // Skip snowpile animations - they'll be drawn later
        if (animationType === 'SnowpileStartups' || animationType === 'SnowpileAdds') {
            return;
        }
        
        animations[animationType].forEach(anim => {
            if (anim.currentFrame < anim.frames.length) {
                // Special handling for turret animations - they need rotation
                if (animationType === 'TurretFires') {
                    const turret = gameObjects.turret;
                    drawRotatedSprite(
                        anim.frames[anim.currentFrame], 
                        anim.x, 
                        anim.y, 
                        turret.centerX, 
                        turret.centerY, 
                        turret.angle
                    );
                } 
                else {
                    // Regular sprite drawing for other animations (no clipping)
                    drawSprite(anim.frames[anim.currentFrame], anim.x, anim.y);
                }
            }
        });
    });
}

function drawSnowpileAnimations() {
    // Draw only snowpile animations with clipping
    ['SnowpileStartups', 'SnowpileAdds'].forEach(animationType => {
        if (animations[animationType]) {
            animations[animationType].forEach(anim => {
                if (anim.currentFrame < anim.frames.length) {
                    drawSprite(anim.frames[anim.currentFrame], anim.x, anim.y);
                }
            });
        }
    });
}

function drawAnimations() {
    Object.keys(animations).forEach(animationType => {
        animations[animationType].forEach(anim => {
            if (anim.currentFrame < anim.frames.length) {
                // Special handling for turret animations - they need rotation
                if (animationType === 'TurretFires') {
                    const turret = gameObjects.turret;
                    drawRotatedSprite(
                        anim.frames[anim.currentFrame], 
                        anim.x, 
                        anim.y, 
                        turret.centerX, 
                        turret.centerY, 
                        turret.angle
                    );
                } 
                // Special handling for snowpile animations - they need clipping
                else if (animationType === 'SnowpileStartups' || animationType === 'SnowpileAdds') {
                    // Set clipping region - only show snowpile above Y=385
                    setClippingRegion(0, 0, CANVAS_WIDTH, 385);
                    
                    drawSprite(anim.frames[anim.currentFrame], anim.x, anim.y);
                    
                    // Clear clipping for other animations
                    clearClippingRegion();
                }
                else {
                    // Regular sprite drawing for other animations (no clipping)
                    drawSprite(anim.frames[anim.currentFrame], anim.x, anim.y);
                }
            }
        });
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    
    // Vertical lines every 50 pixels
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Horizontal lines every 50 pixels
    for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Update and render
    update(deltaTime);
    render();
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// ===========================================
// INPUT HANDLING
// ===========================================

// Mouse/touch input
let mouseX = 0;
let mouseY = 0;
let isDraggingAimSlider = false;
let isHoveringAimSlider = false;

// Get coordinate display element
const coordinateDisplay = document.getElementById('coordinateDisplay');

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / viewScale;
    const clickY = (e.clientY - rect.top) / viewScale;
    // Use aimSlider center as pivot for hit detection
    const aimSlider = gameObjects.aimSlider;
    const dx = clickX - aimSlider.centerX-10;
    const dy = clickY - aimSlider.centerY+8;
    const r = Math.sqrt(dx*dx + dy*dy);
    const handleRadius = Math.sqrt((aimSlider.x - aimSlider.centerX)**2 + (aimSlider.y - aimSlider.centerY)**2);
    if (Math.abs(r - handleRadius) < 10 && gameObjects.aimSlider.isActive) { // Slightly larger hit area for usability
        isDraggingAimSlider = true;
        e.preventDefault();
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / viewScale;
    mouseY = (e.clientY - rect.top) / viewScale;
    // Cursor feedback and drag logic
    const aimSlider = gameObjects.aimSlider;
    const dx = mouseX - aimSlider.centerX-10;
    const dy = mouseY - aimSlider.centerY+8;
    const r = Math.sqrt(dx*dx + dy*dy);
    const handleRadius = Math.sqrt((aimSlider.x - aimSlider.centerX)**2 + (aimSlider.y - aimSlider.centerY)**2);
    if (Math.abs(r - handleRadius) < 10 && gameObjects.aimSlider.isActive) {
        isHoveringAimSlider = true;
        canvas.style.cursor = isDraggingAimSlider ? 'grabbing' : 'grab';
    } else {
        isHoveringAimSlider = false;
        if (!isDraggingAimSlider) canvas.style.cursor = '';
    }
    if (isDraggingAimSlider) {
        // Use standard atan2 for angle calculation
        let angleRad = Math.atan2(mouseY - aimSlider.centerY, mouseX - aimSlider.centerX);
        let angleDeg = angleRad * 180 / Math.PI;
        // Clamp to allowed range
        if (angleDeg < TURRET_MIN_ANGLE) angleDeg = TURRET_MIN_ANGLE;
        if (angleDeg > TURRET_MAX_ANGLE) angleDeg = TURRET_MAX_ANGLE;
        Player1TurretAngle = angleDeg;
    }
});

canvas.addEventListener('mouseup', (e) => {
    isDraggingAimSlider = false;
    if (!isHoveringAimSlider) canvas.style.cursor = '';
});
canvas.addEventListener('mouseleave', () => {
    isDraggingAimSlider = false;
    isHoveringAimSlider = false;
    canvas.style.cursor = '';
    coordinateDisplay.style.display = 'none';
});

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Remove ArrowLeft/ArrowRight turret angle control
    if (e.code === 'Space') {
        // Fire turret with spacebar
        const turret = gameObjects.turret;
        if (!turret.isAnimating) {
            console.log(`Turret fired! Angle: ${Player1TurretAngle}°`);
            triggerAnimation('TurretFire', turret.x, turret.y);
        }
    }
    // Press 'R' to reset icicle
    if (e.code === 'KeyR') {
        resetIcicle();
    }
    // Press 'M' to reset monkey
    if (e.code === 'KeyM') {
        resetMonkey();
    }
    // Press 'S' to add snow (for testing)
    if (e.code === 'KeyS') {
        addSnow();
    }
    // Toggle player turn (for testing Aim Slider active/inactive)
    if (e.code === 'KeyT') {
        togglePlayerTurn();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Add this function to reset the icicle (for testing):
function resetIcicle() {
    const icicle = gameObjects.icicle;
    icicle.y = icicle.originalY;
    icicle.fallDistance = 0;
    icicle.isAnimating = false;
    console.log('Icicle reset to original position!');
}

function resetMonkey() {
    const monkey = gameObjects.monkey;
    monkey.x = monkey.originalX;
    monkey.y = monkey.originalY;
    monkey.isAnimating = false;
    console.log('Monkey reset to original position!');
}

function resetTurret() {
    const turret = gameObjects.turret;
    Player1TurretAngle = 0; // Reset to pointing up
    turret.angle = (0) * (Math.PI / 180); // Account for sprite offset
    turret.isAnimating = false;
    console.log('Turret reset to 90° (pointing up)!');
}

// ===========================================
// UI CONTROLS
// ===========================================

// Grid toggle button
const gridToggle = document.getElementById('gridToggle');
gridToggle.addEventListener('click', () => {
    showGrid = !showGrid;
    gridToggle.textContent = showGrid ? 'Grid: ON' : 'Grid: OFF';
    gridToggle.classList.toggle('active', showGrid);
});

// Coordinate display toggle button
const coordToggle = document.getElementById('coordToggle');
coordToggle.addEventListener('click', () => {
    showCoordinates = !showCoordinates;
    coordToggle.textContent = showCoordinates ? 'Coordinates: ON' : 'Coordinates: OFF';
    coordToggle.classList.toggle('active', showCoordinates);
    
    if (!showCoordinates) {
        coordinateDisplay.style.display = 'none';
    }
});

// ===========================================
// START THE GAME
// ===========================================

console.log('Turret Game Canvas Initialized');
console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT} at ${viewScale}x scale`);

// Preload only critical images for immediate display
optimizedSVGLoading();

// Start the game immediately with critical images
console.log('Starting game...');

// Set initial turret angle before starting the game loop
update(0);

// Start snowpile startup animation before the game loop so it animates on first frame
setTimeout(() => {
    console.log('Starting snowpile startup animation...');
    triggerAnimation('SnowpileStartup', gameObjects.snowpile.x, gameObjects.snowpile.y);
}, 0); // No delay, start immediately

// Start the game loop immediately
requestAnimationFrame(gameLoop);

// Start background loading of animation frames
// (Now handled by optimizedSVGLoading instead)
console.log('SVG loading system initialized!');

// Start snowpile startup animation after a short delay to ensure it's visible
setTimeout(() => {
    console.log('Starting snowpile startup animation...');
    triggerAnimation('SnowpileStartup', gameObjects.snowpile.x, gameObjects.snowpile.y);
}, 500); // Half second delay to see the animation

console.log('Game started! Ready for turret action!');

// When a snowball hits something:
// triggerAnimation('muzzleFlash', 50, 300);

// When something explodes:
// triggerAnimation('explosion', 400, 250);

// ===========================================
// GAME FUNCTIONS
// ===========================================

// Enhanced addSnow function with on-demand loading
function addSnow() {
    const snowpile = gameObjects.snowpile;
    
    // Load on-demand SVGs when S key is first pressed
    if (!window.onDemandSVGsLoaded && window.onDemandSVGs) {
        console.log('Loading on-demand snowpile SVGs (frames 47-92)...');
        window.onDemandSVGs.forEach((img, i) => {
            setTimeout(() => loadImage(img), i * 5); // Fast loading for immediate use
        });
        window.onDemandSVGsLoaded = true;
    }
    
    // Only allow adding snow if startup is complete, not animating, and hasn't reached max frame
    if (snowpile.isStartupComplete && !snowpile.isAnimating && snowpile.currentFrame < snowpile.maxAddFrame) {
        console.log(`Adding snow to pile! Current frame: ${snowpile.currentFrame}, going to frame: ${snowpile.currentFrame + 1}`);
        
        // Increment current frame immediately
        snowpile.currentFrame++;
        
        // Update still image to the new frame immediately
        snowpile.stillImage = `Sorted Assets/sprites/Snowpile_Player1/${snowpile.currentFrame}.svg`;
        
        console.log(`Snow added! Now at frame ${snowpile.currentFrame}`);
        
        return true;
    } else if (snowpile.currentFrame >= snowpile.maxAddFrame) {
        console.log('Cannot add more snow - reached maximum frame 92!');
        return false;
    } else {
        console.log(`Cannot add snow - startup complete: ${snowpile.isStartupComplete}, animating: ${snowpile.isAnimating}, current frame: ${snowpile.currentFrame}/${snowpile.maxAddFrame}`);
        return false;
    }
}

// Toggle player turn (for testing Aim Slider active/inactive)
function togglePlayerTurn() {
    gameObjects.aimSlider.isActive = !gameObjects.aimSlider.isActive;
    console.log('Aim Slider is now', gameObjects.aimSlider.isActive ? 'ACTIVE (1.svg)' : 'INACTIVE (2.svg)');
}
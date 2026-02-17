// main game play scene

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Get level number from scene data
        this.levelNumber = data.levelNumber || 1;
    }

    preload() {
        // Load level-specific assets with cache busting
        const timestamp = Date.now();
        this.load.json(`level${this.levelNumber}`, `levels/level${this.levelNumber}.json?v=${timestamp}`);
        
        // Load ship sprite
        this.load.image('ship', 'assets/UFO_basic.png');
        
        // Load star sprite
        this.load.image('star1', 'assets/star1.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');
        
        this.ship = null;
        this.gameEnded = false; // Flag to prevent multiple collision detections
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Get preloaded level data
        this.levelData = this.cache.json.get(`level${this.levelNumber}`);
        if (!this.levelData) {
            console.error('Failed to load level!');
            return;
        }

        // Create ship
        this.ship = this.add.sprite(this.levelData.shipStart.x, this.levelData.shipStart.y, 'ship');
        this.ship.setScale(0); // Start invisible for animation
        
        // Reset any blend modes/tints that might make it black
        this.ship.setTint(0xffffff); // White tint (normal)
        this.ship.setBlendMode(Phaser.BlendModes.NORMAL); // Normal blend
        
        // Animate ship appearing with bounce effect
        this.tweens.add({
            targets: this.ship,
            scale: 0.5,
            duration: 1000,
            ease: 'Bounce.easeOut',
            delay: 200
        });

        // Show level announcement
        const levelText = this.add.text(600, 100, `Level ${this.levelNumber}`, {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#00ff73',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        // Animate level text in and out
        this.tweens.add({
            targets: levelText,
            alpha: 1,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 300,
            onComplete: () => {
                // Hold for a moment, then fade out
                this.tweens.add({
                    targets: levelText,
                    alpha: 0,
                    scale: 1.2,
                    duration: 800,
                    ease: 'Power2.easeIn',
                    delay: 1500
                });
            }
        });
        
        this.physics.add.existing(this.ship);
        this.ship.body.setCollideWorldBounds(false);

        // Create celestial bodies
        this.Bodies = this.add.group();
        this.levelData.celestialBodies.forEach(body => {
        try {
            // Use star sprite instead of circle
            const Body = this.add.sprite(body.x, body.y, 'star1');
            Body.setScale(body.radius / 150); // Even smaller scaling
            // Remove tint - keep natural star colors
            Body.mass = body.mass;
            
            this.physics.add.existing(Body, true);
            
            this.Bodies.add(Body);
        } catch (e) {
            console.error("Failed to parse level data:", error);
        }
        });

        // Create green zone (win area)
        const greenZone = this.levelData.greenZone;
        const zoneX = this.cameras.main.width - greenZone.width;
        const zoneY = greenZone.top;
        const zoneHeight = greenZone.bottom - greenZone.top;
        
        this.greenZone = this.add.rectangle(zoneX, zoneY + zoneHeight/2, greenZone.width, zoneHeight, 0x00ff00);
        this.greenZone.alpha = 0.3; // semi-transparent
        this.physics.add.existing(this.greenZone, true);


        // Pullback launch handlers
        this.isPullingBack = false;
        this.pullStartX = 0;
        this.pullStartY = 0;
        
        // Create graphics objects for visual effects
        this.aimingArrow = this.add.graphics();

        this.input.on('pointerdown', (pointer) => {
            this.isPullingBack = true;
            this.pullStartX = pointer.x;
            this.pullStartY = pointer.y;
        });
        
        // Add pointer move for real-time visual feedback
        this.input.on('pointermove', (pointer) => {
            if (this.isPullingBack) {
                this.updateVisualEffects(pointer);
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            if (this.isPullingBack) {
                this.isPullingBack = false;

                // Calculate pullback distance for power scaling
                const pullbackX = this.pullStartX - pointer.x;
                const pullbackY = this.pullStartY - pointer.y;
                const pullbackDistance = Math.sqrt(pullbackX * pullbackX + pullbackY * pullbackY);
                
                // Scale velocity based on pullback distance
                const maxPullback = 150;
                const maxVelocity = 600;
                const powerScale = Math.min(pullbackDistance / maxPullback, 1.0);
                
                // Apply scaled velocity
                this.velocityX = (pullbackX / pullbackDistance) * (maxVelocity * powerScale);
                this.velocityY = (pullbackY / pullbackDistance) * (maxVelocity * powerScale);

                this.ship.body.setVelocity(this.velocityX, this.velocityY);
                
                // Clear visual effects
                this.aimingArrow.clear();
            }
        });
    }

    addCrashEffects() {
        console.log('addCrashEffects called!');
        const shipX = this.ship.x;
        const shipY = this.ship.y;
        console.log(`Ship position: ${shipX}, ${shipY}`);
        
        console.log('Adding screen shake...');
        this.cameras.main.shake(500, 0.02);
        
        console.log('Adding screen flash...');
        this.cameras.main.flash(300, 255, 100, 0); // Orange flash
        
        console.log('Creating explosion particles...');
        for (let i = 0; i < 12; i++) {
            const particle = this.add.circle(shipX, shipY, 3, 0xff4400);
            const angle = (i / 12) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            
            this.tweens.add({
                targets: particle,
                x: shipX + Math.cos(angle) * speed,
                y: shipY + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 600,
                ease: 'Power2.easeOut'
            });
        }
        
        console.log('Adding ship destruction tween...');
        this.tweens.add({
            targets: this.ship,
            scale: 0,
            angle: 720, // Two full rotations
            alpha: 0,
            duration: 400,
            ease: 'Power2.easeIn'
        });
        
        console.log('Creating explosion rings...');
        for (let i = 0; i < 3; i++) {
            const ring = this.add.circle(shipX, shipY, 5, 0xff6600 - (i * 0x001100), 0.6 - (i * 0.1));
            this.tweens.add({
                targets: ring,
                radius: 60 + (i * 20),
                alpha: 0,
                duration: 400 + (i * 100),
                ease: 'Power2.easeOut',
                delay: i * 50
            });
        }
        
        console.log('Stopping floating animation...');
        this.tweens.killTweensOf(this.ship);
        
        console.log('All crash effects set up!');
    }

    updateVisualEffects(pointer) {
        // Clear previous drawings
        this.aimingArrow.clear();
        
        // Calculate pullback
        const pullbackX = this.pullStartX - pointer.x;
        const pullbackY = this.pullStartY - pointer.y;
        const distance = Math.sqrt(pullbackX * pullbackX + pullbackY * pullbackY);
        const maxPullback = 150;
        const powerPercent = Math.min(distance / maxPullback, 1.0);
        
        // Color interpolation from green (weak) to red (strong)
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            {r: 0, g: 255, b: 0},
            {r: 255, g: 0, b: 0},
            100,
            Math.floor(powerPercent * 100)
        );
        const circleColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
        
        // Draw circle at cursor
        const minRadius = 8;
        const maxRadius = 25;
        const circleRadius = minRadius + (maxRadius - minRadius) * powerPercent;
        
        // Draw cone connecting ship to circle
        const shipX = this.ship.x;
        const shipY = this.ship.y;
        const cursorX = pointer.x;
        const cursorY = pointer.y;
        
        // Calculate perpendicular direction for cone width
        const dx = cursorX - shipX;
        const dy = cursorY - shipY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            // Perpendicular vector
            const perpX = -dy / length;
            const perpY = dx / length;
            
            // Cone points at circle edges
            const coneWidth = circleRadius * 0.8;
            const leftX = cursorX + perpX * coneWidth;
            const leftY = cursorY + perpY * coneWidth;
            const rightX = cursorX - perpX * coneWidth;
            const rightY = cursorY - perpY * coneWidth;
            
            // Draw cone
            this.aimingArrow.fillStyle(circleColor, 0.2);
            this.aimingArrow.beginPath();
            this.aimingArrow.moveTo(shipX, shipY);
            this.aimingArrow.lineTo(leftX, leftY);
            this.aimingArrow.lineTo(rightX, rightY);
            this.aimingArrow.closePath();
            this.aimingArrow.fillPath();
        }
        
        // Draw circle on top of cone
        this.aimingArrow.fillStyle(circleColor, 0.8);
        this.aimingArrow.fillCircle(cursorX, cursorY, circleRadius);
        
        // Add border for better visibility
        this.aimingArrow.lineStyle(2, circleColor);
        this.aimingArrow.strokeCircle(cursorX, cursorY, circleRadius);
    }

    update() {
        if (!this.ship || !this.ship.body){
            return;
        }

        // Ship in green zone check
        if (this.physics.overlap(this.ship, this.greenZone)) {
            if (this.gameEnded) return;
            this.gameEnded = true;
            
            console.log('Level completed!');
            this.scene.start('GameOverScene', { won: true, levelNumber: this.levelNumber });
            return;
        }

        // Check if ship collided with any planet
        let collisionDetected = false;
        this.Bodies.children.entries.forEach(planet => {
            // Use actual sprite bounds for collision detection
            const dx = planet.x - this.ship.x;
            const dy = planet.y - this.ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate collision radius based on actual sprite size
            const planetRadius = (planet.width * planet.scaleX) / 2;
            const shipRadius = (this.ship.width * this.ship.scaleX) / 2;
            const collisionRadius = planetRadius + shipRadius;
            
            if (distance < collisionRadius) {
                collisionDetected = true;
            }
        });
        
        if (collisionDetected) {
            // Prevent multiple collision detections
            if (this.gameEnded) return;
            this.gameEnded = true;
            
            console.log('COLLISION! Effects starting...');
            
            // Stop the ship immediately
            this.ship.body.setVelocity(0, 0);
            
            // Add crash effects before transitioning
            this.addCrashEffects();
            
            // Delay scene transition to show effects
            this.time.delayedCall(2000, () => { // Longer delay for testing
                console.log('Effects should be done, transitioning...');
                this.scene.start('GameOverScene', { won: false, levelNumber: this.levelNumber });
            });
            return;
        }

        // Check if ship went out of bounds
        const bounds = this.cameras.main;
        if (this.ship.x > bounds.width || this.ship.y > bounds.height || 
            this.ship.x < 0 || this.ship.y < 0) {
            if (this.gameEnded) return;
            this.gameEnded = true;
            
            console.log('Ship missed the green zone!');
            this.scene.start('GameOverScene', { won: false, levelNumber: this.levelNumber });
            return;
        }

        // Apply gravity to ship if it's moving
        if (this.ship.body.velocity.x !== 0 || this.ship.body.velocity.y !== 0) {
            
            this.Bodies.children.entries.forEach(planet => {
                const dx = planet.x - this.ship.x;
                const dy = planet.y - this.ship.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 20) {
                    const force = (planet.mass * 5.0) / (distance * distance);

                    const accelX = force * (dx / distance);
                    const accelY = force * (dy / distance);

                    // add to current velocity
                    this.ship.body.setVelocity(
                        this.ship.body.velocity.x + accelX,
                        this.ship.body.velocity.y + accelY
                    );
                }
            });
        }
    }
}
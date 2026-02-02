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
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');
        
        this.ship = null;
        
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
        this.ship.setScale(0.5); // Adjust size as needed
        
        // Reset any blend modes/tints that might make it black
        this.ship.setTint(0xffffff); // White tint (normal)
        this.ship.setBlendMode(Phaser.BlendModes.NORMAL); // Normal blend
        
        this.physics.add.existing(this.ship);
        this.ship.body.setCollideWorldBounds(false);

        // Create celestial bodies
        this.Bodies = this.add.group();
        this.levelData.celestialBodies.forEach(body => {
        try {
            const Body = this.add.circle(body.x, body.y, body.radius, parseInt(body.color, 16));
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
            console.log('Level completed!');
            this.scene.start('GameOverScene', { won: true, levelNumber: this.levelNumber });
            return;
        }

        // Check if ship collided with any planet
        let collisionDetected = false;
        this.Bodies.children.entries.forEach(planet => {
            // Distance-based collision detection
            const dx = planet.x - this.ship.x;
            const dy = planet.y - this.ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionRadius = planet.radius + 8; // Ship half-size buffer
            
            if (distance < collisionRadius) {
                collisionDetected = true;
            }
        });
        
        if (collisionDetected) {
            console.log('Ship crashed!');
            this.scene.start('GameOverScene', { won: false, levelNumber: this.levelNumber });
            return;
        }

        // Check if ship went out of bounds
        const bounds = this.cameras.main;
        if (this.ship.x > bounds.width || this.ship.y > bounds.height || 
            this.ship.x < 0 || this.ship.y < 0) {
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
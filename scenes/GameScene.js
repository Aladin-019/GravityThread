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
        // Load level-specific assets
        this.load.json(`level${this.levelNumber}`, `levels/level${this.levelNumber}.json`);
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
        this.ship = this.add.rectangle(this.levelData.shipStart.x, this.levelData.shipStart.y, 15, 20, 0xff6600);
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

        this.input.on('pointerdown', (pointer) => {
            this.isPullingBack = true;
            this.pullStartX = pointer.x;
            this.pullStartY = pointer.y;
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
            }
        });
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
                    const force = (planet.mass * 2.0) / (distance * distance);

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
// main game play scene

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Get level number from scene data
        this.levelNumber = data.levelNumber || 1;
    }

    async create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');
        
        // Load level data
        this.levelData = await LevelManager.loadLevel(this.levelNumber);
        if (!this.levelData) {
            console.error('Failed to load level!');
            return;
        }

        // Temporary game scene text
        this.add.text(600, 50, `Level ${this.levelNumber} - Game Scene`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 100, 'Game scene loaded!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Temporary back button
        this.add.text(600, 500, 'Click to go back to menu', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ff0000'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Game loop
    }
}
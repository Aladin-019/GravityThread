// Win/lose scene

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.won = data.won || false;
        this.levelNumber = data.levelNumber || 1;
    }

    // cache assets for quick access
    preload(){
        this.load.json(`levels`, `levels/levels.json`)
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');
        
        if (this.won) {
            this.add.text(600, 200, 'Mission Accomplished!', {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#00ff73',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(600, 280, 'You made it home!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#d0ff00'
            }).setOrigin(0.5);

            // Check if there's a next level
            const nextLevel = this.levelNumber + 1;
            const levels = this.cache.json.get('levels');
            const hasNextLevel = nextLevel <= levels.maxLevels;

            if (hasNextLevel) {
                this.add.text(600, 350, `Click to continue to Level ${nextLevel}`, {
                    fontSize: '18px',
                    fontFamily: 'Arial',
                    color: '#d0ff00'
                }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
                    this.scene.start('GameScene', { levelNumber: nextLevel });
                });

                this.add.text(600, 380, 'or press ESC for menu', {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#888888'
                }).setOrigin(0.5);

                // ESC key to go to menu
                this.input.keyboard.on('keydown-ESC', () => {
                    this.scene.start('MenuScene');
                });
            } else {
                this.add.text(600, 350, 'All levels completed!', {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: '#d0ff00'
                }).setOrigin(0.5);

                this.add.text(600, 400, 'Click to return to menu', {
                    fontSize: '18px',
                    fontFamily: 'Arial',
                    color: '#d0ff00'
                }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                });
            }
        } else {
            this.add.text(600, 200, 'Mission Failed', {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ff4800',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(600, 280, 'Ship crashed!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            this.add.text(600, 350, 'Click to try again', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#d0ff00'
            }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
                this.scene.start('GameScene', { levelNumber: this.levelNumber });
            });

            this.add.text(600, 380, 'or press ESC for menu', {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#888888'
            }).setOrigin(0.5);

            // ESC key to go to menu
            this.input.keyboard.on('keydown-ESC', () => {
                this.scene.start('MenuScene');
            });
        }
    }
}
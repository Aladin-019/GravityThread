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
            // Create title text with initial scale of 0 (invisible)
            const titleText = this.add.text(600, 200, 'Mission Accomplished!', {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#00ff73',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScale(0);

            // Animate title scaling up with bounce effect
            this.tweens.add({
                targets: titleText,
                scale: 1,
                duration: 800,
                ease: 'Back.easeOut',
                delay: 200
            });

            // Create subtitle with initial alpha of 0 (transparent)
            const subtitleText = this.add.text(600, 280, 'You made it home!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#d0ff00'
            }).setOrigin(0.5).setAlpha(0);

            // Fade in subtitle after title animation
            this.tweens.add({
                targets: subtitleText,
                alpha: 1,
                duration: 600,
                ease: 'Power2.easeOut',
                delay: 800
            });

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
            // Create failed title with shake effect
            const failText = this.add.text(600, 200, 'Mission Failed', {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ff4800',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Shake animation for dramatic effect
            this.tweens.add({
                targets: failText,
                x: 605,
                duration: 50,
                ease: 'Power2.easeInOut',
                yoyo: true,
                repeat: 5
            });

            // Create crash text that slides in from left
            const crashText = this.add.text(-100, 280, 'Ship crashed!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Slide in crash text
            this.tweens.add({
                targets: crashText,
                x: 600,
                duration: 700,
                ease: 'Power2.easeOut',
                delay: 500
            });

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
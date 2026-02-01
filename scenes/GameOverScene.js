// Win/lose scene

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.won = data.won || false;
        this.levelNumber = data.levelNumber || 1;
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
        } else {
            this.add.text(600, 200, 'Mission Failed', {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ff4800',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        this.add.text(600, 400, 'Click to return to menu', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#d0ff00'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
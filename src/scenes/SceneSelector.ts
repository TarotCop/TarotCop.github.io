import Phaser from "phaser";

export class SceneSelector extends Phaser.Scene {

    parts = {
        '1': "Play Game",
    };

    constructor() {
        super({ key: "selector", active: true });
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0x000000);

        this.load.image("tiles", "https://TarotCop.github.io/assets/TinyRanch_Tiles.png");
        this.load.image("structures", "https://TarotCop.github.io/assets/TinyRanch_Structures.png");
        this.load.image("decorations", "https://TarotCop.github.io/assets/TinyRanch_MapDecorations.png");

        this.load.tilemapTiledJSON("map", "https://TarotCop.github.io/assets/Waitroom_map.json");
        this.load.tilemapTiledJSON("main_map", "https://TarotCop.github.io/assets/Main_map.json");

        // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
        // the player animations (walking left, walking right, etc.) in one image. For more info see:
        //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
        // If you don't use an atlas, you can do the same thing with a spritesheet, see:
        //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
        this.load.atlas("atlas", "https://TarotCop.github.io/assets/TinyFarm_Characters.png", "https://TarotCop.github.io/assets/Farmer.json");
        
    }

    create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            this.runScene(window.location.hash.substring(1));
            return;
        }

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "16px",
            // fontSize: "24px",
            fontFamily: "Arial",
            resolution: 100
        };

        for (let partNum in this.parts) {
            const index = parseInt(partNum) - 1;
            const label = this.parts[partNum];

            // this.add.text(32, 32 + 32 * index, `Part ${partNum}: ${label}`, textStyle)
            this.add.text(100, 75, label, textStyle)
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    this.runScene("waitroom");
                });
        }
        
    }

    runScene(key: string) {
        this.game.scene.switch("selector", key)
    }

}
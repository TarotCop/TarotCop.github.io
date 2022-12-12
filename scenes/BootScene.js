import {Scene} from 'phaser';
import {Client} from 'colyseus.js';
import { BACKEND_URL } from "../backend";


class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }
  
  preload() {
    // Load any assets here from your assets directory
    this.load.image('cat-like', 'assets/player.png');

    this.load.image("tiles", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "../assets/map.json");
  
    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas("atlas", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json");
} 

  create() {
    this.add.text(10, 10, "Click to join.", {
      color: '#FFF',
      fontFamily: 'monospace',
      fontSize: 18
    }).setOrigin(-2, -10);

    this.registry.gameClient = new Client(BACKEND_URL);

    this.input.on('pointerdown', async () => {
      const room = await this.registry.gameClient.joinOrCreate("my_room");
      this.registry.gameRoom = room;

      this.scene.start('scene-game');
    });
  }
}

export default BootScene;
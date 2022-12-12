import {Scene} from 'phaser';

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createLayer("Below Player", tileset, 0, 0).setScale(2);
  const worldLayer = map.createLayer("World", tileset, 0, 0).setScale(2);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0).setScale(2);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

    this.players = {}; // A map of all players in room
    this.player = null; // A ref to this client's player
    this.playerID = this.registry.gameRoom.sessionId; // This client's playerID (sessionId)

    this.keys = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

    this.registry.gameRoom.onStateChange((state) => {
      state.players.forEach((player, sessionId) => {
        const playerSpawned = (typeof this.players[sessionId] !== 'undefined');

        // Update existing player
        if (playerSpawned) {
          const {x, y} = player;

          this.players[sessionId].setPosition(x, y);
        }
        // Initial player spawn
        else {
          const {x, y} = player;
          this.players[sessionId] = this.add.sprite(x, y, 'atlas').setScale(2);

          if (sessionId === this.playerID) {
            this.player = this.players[sessionId];
            this.cameras.main.startFollow(this.player);
          }
        }
      });

      // Remove any players who have left
      Object.keys(this.players).forEach((key) => {
        if (typeof state.players.get(key) === 'undefined') {
          this.players[key].destroy();
          delete this.players[key];
        }
      });
    });

    // Zoom the camera out
    this.cameras.main.setZoom(0.5);
  }

  update() {
    const {up, left, down, right} = this.keys;

    this.registry.gameRoom.send('input', {
      up: up.isDown,
      left: left.isDown,
      down: down.isDown,
      right: right.isDown
    });
  }

}
export default GameScene;
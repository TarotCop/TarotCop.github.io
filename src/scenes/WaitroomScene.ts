/**
 * ---------------------------
 * Phaser + Colyseus - Part 3.
 * ---------------------------
 * - Connecting with the room
 * - Sending inputs at the user's framerate
 * - Update other player's positions WITH interpolation (for other players)
 * - Client-predicted input for local (current) player
 */

import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import Skeleton from '../enemies/Skeleton'

export class WaitroomScene extends Phaser.Scene {
    room: Room;

    currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

    debugFPS: Phaser.GameObjects.Text;

    localRef: Phaser.GameObjects.Rectangle;
    remoteRef: Phaser.GameObjects.Rectangle;

    private skeletons!: Phaser.Physics.Arcade.Group

    private playerSkeletonsCollider?: Phaser.Physics.Arcade.Collider

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    inputPayload = {
        x: 0,
        y: 0,
    };

    constructor() {
        super({ key: "waitroom" });
    }

    async create() {
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.debugFPS = this.add.text(4, 4, "poopoo", { color: "#ff0000", }); 
        

        // this.add.sprite(5, 5, "tiles", "TinyRanch_Tiles")

        // connect with the room
        await this.connect();

        const map = this.make.tilemap({ key: "map" });   
        const tileset = map.addTilesetImage("TinyRanch_Tiles", "tiles");
        const structureset = map.addTilesetImage("TinyRanch_Structures", "structures");

        // this.add.sprite(1, 100, "tiles")
        // this.add.sprite(50, 50, "structures")
        // this.add.sprite(10, 10, "decorations")
        
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createLayer("World", structureset, 0, 0);
        const aboveLayer = map.createLayer("Above Player", structureset, 0, 0);
      
        worldLayer.setCollisionByProperty({ collides: true});

        //aboveLayer.setDepth(100);
        // topLayer.setDepth(11);

        this.room.state.players.onAdd((player, sessionId) => {
            const entity = this.physics.add.sprite(player.x, player.y, "atlas", "front")            
            this.physics.add.collider(entity, worldLayer);
            this.playerEntities[sessionId] = entity;

            // is current player
            if (sessionId === this.room.sessionId) {
                this.currentPlayer = entity;

                const camera = this.cameras.main;
                camera.startFollow(entity);
                camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

                this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
                this.localRef.setStrokeStyle(1, 0x00ff00);

                this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
                this.remoteRef.setStrokeStyle(1, 0xff0000);

                

                player.onChange(() => {
                    this.remoteRef.x = player.x;
                    this.remoteRef.y = player.y;
                });

            } else {
                // listening for server updates
                player.onChange(() => {
                    //
                    // we're going to LERP the positions during the render loop.
                    //
                    entity.setData('serverX', player.x);
                    entity.setData('serverY', player.y);
                });

            }

        });

        this.input.keyboard.once("keydown-D", event => {

            this.runScene("mainroom");


        })

        // remove local reference when entity is removed from the server
        this.room.state.players.onRemove((player, sessionId) => {
            const entity = this.playerEntities[sessionId];
            if (entity) {
                entity.destroy();
                delete this.playerEntities[sessionId]
            }
        });      

        this.anims.create({
            key: "player-idle-down",
            frames: [{}]
        })

        this.skeletons = this.physics.add.group({
			classType: Skeleton,
			createCallback: (go) => {
				const lizGo = go as Skeleton
				lizGo.body.onCollide = true
			}
		})

        const skelly = this.physics.add.sprite(75, 75, "atlas" )
        
        
    }

    async connect() {
        // add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL);

        try {
            this.room = await client.joinOrCreate("waitroom", {});

            // connection successful!
            connectionStatusText.destroy();

        } catch (e) {
            // couldn't connect
            connectionStatusText.text =  "Could not connect with the server.";
        }

    }

    update(time: number, delta: number): void {
        // skip loop if not connected yet.
        if (!this.currentPlayer) { return; }

        const velocity = 50;

        this.currentPlayer.body.setVelocity(0);

        if (this.cursorKeys.left.isDown) {
            this.currentPlayer.body.setVelocityX(-velocity);

        } else if (this.cursorKeys.right.isDown) {
            this.currentPlayer.body.setVelocityX(velocity);
        }
        if (this.cursorKeys.up.isDown) {
            this.currentPlayer.body.setVelocityY(-velocity);

        } else if (this.cursorKeys.down.isDown) {
            this.currentPlayer.body.setVelocityY(velocity);
        }

        this.inputPayload.x = this.currentPlayer.x;
        this.inputPayload.y = this.currentPlayer.y;
        this.room.send(0, this.inputPayload);

        this.localRef.x = this.currentPlayer.x;
        this.localRef.y = this.currentPlayer.y;

        for (let sessionId in this.playerEntities) {
            // interpolate all player entities
            // (except the current player)
            if (sessionId === this.room.sessionId) {
                
                continue;
            }

            const entity = this.playerEntities[sessionId];
            const { serverX, serverY } = entity.data.values;

            entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
            entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
        }
    }

    runScene(key: string) {
        this.game.scene.switch("waitroom", key)
    }

}
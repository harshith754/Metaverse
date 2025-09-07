import Phaser from "phaser";
import { Socket } from "socket.io-client";

// To make this class fully self-contained, we can define the events it uses.
// Later, we can move this to a central file.
interface ClientToServerEvents {
  updatePlayer: (data: { x: number; y: number; name: string; animation: string }) => void;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Define class properties with types
  private nameText: Phaser.GameObjects.Text;
  private lastEmittedPosition: { x: number; y: number };
  private updateInterval: number;
  private socket: Socket<any, ClientToServerEvents>; // Use a typed socket

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, socket: Socket<any, ClientToServerEvents>) {
    // Your code used 'dude' as the texture, so we'll use that.
    // Make sure it's loaded in GameScene's preload() method.
    super(scene, x, y, "dude");

    this.scene = scene;
    this.name = name;
    this.socket = socket; // Store the socket instance

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.lastEmittedPosition = { x, y };
    this.updateInterval = 500;

    this.nameText = scene.add
      .text(x, y - 30, this.name, {
        fontSize: "16px",
        color: "#ffffff", // 'fill' is deprecated,  'color' is the new property
        stroke: "#000000",
        strokeThickness: 4,
        fontFamily: "Arial",
      })
      .setOrigin(0.5, 0.5);

    this.createAnimations(scene);
  }

  private updateNamePosition(): void {
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 30);
    }
  }

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    this.setVelocity(0);

    if (cursors.left.isDown) {
      this.setVelocityX(-320);
      this.anims.play("left", true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(320);
      this.anims.play("right", true);
    } else if (cursors.up.isDown) {
      this.setVelocityY(-320);
      this.anims.play("up", true);
    } else if (cursors.down.isDown) {
      this.setVelocityY(320);
      this.anims.play("down", true);
    } else {
      this.anims.play("turn");
    }

    this.emitPositionUpdate();
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateNamePosition();
  }

  private emitPositionUpdate(): void {
    const { x, y } = this;
    const deltaX = Math.abs(x - this.lastEmittedPosition.x);
    const deltaY = Math.abs(y - this.lastEmittedPosition.y);

    if (deltaX >= 0.5 || deltaY >= 0.5) {
      this.socket.emit("updatePlayer", {
        x,
        y,
        name: this.name,
        animation: this.anims.currentAnim?.key || "turn",
      });
      this.lastEmittedPosition = { x, y };
    }

    setTimeout(() => {
    }, this.updateInterval);
  }

  public destroy(fromScene?: boolean): void {
    if (this.nameText) {
      this.nameText.destroy();
    }
    super.destroy(fromScene);
  }

  private createAnimations(scene: Phaser.Scene): void {
    const frameRate = 10;
    scene.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 0 }],
      frameRate: 20,
    });
    scene.anims.create({
      key: "down",
      frames: scene.anims.generateFrameNumbers("dude", { frames: [0, 4, 8, 12] }),
      frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "up",
      frames: scene.anims.generateFrameNumbers("dude", { frames: [1, 5, 9, 13] }),
      frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "left",
      frames: scene.anims.generateFrameNumbers("dude", { frames: [2, 6, 10, 14] }),
      frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "right",
      frames: scene.anims.generateFrameNumbers("dude", { frames: [3, 7, 11, 15] }),
      frameRate,
      repeat: -1,
    });
  }
}

import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, "dude");
    this.scene = scene;
    this.name = name;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.lastEmittedPosition = { x, y };
    this.canEmit = true;
    this.updateInterval = 500;

    // Create the name text
    this.nameText = scene.add.text(x, y - 30, this.name, {
      fontSize: "16px",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      fontFamily: "Arial",
    });
    this.nameText.setOrigin(0.5, 0.5);

    // Add position update listener
    this.on("positionchange", this.updateNamePosition, this);

    this.createAnimations(scene);
  }

  // Update name position whenever sprite position changes
  updateNamePosition() {
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 30);
    }
  }

  update(cursors, wasd) {
    this.setVelocity(0);

    if (cursors.left.isDown || wasd.A.isDown) {
      this.setVelocityX(-320);
      this.anims.play("left", true);
    } else if (cursors.right.isDown || wasd.D.isDown) {
      this.setVelocityX(320);
      this.anims.play("right", true);
    } else if (cursors.up.isDown || wasd.W.isDown) {
      this.setVelocityY(-320);
      this.anims.play("up", true);
    } else if (cursors.down.isDown || wasd.S.isDown) {
      this.setVelocityY(320);
      this.anims.play("down", true);
    } else {
      this.anims.play("turn");
    }

    this.emitPositionUpdate();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.updateNamePosition();
  }

  emitPositionUpdate() {
    const { x, y } = this;
    const deltaX = Math.abs(x - this.lastEmittedPosition.x);
    const deltaY = Math.abs(y - this.lastEmittedPosition.y);

    if (deltaX >= 0.5 || deltaY >= 0.5) {
      this.scene.socket.emit("updatePlayer", {
        x,
        y,
        name: this.name,
        animation: this.anims.currentAnim?.key || "turn",
      });
      this.lastEmittedPosition = { x, y };
    }

    setTimeout(() => {
      this.canEmit = true;
    }, this.updateInterval);
  }

  destroy(fromScene) {
    this.off("positionchange", this.updateNamePosition, this); // Clean up event listener
    if (this.nameText) {
      this.nameText.destroy();
    }
    super.destroy(fromScene);
  }

  createAnimations(scene) {
    const frameRate = 10;
    // Idle animation
    scene.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 0 }],
      frameRate: 20,
    });
    // Down movement animation
    scene.anims.create({
      key: "down",
      frames: scene.anims.generateFrameNumbers("dude", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: frameRate,
      repeat: -1,
    });
    // Up movement animation
    scene.anims.create({
      key: "up",
      frames: scene.anims.generateFrameNumbers("dude", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: frameRate,
      repeat: -1,
    });
    // Left movement animation
    scene.anims.create({
      key: "left",
      frames: scene.anims.generateFrameNumbers("dude", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: frameRate,
      repeat: -1,
    });
    // Right movement animation
    scene.anims.create({
      key: "right",
      frames: scene.anims.generateFrameNumbers("dude", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: frameRate,
      repeat: -1,
    });
  }
}

import { collisionTiles } from "@/config/collisionTiles";
import Phaser from "phaser";

export const collisionsMap: number[][] = [];
for (let i = 0; i < collisionTiles.length; i += 70) {
  collisionsMap.push(collisionTiles.slice(i, i + 70));
}

export class Boundary extends Phaser.GameObjects.Rectangle {

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 36, 36);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 36);

    this.setFillStyle(0xff0000, 0.4);
    this.setVisible(false);
  }
}

export const createCollisionMap = (scene: Phaser.Scene, mapData: number[][]): Boundary[] => {
  const boundaries: Boundary[] = [];
  mapData.forEach((row, i) => {
    row.forEach((symbol, j) => {
      // Assuming 1 represents a collision tile
      if (symbol !== 0) {
        const boundary = new Boundary(
          scene,
          j * 36 + 18, // x position (centered)
          i * 36 + 18 // y position (centered)
        );
        boundaries.push(boundary);
      }
    });
  });
  return boundaries;
};

import Phaser from "phaser";
import { collisionTiles } from "./collisionTiles";

export const collisionsMap = [];
for (let i = 0; i < collisionTiles.length; i += 70) {
  //map is 70 tiles wide 40 tiles tall
  collisionsMap.push(collisionTiles.slice(i, i + 70));
}

export class Boundary extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 36, 36);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setFillStyle(0xff0000, 0.4);
    this.setVisible(false);
    this.body.setSize(36, 36);
  }
}

export const createCollisionMap = (scene, collisionsMap) => {
  const boundaries = [];
  collisionsMap.forEach((row, i) => {
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

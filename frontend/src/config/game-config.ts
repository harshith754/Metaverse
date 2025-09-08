export const GAME_CONFIG = {
  CAMERA: {
    LERP: 0.2,
    ZOOM: 0.7,
  },
  DIMENSIONS: {
    WIDTH: 800,
    HEIGHT: 500,
  },
  PLAYER: {
    SCALE: 2.5,
    INITIAL_POSITION: {
      x: 1260,
      y: 700,
    },
    NEARBY_THRESHOLD: 120,
  },
  ASSETS: {
    MAP: {
      key: "map",
      path: "assets/mapZ.png",
    },
    PLAYER_SPRITE: {
      key: "dude",
      path: "assets/SpriteSheet.png",
      frameWidth: 16,
      frameHeight: 16,
    },
  },
  TEXT: {
    NAME: {
      style: {
        fontSize: "16px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      },
      yOffset: -30, // Distance above sprite
    },
  },
};

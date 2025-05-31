import React, { useEffect } from "react";
import Phaser from "phaser";

export const GameComponent = ({ config }) => {
  useEffect(() => {
    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, [config]);
  return (
    <div
      id="phaser-container"
      className="border-2 border-solid border-red-700"
    ></div>
  );
};

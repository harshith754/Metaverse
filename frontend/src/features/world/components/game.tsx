import Phaser from "phaser";
import { Socket } from "socket.io-client";
import { Player } from "@/features/player/player";
import { GAME_CONFIG } from "@/config/game-config";
import { createCollisionMap, collisionsMap } from "@/features/world/utils/collision-systems.ts";
import { useEffect, useRef } from "react";

interface GameComponentProps {
  playerName: string;
  socket: Socket | null;
  setNearbyPlayers: React.Dispatch<React.SetStateAction<any[]>>;
  onUpdatePlayers: (players: Record<string, { x: number; y: number; name: string; animation?: string }>) => void;
}

export function Game({ playerName, socket, setNearbyPlayers, onUpdatePlayers }: GameComponentProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!socket || gameRef.current) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: "phaser-container",
      width: GAME_CONFIG.DIMENSIONS.WIDTH,
      height: GAME_CONFIG.DIMENSIONS.HEIGHT,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: {
            x: 0,
            y: 0,
          },
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: new GameScene(socket, playerName, setNearbyPlayers, onUpdatePlayers),
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [playerName, socket, setNearbyPlayers]);

  return (
    <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
      <div id="phaser-container" className="h-auto max-w-[800px] m-auto" />
    </div>
  );
}

class GameScene extends Phaser.Scene {
  private players: Map<string, Player>;
  private currentPlayer: Player | null;
  private socket: Socket | null;
  private boundaries: Phaser.GameObjects.Rectangle[];
  private playerName: string;
  private nearbyPlayers: Set<any>;
  private setNearbyPlayersState: React.Dispatch<React.SetStateAction<any[]>>;
  public map!: Phaser.GameObjects.Image;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private onUpdatePlayersCallback: (
    players: Record<string, { x: number; y: number; name: string; animation?: string }>
  ) => void;

  constructor(
    socket: Socket,
    playerName: string,
    setNearbyPlayers: React.Dispatch<React.SetStateAction<any[]>>,
    onUpdatePlayers: (players: Record<string, { x: number; y: number; name: string; animation?: string }>) => void
  ) {
    super({ key: "GameScene" });

    // Initialize properties
    this.players = new Map();
    this.currentPlayer = null;
    this.socket = socket;
    this.boundaries = [];
    this.playerName = playerName;
    this.nearbyPlayers = new Set();
    this.setNearbyPlayersState = setNearbyPlayers;
    this.onUpdatePlayersCallback = onUpdatePlayers;
  }

  preload() {
    const { ASSETS } = GAME_CONFIG;
    this.load.image(ASSETS.MAP.key, ASSETS.MAP.path);
    this.load.spritesheet(ASSETS.PLAYER_SPRITE.key, ASSETS.PLAYER_SPRITE.path, {
      frameWidth: ASSETS.PLAYER_SPRITE.frameWidth,
      frameHeight: ASSETS.PLAYER_SPRITE.frameHeight,
    });
  }

  create() {
    this.initializeMap();
    this.initializePlayer();
    this.setupCollisions();
    this.setupCamera();
    this.setupControls();

    this.time.addEvent({
      delay: 1000,
      callback: this.checkNearbyPlayers,
      callbackScope: this,
      loop: true,
    });

    if (this.socket) {
      this.socket.on(
        "updatePlayers",
        (playersData: Record<string, { x: number; y: number; name: string; animation?: string }>) => {
          this.updatePlayers(playersData);
          this.onUpdatePlayersCallback(playersData); // Call the callback passed from HomePage
        }
      );
    }
  }

  initializeMap() {
    this.map = this.add.image(0, 0, GAME_CONFIG.ASSETS.MAP.key).setOrigin(0, 0);
    const { width: scaledMapWidth, height: scaledMapHeight } = this.map;
    this.physics.world.setBounds(0, 0, scaledMapWidth, scaledMapHeight);
  }

  initializePlayer() {
    if (!this.socket) return; // Add a guard to ensure socket is not null

    const { PLAYER } = GAME_CONFIG;
    const startX = PLAYER.INITIAL_POSITION.x;
    const startY = PLAYER.INITIAL_POSITION.y;

    this.currentPlayer = new Player(
      this,
      startX,
      startY,
      this.playerName.trim(),
      this.socket // Pass the socket to the player
    );

    this.currentPlayer.scale = PLAYER.SCALE;

    this.socket.emit("playerJoined", {
      name: this.playerName.trim(),
      x: startX,
      y: startY,
    });
  }

  setupCollisions() {
    if (!this.currentPlayer) {
      return;
    }

    this.boundaries = createCollisionMap(this, collisionsMap);
    this.boundaries.forEach((boundary) => {
      this.physics.add.collider(this.currentPlayer!, boundary);
    });
  }

  setupCamera() {
    if (!this.currentPlayer) {
      return;
    }
    const { CAMERA } = GAME_CONFIG;
    this.cameras.main.startFollow(this.currentPlayer, true, CAMERA.LERP, CAMERA.LERP);
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.zoom = CAMERA.ZOOM;
  }

  setupControls() {
    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.wasd = this.input!.keyboard!.addKeys("W,A,S,D") as { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    this.input!.keyboard!.on("keydown-Z", this.toggleBoundaryVisibility, this);
  }

  toggleBoundaryVisibility() {
    this.boundaries.forEach((boundary) => {
      boundary.setVisible(!boundary.visible);
    });
  }

  update() {
    if (this.currentPlayer && this.cursors && this.wasd) {
      this.currentPlayer.update(this.cursors, this.wasd);
    }
  }

  updatePlayers(
    playersData: Record<
      string,
      {
        x: number;
        y: number;
        name: string;
        animation?: string;
      }
    >
  ) {
    if (!this.socket) return;

    for (const id of this.players.keys()) {
      if (!playersData[id]) {
        this.players.get(id)?.destroy();
        this.players.delete(id);
      }
    }

    for (const id in playersData) {
      if (id === this.socket.id) continue;

      // Corrected typo and added default value for animation
      const { x, y, name, animation = "turn" } = playersData[id];
      const existingPlayer = this.players.get(id);

      if (existingPlayer) {
        existingPlayer.setPosition(x, y);
        existingPlayer.anims.play(animation, true);
        console.log(`Updating existing player: 
      ${name} at (${x}, ${y})`); // Log update
      } else {
        const newPlayer = new Player(this, x, y, name || "Player", this.socket);
        newPlayer.scale = GAME_CONFIG.PLAYER.SCALE;
        newPlayer.anims.play(animation, true);
        this.players.set(id, newPlayer);
        console.log(`Creating new player: ${name} 
      at (${x}, ${y}) with animation: ${animation}`); //
      }
    }
  }

  checkNearbyPlayers() {
    if (!this.currentPlayer) return;

    this.nearbyPlayers.clear();

    for (const [id, player] of this.players.entries()) {
      if (player === this.currentPlayer) continue;

      const overlapThreshold = GAME_CONFIG.PLAYER.NEARBY_THRESHOLD;

      const distance = Phaser.Math.Distance.Between(this.currentPlayer.x, this.currentPlayer.y, player.x, player.y);

      if (distance <= overlapThreshold) {
        this.nearbyPlayers.add({
          id,
          name: player.name || "Unknown",
          distance: distance.toFixed(2),
        });
      }
    }

    this.updateNearbyPlayersState();
  }

  updateNearbyPlayersState() {
    if (this.setNearbyPlayersState) {
      const nearbyPlayersArray = Array.from(this.nearbyPlayers);
      this.setNearbyPlayersState(nearbyPlayersArray);
    }
  }
}

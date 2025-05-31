import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Player } from "../components/PlayerClass";
import {
  createCollisionMap,
  collisionsMap,
} from "../components/CollisionSystems.js";
import useSocket from "../hooks/useSocket";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { OnlinePlayers } from "../components/OnlinePlayers";
import { ChatInterface } from "../components/ChatInterface";
import { GAME_CONFIG } from "../components/gameConfig";
import { NearbyPlayersDisplay } from "../components/NearbyPlayers";

class GameScene extends Phaser.Scene {
  constructor(socket, playerName, setNearbyPlayers) {
    super({ key: "GameScene" });
    this.players = new Map();
    this.playerTexts = new Map();
    this.currentPlayer = null;
    this.currentPlayerText = null;
    this.socket = socket;
    this.boundaries = [];
    this.playerName = playerName;
    this.nearbyPlayers = new Set();
    this.setNearbyPlayersState = setNearbyPlayers;
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
  }

  initializeMap() {
    this.map = this.add.image(0, 0, GAME_CONFIG.ASSETS.MAP.key).setOrigin(0, 0);
    const { width: scaledMapWidth, height: scaledMapHeight } = this.map;
    this.physics.world.setBounds(0, 0, scaledMapWidth, scaledMapHeight);
  }

  initializePlayer() {
    const { PLAYER } = GAME_CONFIG;

    const startX = PLAYER.INITIAL_POSITION.x;
    const startY = PLAYER.INITIAL_POSITION.y;

    this.currentPlayer = new Player(
      this,
      startX,
      startY,
      this.playerName.trim()
    );

    this.currentPlayer.scale = PLAYER.SCALE;
    this.currentPlayer.setCollideWorldBounds(true);

    this.socket.emit("playerJoined", {
      name: this.playerName.trim(),
      x: startX,
      y: startY,
    });
  }

  setupCollisions() {
    this.boundaries = createCollisionMap(this, collisionsMap);
    this.boundaries.forEach((boundary) => {
      this.physics.add.collider(this.currentPlayer, boundary);
    });
  }

  setupCamera() {
    const { CAMERA } = GAME_CONFIG;
    this.cameras.main.startFollow(
      this.currentPlayer,
      true,
      CAMERA.LERP,
      CAMERA.LERP
    );
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.zoom = CAMERA.ZOOM;
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on(
      "keydown-D",
      this.toggleBoundaryVisibility.bind(this)
    );
  }

  toggleBoundaryVisibility() {
    this.boundaries.forEach((boundary) => {
      boundary.setVisible(!boundary.visible);
    });
  }

  update() {
    this.currentPlayer.update(this.cursors);
  }

  updatePlayers(playersData) {
    if (!playersData) return;

    for (const id of this.players.keys()) {
      if (!playersData[id]) {
        this.players.get(id).destroy();
        this.players.delete(id); // Properly remove from the Map
      }
    }

    for (const id in playersData) {
      if (id === this.socket?.id) continue;

      const { x, y, name } = playersData[id];

      if (this.players.has(id)) {
        this.players.get(id).setPosition(x, y);
      } else {
        const newPlayer = new Player(this, x, y, name || "Player");
        newPlayer.scale = GAME_CONFIG.PLAYER.SCALE;
        this.players.set(id, newPlayer);
      }
    }
  }

  checkNearbyPlayers() {
    this.nearbyPlayers.clear();

    for (const [id, player] of this.players.entries()) {
      if (player === this.currentPlayer) continue;

      const overlapThreshold = 120;

      const distance = Phaser.Math.Distance.Between(
        this.currentPlayer.x,
        this.currentPlayer.y,
        player.x,
        player.y
      );

      if (distance <= overlapThreshold) {
        this.nearbyPlayers.add({
          id,
          name: player.name || "Unknown",
          distance: distance.toFixed(2),
        });
      }
    }
    if (this.nearbyPlayers.size === 1) {
      console.log(this.nearbyPlayers);
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

export const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [name, setName] = useState("");
  const gameRef = useRef(null);
  const navigate = useNavigate();

  const { socket, onEvent } = useSocket();
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [nearbyPlayers, setNearbyPlayers] = useState([]);

  useEffect(() => {
    const storedCredentials = sessionStorage.getItem("userCredentials");
    if (storedCredentials) {
      const { name } = JSON.parse(storedCredentials);
      setName(name);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!socket || !name) return;
    const config = {
      type: Phaser.AUTO,
      parent: "phaser-container",
      width: GAME_CONFIG.DIMENSIONS.WIDTH,
      height: GAME_CONFIG.DIMENSIONS.HEIGHT,
      scene: new GameScene(socket, name, setNearbyPlayers),
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.DIMENSIONS.WIDTH,
        height: GAME_CONFIG.DIMENSIONS.HEIGHT,
      },
    };
    gameRef.current = new Phaser.Game(config);
    return () => {
      gameRef.current?.destroy(true);
    };
  }, [socket, name, setNearbyPlayers]);

  useEffect(() => {
    if (!socket) return;
    const offUpdatePlayers = onEvent("updatePlayers", (players) => {
      const filteredPlayers = filterCurrentPlayer(players, socket.id);
      gameRef.current?.scene
        .getScene("GameScene")
        ?.updatePlayers(filteredPlayers);
      const onlinePlayersList = Object.entries(filteredPlayers).map(
        ([id, { name }]) => ({ id, name })
      );
      setOnlinePlayers(onlinePlayersList);
    });
    const offChatMessage = onEvent("chatMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: data.from,
          to: data.to,
          message: data.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      if (activeChat !== data.from) {
        toast(`Message recieved from ${data.from}`, { duration: 2000 });
      }
    });
    return () => {
      if (offUpdatePlayers) offUpdatePlayers();
      if (offChatMessage) offChatMessage();
    };
  }, [socket, onEvent, activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && activeChat) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: name,
          to: activeChat,
          message: inputValue,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      socket.emit("chatMessage", {
        to: activeChat,
        from: name,
        message: inputValue,
      });
      setInputValue(""); // Clears the input field
    }
  };
  return (
    <div className="flex flex-col h-screen bg-neutral-200 p-4">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
        Metaverse Project
      </h1>

      <div className="flex-1 flex gap-4">
        {/* Player List & Chat Buttons */}
        <div className="w-48 flex flex-col gap-2 mx-4 ">
          <OnlinePlayers
            onlinePlayers={onlinePlayers}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
          />
          <NearbyPlayersDisplay
            nearbyPlayers={nearbyPlayers}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
          />
        </div>

        {/* Game Container */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div id="phaser-container" className="w-full h-full" />
        </div>

        {/* Chat Interface */}
        <div className="w-72 h-[500px]">
          <ChatInterface
            name={name}
            activeChat={activeChat}
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {name !== "" && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Connected as: {name}
        </div>
      )}
    </div>
  );
};

const filterCurrentPlayer = (players, currentId) => {
  return Object.entries(players).reduce((acc, [id, data]) => {
    if (id !== currentId) {
      acc[id] = data;
    }
    return acc;
  }, {});
};

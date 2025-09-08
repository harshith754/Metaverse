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
import { GAME_CONFIG } from "../components/gameConfig";

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
    this.wasd = null;
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
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.input.keyboard.on(
      "keydown-Z",
      this.toggleBoundaryVisibility.bind(this)
    );
  }

  toggleBoundaryVisibility() {
    this.boundaries.forEach((boundary) => {
      boundary.setVisible(!boundary.visible);
    });
  }

  update() {
    this.currentPlayer.update(this.cursors, this.wasd);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Metaverse Project
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">Live</span>
              </div>
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-4">
              <div className="text-white/80 text-sm">
                <span className="text-purple-300">Connected as:</span>
                <span className="ml-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 font-medium">
                  {name || "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Players & Controls */}
            <div className="w-70 space-y-4">
              {/* Online Players */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-semibold text-base">
                    Online Explorers
                  </h3>
                  <span className="text-purple-300 text-xs">
                    ({onlinePlayers.length})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {onlinePlayers.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => setActiveChat(player.name)}
                      className={`px-2 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer group ${
                        activeChat === player.name
                          ? "bg-purple-500/30 border-purple-400/50 shadow-md"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-white text-xs font-medium group-hover:text-purple-200 transition-colors truncate">
                          {player.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Players */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-semibold text-lg">Nearby</h3>
                  <span className="text-yellow-300 text-sm">
                    ({nearbyPlayers.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {nearbyPlayers.length > 0 ? (
                    nearbyPlayers.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => setActiveChat(player.name)}
                        className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-400/30 cursor-pointer hover:bg-yellow-500/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {player.name.charAt(0)}
                            </div>
                            <span className="text-white text-sm font-medium group-hover:text-yellow-200">
                              {player.name}
                            </span>
                          </div>
                          <span className="text-yellow-300 text-xs">
                            {player.distance}m
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/60 text-sm text-center py-4">
                      No explorers nearby
                    </div>
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-white font-semibold text-lg mb-4">
                  Controls
                </h3>
                <div className="space-y-2 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
                      WASD
                    </span>
                    <span>Move around</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
                      Z
                    </span>
                    <span>Toggle boundaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
                      Click
                    </span>
                    <span>Chat with players</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Container */}
            <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden">
                <div
                  id="phaser-container"
                  className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl"
                />
              </div>
            </div>

            {/* Right Sidebar - Chat */}
            <div className="w-80">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {activeChat ? activeChat.charAt(0) : "💬"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {activeChat || "Select a player to chat"}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {activeChat ? "Online now" : "Click on a player name"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages
                    .filter(
                      (msg) => msg.from === activeChat || msg.to === activeChat
                    )
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.from === name ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.from === name
                              ? "bg-purple-500/80 text-white"
                              : "bg-white/20 text-white border border-white/20"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  {(!activeChat ||
                    messages.filter(
                      (msg) => msg.from === activeChat || msg.to === activeChat
                    ).length === 0) && (
                    <div className="text-center text-white/60 text-sm py-8">
                      {activeChat
                        ? `Start a conversation with ${activeChat}`
                        : "Select a player to start chatting"}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {activeChat && (
                  <div className="p-4 border-t border-white/20">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Message ${activeChat}...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage(e)
                        }
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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

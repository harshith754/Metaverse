import React, { useEffect, useState } from "react";

import { useSocket } from "@/providers/socket-provider";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Game } from "@/features/world/components/game";
import { PlayerLists } from "@/features/player/components/player-lists";
import { ChatInterface } from "@/features/chat/components/chat-interface";
import type { Message } from "@/features/chat/types";
import type { PlayerInfo } from "@/features/player/types";
import { Header } from "@/components/layout/header";

type NearbyPlayer = {
  id: string;
  name: string;
  distance: string;
};

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  // --- State Management ---
  const [inputValue, setInputValue] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerInfo[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([]);

  const router = useRouter();
  const { socket } = useSocket();

  const handleUpdatePlayers = (players: Record<string, { x: number; y: number; name: string }>) => {
    const playersList = Object.entries(players).map(([id, { name }]) => ({ id, name }));
    setOnlinePlayers(playersList);
  };

  // --- Effects ---
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem("userCredentials");
    if (storedCredentials) {
      const { name } = JSON.parse(storedCredentials);
      setName(name);
    } else {
      router.navigate({ to: "/login" });
    }
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: { from: string; to: string; message: string }) => {
      const newMessage: Message = {
        id: Date.now(),
        from: data.from,
        to: data.to,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("updatePlayers", handleUpdatePlayers);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("updatePlayers", handleUpdatePlayers);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [socket, handleUpdatePlayers]);

  // --- Handlers ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && activeChat) {
      const newMessage: Message = {
        id: Date.now(),
        from: name,
        to: activeChat,
        message: inputValue,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // TODO: Re-implement socket emit
      // socket?.emit('chatMessage', { ... });

      setInputValue(""); // Clear the input field;
    }
  };

  // --- Render ---
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <Header name={name} />

        {/* Main Game Area */}
        <div className="relative z-10 px-6 pb-6">
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            <div className="flex flex-col gap-6">
              <PlayerLists
                onlinePlayers={onlinePlayers}
                nearbyPlayers={nearbyPlayers}
                activeChat={activeChat}
                onPlayerClick={setActiveChat}
              />
              <ChatInterface
                activeChat={activeChat}
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                currentUser={name}
              />
            </div>

            <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden relative group">
              <Game
                playerName={name}
                socket={socket}
                setNearbyPlayers={setNearbyPlayers}
                onUpdatePlayers={handleUpdatePlayers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

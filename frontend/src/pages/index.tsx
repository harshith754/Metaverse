import { useState } from "react";
import { useUserSession } from "@/hooks/use-user-session";
import { useSocketEvents } from "@/hooks/use-socket-events";
import { usePlayerUpdates } from "@/hooks/use-player-updates";
import { useChatState } from "@/hooks/use-chat-state";

import { useSocket } from "@/providers/socket-provider";
import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/features/world/components/game";
import { PlayerLists } from "@/features/player/components/player-lists";
import { ChatInterface } from "@/features/chat/components/chat-interface";
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
  const [name, setName] = useState<string>("");

  const [onlinePlayers, setOnlinePlayers] = useState<PlayerInfo[]>([]);
  const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([]);

  const { socket } = useSocket();

  const { inputValue, setInputValue, messages, setMessages, activeChat, setActiveChat, handleSendMessage } =
    useChatState({ name, socket });

  const { handleUpdatePlayers } = usePlayerUpdates({ setOnlinePlayers });

  useUserSession({ setName });

  useSocketEvents({ socket, setMessages, onUpdatePlayers: handleUpdatePlayers });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden mx-auto">
      <Header name={name} />

      {/* Main Game Area */}
      <div className="relative z-10 px-6 pb-6 mx-auto max-w-7xl">
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

          <Game
            playerName={name}
            socket={socket}
            setNearbyPlayers={setNearbyPlayers}
            onUpdatePlayers={handleUpdatePlayers}
          />
        </div>
      </div>
    </div>
  );
}

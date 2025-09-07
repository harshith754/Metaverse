import { useEffect } from "react";
import { Socket } from "socket.io-client";
import type { Message } from "@/features/chat/types";

interface UseSocketEventsProps {
  socket: Socket | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onUpdatePlayers: (players: Record<string, { x: number; y: number; name: string }>) => void;
}

export const useSocketEvents = ({ socket, setMessages, onUpdatePlayers }: UseSocketEventsProps) => {
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

    socket.on("updatePlayers", onUpdatePlayers);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("updatePlayers", onUpdatePlayers);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [socket, setMessages, onUpdatePlayers]);
};

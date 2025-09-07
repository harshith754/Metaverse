import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// We will define our event types here for now.
// Later, we can move them to a central 'types' folder.
interface ServerToClientEvents {
  updatePlayers: (players: Record<string, { x: number; y: number; name: string; animation: string }>) => void;
  chatMessage: (data: { from: string; to: string; message: string }) => void;
}

interface ClientToServerEvents {
  playerJoined: (data: { name: string; x: number; y: number }) => void;
  updatePlayer: (data: { x: number; y: number; name: string; animation: string }) => void;
  chatMessage: (data: { to: string; from: string; message: string }) => void;
}

// Define the shape of the context
interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

// Create the context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Create a custom hook that components can use to access the socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// Create the provider component
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the server. Replace with your actual server URL.
    // The VITE_SERVER_URL comes from a .env file.
    const socketInstance = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected!");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected.");
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
};

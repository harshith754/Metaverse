import { useCallback } from "react";
import type { Message } from "@/features/chat/types";
import { Socket } from "socket.io-client";

interface UseChatMessageSenderProps {
  inputValue: string;
  activeChat: string | null;
  name: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  socket: Socket | null; // Add socket as a prop for future implementation
}

export const useChatMessageSender = ({
  inputValue,
  activeChat,
  name,
  setMessages,
  setInputValue,
  socket,
}: UseChatMessageSenderProps) => {
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
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
    },
    [inputValue, activeChat, name, setMessages, setInputValue, socket] // Add socket to dependencies
  );

  return { handleSendMessage };
};

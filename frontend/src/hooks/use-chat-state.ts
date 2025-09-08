import { useState, useCallback } from 'react';
import type { Message } from '@/features/chat/types';


import { Socket } from 'socket.io-client';

interface UseChatStateProps {
  name: string;
  socket: Socket | null;
}

export const useChatState = ({ name, socket }: UseChatStateProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

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

                socket?.emit('chatMessage', {
          from: name,
          to: activeChat,
          message: inputValue,
        });

        setInputValue("");
      }
    },
    [inputValue, activeChat, name, setMessages, setInputValue, socket]
  );

  return {
    inputValue,
    setInputValue,
    messages,
    setMessages,
    activeChat,
    setActiveChat,
    handleSendMessage,
  };
};

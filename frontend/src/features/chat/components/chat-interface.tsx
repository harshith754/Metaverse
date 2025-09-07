import React from "react";
import type { Message } from "../types";

interface ChatInterfaceProps {
  activeChat: string | null;
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  currentUser: string;
}

export function ChatInterface({
  activeChat,
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  currentUser,
}: ChatInterfaceProps) {
  return (
    <div className="w-80">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 h-full flex  flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b  border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{activeChat ? activeChat.charAt(0) : "💬"}</span>
            </div>
            <div>
              <h3 className="text-white  font-semibold">{activeChat || "Select a player to    chat"}</h3>
              <p className="text-white/60 text-sm">{activeChat ? "Online now" : "Click on a player name"}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages
            .filter((msg) => msg.from === activeChat || msg.to === activeChat)
            .map((msg) => (
              <div key={msg.id} className={`flex   ${msg.from === currentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2  rounded-2xl ${
                    msg.from === currentUser
                      ? "bg-purple-500/80   text-white"
                      : "bg-white/20 text-white   border border-white/20"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          {(!activeChat || messages.filter((msg) => msg.from === activeChat || msg.to === activeChat).length === 0) && (
            <div className="text-center  text-white/60 text-sm py-8">
              {activeChat ? `Start a conversation with ${activeChat}` : "Select a player to start chatting"}
            </div>
          )}
        </div>

        {/* Message Input */}
        {activeChat && (
          <div className="p-4 border-t border-white/20">
            <form onSubmit={onSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={`Message  ${activeChat}...`}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                className="flex-1 px-4 py-2  bg-white/10 border border-white/20 rounded-xl  text-white placeholder-white/60 focus:outline-none focus:border-purple-400 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500  text-white rounded-xl hover:from-purple-600  hover:to-blue-600 transition-all duration-300  font-medium"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

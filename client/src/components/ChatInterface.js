import React from "react";

export const ChatInterface = ({
  name,
  activeChat,
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
}) => {
  return (
    <div className=" bg-white rounded-lg shadow-lg flex flex-col">
      <div className="w-72 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            {activeChat ? `Chat with ${activeChat}` : "Select a player to chat"}
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages
            .filter(
              (msg) =>
                (msg.from === name && msg.to === activeChat) ||
                (msg.from === activeChat && msg.to === name)
            )
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.from === name ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.from === name
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t ">
          <div className="flex gap-2">
            <input
              type="text"
              name="message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                activeChat ? "Type a message..." : "Select a player first"
              }
              disabled={!activeChat}
              className="w-[70%] flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!activeChat}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

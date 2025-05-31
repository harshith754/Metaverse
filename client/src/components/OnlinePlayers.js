import React from "react";

export const OnlinePlayers = ({ onlinePlayers, activeChat, setActiveChat }) => {
  return (
    <div className="h-[50%] bg-white rounded-lg shadow-lg p-4">
      <h2 className="font-semibold mb-4">Online Players</h2>
      <div className="space-y-2">
        {onlinePlayers.map((player) => (
          <button
            key={player.id}
            className={`w-full px-3 py-2 text-left rounded-md`}
          >
            {player.name}
          </button>
        ))}
      </div>
    </div>
  );
};

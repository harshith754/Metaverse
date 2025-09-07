import type { NearbyPlayer, PlayerInfo } from "../types";

interface PlayerListsProps {
  onlinePlayers: PlayerInfo[];
  nearbyPlayers: NearbyPlayer[];
  activeChat: string | null;
  onPlayerClick: (name: string) => void;
}

export function PlayerLists({ onlinePlayers, nearbyPlayers, activeChat, onPlayerClick }: PlayerListsProps) {
  return (
    <div className="w-80 space-y-4">
      {/* Online Players */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
        <div className="flex items-center gap-2  mb-3">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold text-base">Online Explorers</h3>
          <span className="text-purple-300  text-xs">({onlinePlayers.length})</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {onlinePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => onPlayerClick(player.name)}
              className={`px-2 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer  group ${
                activeChat === player.name
                  ? "bg-purple-500/30 border-purple-400/50 shadow-md"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6   bg-gradient-to-br from-purple-400 to-blue-400   rounded-full flex items-center justify-center  text-white text-[10px] font-bold">
                  {player.name.charAt(0)}
                </div>
                <span className="text-white   text-xs font-medium group-hover:text-purple-200   transition-colors truncate">
                  {player.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Players */}
      <div className="bg-white/10 backdrop-blur-xl  rounded-2xl border border-white/20 p-6">
        <div className="flex items-center gap-2   mb-4">
          <div className="w-3 h-3 bg-yellow-400   rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold  text-lg">Nearby</h3>
          <span className="text-yellow-300  text-sm">({nearbyPlayers.length})</span>
        </div>
        <div className="space-y-2">
          {nearbyPlayers.length > 0 ? (
            nearbyPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.name)}
                className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-400/30   cursor-pointer hover:bg-yellow-500/30   transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400   rounded-full flex items-center justify-center   text-white text-xs font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <span className="text-white text-sm font-medium group-hover:text-yellow-200">{player.name}</span>
                  </div>
                  <span className="text-yellow-300 text-xs">{player.distance}m</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/60 text-sm text-center py-4">No explorers nearby</div>
          )}
        </div>
      </div>
    </div>
  );
}

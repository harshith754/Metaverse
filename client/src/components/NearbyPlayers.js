export const NearbyPlayersDisplay = ({
  nearbyPlayers,
  activeChat,
  setActiveChat,
}) => {
  return (
    <div className="h-[30%] bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-semibold mb-4">Nearby Players:</h3>
      <div className="">
        {nearbyPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => setActiveChat(player.name)}
            className={`w-full px-3 py-2 text-left rounded-md transition-colors ${
              activeChat === player.name
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
            {player.name}
          </button>
        ))}
      </div>
    </div>
  );
};

interface HeaderProps {
  name: string;
}

export function Header({ name }: HeaderProps) {
  return (
    <div className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Metaverse Project
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-4">
            <div className="text-white/80 text-sm">
              <span className="text-purple-300">Connected as:</span>
              <span className="ml-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 font-medium">
                {name || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

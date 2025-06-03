import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Login = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // const [activePlayerCount] = useState(Math.floor(Math.random() * 5000) + 8000); // Simulated count

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 15) {
      toast.error("Name must be between 2 and 15 characters");
      return;
    }

    setIsLoading(true);

    sessionStorage.setItem(
      "userCredentials",
      JSON.stringify({
        name: trimmedName,
        timestamp: Date.now(),
      })
    );
    
    toast.success(`Welcome, ${trimmedName}!`);
    navigate("/", {
      state: {
        name: trimmedName,
      },
    });
    setIsLoading(false);
  };

  // Floating particles animation
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden"
      style={{
        backgroundImage: "url('/img/about.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/80 to-indigo-900/70 animate-pulse" 
           style={{ animationDuration: '4s' }} />
      
      <FloatingParticles />
      
      {/* Live player counter */}
      {/* <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md rounded-full px-4 py-2 text-white border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">{activePlayerCount.toLocaleString()} explorers online</span>
        </div>
      </div> */}

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col md:flex-row overflow-hidden max-w-4xl w-full mx-4 relative group hover:shadow-3xl transition-all duration-500">
        
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        
        {/* Info Section */}
        <div className="md:w-1/2 p-8 pt-8 flex flex-col justify-center bg-gradient-to-br from-purple-600/90 to-blue-500/90 backdrop-blur-sm text-white max-h-[32rem] overflow-auto relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Welcome to the Metaverse Project
            </h1>
            
            <p className="mb-6 text-lg leading-relaxed opacity-90">
              Step into a <span className="font-semibold text-yellow-300">multiplayer virtual world</span>! 
              Move around, chat with nearby players, and experience a revolutionary kind of online interaction.
            </p>

            <div className="mb-6">
              <p className="font-semibold text-xl mb-4 text-yellow-300">✨ Features:</p>
              <div className="space-y-3">
                {[
                  { icon: "🌍", text: "Real-time multiplayer map", highlight: "Live" },
                  { icon: "💬", text: "Proximity-based chat", highlight: "Smart" },
                  { icon: "🎭", text: "Customizable avatars", highlight: "Coming Soon!" }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="flex-1">{feature.text}</span>
                    <span className="text-xs px-2 py-1 bg-yellow-400/20 rounded-full text-yellow-300 font-semibold">
                      {feature.highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <img
                src="/img/gallery-5.webp"
                alt="Virtual World Preview"
                className="rounded-xl shadow-2xl mt-4 max-h-48 object-cover w-full border border-white/30 group-hover:scale-105 transition-transform duration-500"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">Preview of your virtual adventure</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white/95 backdrop-blur-sm relative">
          <div className="relative z-10">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Enter the Metaverse
                </h2>
                <p className="text-gray-600 text-sm">Join thousands of explorers in this virtual realm</p>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter your explorer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-300 text-lg group-hover:border-purple-300 bg-white/80 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entering Metaverse...
                    </>
                  ) : (
                    <>
                      🚀 Enter the Metaverse!
                    </>
                  )}
                </span>
              </button>

              {/* Additional info */}
              <div className="text-center space-y-2 pt-4">
                <p className="text-xs text-gray-500">
                  ✅ Works on any website • 🔒 No registration required
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span>🎮 Instant play</span>
                  <span>👥 Social features</span>
                  <span>🌟 Regular updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
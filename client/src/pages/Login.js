import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Login = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 15) {
      toast.error("Name must be between 2 and 15 characters");
      return;
    }

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
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200"
      style={{
        backgroundImage: "url('/img/about.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden max-w-3xl w-full">
        {/* Info Section */}
        <div className="md:w-1/2 p-8 pt-20 flex flex-col justify-center bg-gradient-to-br from-purple-500 to-blue-400 text-white max-h-[32rem] overflow-auto">
          <h1 className="text-2xl font-bold mb-4 mt-15">
            Welcome to the Metaverse Project
          </h1>
          <p className="mb-2 text-lg">
            Step into a multiplayer virtual world! Move around, chat with nearby
            players, and experience a new kind of online interaction.
            <br />
            <span className="font-semibold">Features:</span>
            <ul className="list-disc ml-6 mt-2">
              <li>Real-time multiplayer map</li>
              <li>Proximity-based chat</li>
              <li>Customizable avatars (coming soon!)</li>
            </ul>
          </p>
          <img
            src="/img/gallery-5.webp"
            alt="Virtual World"
            className="rounded-lg shadow-lg mt-4 max-h-48 object-cover"
          />
        </div>
        {/* Login Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Enter the Metaverse!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

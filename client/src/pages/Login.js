import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Login = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 15) {
      toast.error("Name must be between 2 and 15 characters");
      return;
    }

    // Store user credentials in localStorage for persistence
    localStorage.setItem(
      "userCredentials",
      JSON.stringify({
        name: trimmedName,
        timestamp: Date.now(),
      })
    );

    // Show success toast and navigate
    toast.success(`Welcome, ${trimmedName}!`);
    navigate("/", {
      state: {
        name: trimmedName,
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-200 p-4">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
        Metaverse Project
      </h1>
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl ">
        <form onSubmit={handleSubmit} className="space-y-4 m-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter your name to join
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
              minLength={2}
              maxLength={15}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};

const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const PORT = 5000;

// Create an HTTP server with Express
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let logs = [];

let players = {};

io.on("connection", (socket) => {
  logs.push(`User connected: ${socket.id}`);

  players[socket.id] = {
    x: 1290,
    y: 700,
  };

  io.emit("updatePlayers", players); //emit to all players

  socket.on("updatePlayers", (position) => {
    // Update the player's position
    players[socket.id] = position;

    // Emit updated player positions to all clients
    io.emit("updatePlayers", players);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const disconnectMsg = `User disconnected: ${socket.id}`;
    delete players[socket.id];
    io.emit("updatePlayers", players); //emit to all players

    logs.push(disconnectMsg);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.get("/", (req, res) => {
  const logHtml = logs.map((log) => `<p>${log}</p>`).join("");
  res.send(`
    <h1>Server Logs</h1>
    ${logHtml}
    ${JSON.stringify(players)}
  `);
});

server.listen(PORT, () => {
  const startMsg = `Server is running on http://localhost:${PORT}`;
  logs.push(startMsg);
});

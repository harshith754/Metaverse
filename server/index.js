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
  console.log(`User connected: ${socket.id}`);

  socket.on("playerJoined", (playerData) => {
    players[socket.id] = {
      name: playerData.name,
      x: playerData.x,
      y: playerData.y,
    };

    console.log("New player joined:", players[socket.id]);
    io.emit("updatePlayers", players);
  });

  socket.on("updatePlayer", (playerData) => {
    players[socket.id] = {
      name: playerData.name,
      x: playerData.x,
      y: playerData.y,
    };

    io.emit("updatePlayers", players);
  });

  socket.on("chatMessage", (data) => {
    // Find the socket ID of the recipient
    const recipientSocket = Object.entries(players).find(
      ([_, player]) => player.name === data.to
    );

    if (recipientSocket) {
      // Send message to recipient
      io.to(recipientSocket[0]).emit("chatMessage", {
        from: data.from,
        to: data.to,
        message: data.message,
      });
    }
  });
  socket.on("disconnect", () => {
    const disconnectMsg = `User disconnected: ${socket.id}`;
    console.log("Player disconnected:", players[socket.id]);

    delete players[socket.id];
    io.emit("updatePlayers", players);
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
  res.send(`
    <h1>Server Logs</h1>
    <h2>Connected Players:</h2>
    <pre>${JSON.stringify(players, null, 2)}</pre>
    <h2>Server Logs:</h2>
    ${logs.map((log) => `<p>${log}</p>`).join("")}
  `);
});

server.listen(PORT, () => {
  const startMsg = `Server is running on http://localhost:${PORT}`;
  logs.push(startMsg);
  console.log(startMsg);
});

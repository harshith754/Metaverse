# Metaverse Project Server

This is the backend server for the Metaverse Project. It is built with Node.js, Express, and Socket.IO.

## Features
- Real-time multiplayer support using Socket.IO
- REST API endpoints
- CORS enabled
- Player management and chat functionality

## Requirements
- Node.js (v14 or higher recommended)
- npm

## Installation
1. Navigate to the `server` directory:
   ```powershell
   cd c:\Users\Harshith\Desktop\metaverse-project\server
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```

## Running the Server
Start the server with Node.js:
```powershell
node index.js
```
Or use nodemon for automatic restarts:
```powershell
npx nodemon index.js
```

The server will run at [http://localhost:5000](http://localhost:5000).

## API Endpoints
- `GET /api/message` — Returns a hello message from the server.
- `GET /` — Shows connected players and server logs.

## WebSocket Events
- `playerJoined` — Add a new player
- `updatePlayer` — Update player position
- `chatMessage` — Send a chat message

## License
MIT
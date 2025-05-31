# Metaverse Project

This project is a real-time multiplayer metaverse application with chat, player movement, and map-based navigation. It consists of a React/Phaser frontend and a Node.js/Express/Socket.IO backend, with user authentication and chat persistence using Prisma and PostgreSQL.

## Tech Stack

### Frontend

- React (Create React App)
- Phaser (2D game engine)
- Tailwind CSS (utility-first CSS framework)
- socket.io-client (WebSocket communication)
- Map created using [Tiled](https://www.mapeditor.org/) and imported as assets

### Backend

- Node.js & Express (REST API and WebSocket server)
- Socket.IO (real-time multiplayer communication)
- Prisma ORM (database access)
- PostgreSQL (database)
- Deployed on [Render](https://render.com)

## Features

- Real-time multiplayer player movement and chat
- User authentication and persistent chat (Prisma + PostgreSQL)
- Map navigation and collision detection (Phaser, Tiled, custom collision system)
- Modern UI with Tailwind CSS
- REST API endpoints for server health and player info

## Technical Architecture

```
+-------------------+        WebSocket/REST        +-------------------+
|    React/Phaser   | <-------------------------> |   Node.js/Express |
|  (Frontend, SPA)  |                            |  (Backend API)    |
+-------------------+                            +-------------------+
         |                                                |
         | REST/WS                                        |
         v                                                v
+-------------------+                            +-------------------+
|   socket.io-client|                            |   Socket.IO       |
+-------------------+                            +-------------------+
         |                                                |
         v                                                v
+-------------------+                            +-------------------+
|   Phaser Engine   |                            |   Prisma ORM      |
+-------------------+                            +-------------------+
         |                                                |
         v                                                v
+-------------------+                            +-------------------+
|   Tiled Map       |                            |   PostgreSQL DB   |
+-------------------+                            +-------------------+
```

## Map Creation

- The game map was designed using [Tiled](https://www.mapeditor.org/), exported as an image, and collision data was manually encoded in the codebase for efficient collision detection.

## Running Locally

### Backend

```sh
cd server
npm install
node index.js
```

### Frontend

```sh
cd client
npm install
npm start
```

## Deployment

- The backend is deployed on [Render](https://render.com)

## License

MIT

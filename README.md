# Chat WebSocket Application

A real-time chat application built with React frontend and Express/WebSocket backend, featuring persistent message storage with Redis.

## Overview

This is a full-stack chat application that enables real-time messaging between multiple users. The frontend provides a professional, modern UI for chatting, while the backend handles WebSocket connections, message routing, and persistent storage using Redis.

## Features

- ✨ **Real-time Messaging**: Instant message delivery using WebSocket connections
- 🔄 **Message Persistence**: All messages are stored in Redis for history retrieval
- 👥 **Multi-User Support**: Multiple users can connect and chat simultaneously
- 🎨 **Modern UI**: Professional chat interface with smooth animations and gradients
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔌 **Connection Status**: Live visual indicator of connection state
- 💾 **Message History**: Load previous messages on connection

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool with HMR
- **CSS3** - Modern styling with animations

### Backend
- **Express.js** - HTTP server and REST API
- **WebSocket (ws library)** - Real-time bidirectional communication
- **Redis** - Message persistence and pub/sub
- **Node.js** - Runtime environment
- **CORS** - Cross-origin resource handling

## Project Structure

```
chat-ws/
├── src/                    # Frontend React application
│   ├── App.tsx            # Main chat component
│   ├── App.css            # Chat styling
│   ├── main.tsx           # React entry point
│   ├── index.css          # Global styles
│   └── assets/            # Static assets
├── server/                # Backend Express/WebSocket server
│   ├── index.ts           # Main server file
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── redis/             # Redis client configuration
│   │   └── index.ts
│   └── client-test.ts     # WebSocket client test utility
├── public/                # Static files
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── eslint.config.js       # ESLint rules
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Redis server running locally or remotely

### Setup

1. **Clone the repository**
   ```bash
   cd chat-ws
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```
   PORT=8080
   REDIS_URL=redis://localhost:6379
   ```

## Usage

### Development

**Terminal 1 - Start the backend server**
```bash
npm run server
```
The WebSocket and HTTP server will start on port 8080.

**Terminal 2 - Start the frontend dev server**
```bash
npm run dev
```
The React app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Production files will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Endpoints

### REST API

- **GET `/messages`** - Retrieve chat history
  - Query Parameters:
    - `chatroom` (optional, default: "chatroom1") - Specific chatroom to fetch messages from
  - Response: Array of message objects

### WebSocket Events

The WebSocket server communicates using JSON messages with the following structure:

**Client → Server (Send Message)**
```json
{
  "message": "Hello, world!",
  "screenName": "John",
  "chatroom": "chatroom1"
}
```

**Server → Client (Receive Message)**
```json
{
  "message": "Hello, world!",
  "screenName": "John",
  "chatroom": "chatroom1"
}
```

## Features in Detail

### Message Persistence
Messages are stored in Redis using the `lPush` command under the key `{chatroom}-history`. When users connect, they can retrieve all previous messages via the `/messages` endpoint.

### Real-time Sync
Using Redis pub/sub, messages published to a chatroom channel are instantly delivered to all connected clients for that chatroom.

### Connection Management
- Client IDs are generated using UUID to uniquely identify connections
- WebSocket clients are tracked in an in-memory map
- Disconnections are properly handled and cleaned up

## Styling

The application uses a custom color scheme defined in `index.css`:
- **Primary Accent**: Purple (`#aa3bff`)
- **Background**: White with subtle gradients
- **Text**: Professional gray tones
- **Animations**: Smooth transitions and pulse effects

## Development Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Build for production
npm run server    # Start backend server with nodemon
npm run lint      # Run ESLint on all files
npm run preview   # Preview production build
```

## Deployment
The UI and express/websocket backend are hosted on Render. Redis server is ran
through Upstash.
 
The application is currently deployed at: `https://chat-ws-b45f.onrender.com`

## Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please create an issue in the repository.


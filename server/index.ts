import WebSocket, { WebSocketServer } from 'ws';

const PORT: string | undefined = process.env.PORT || '8080';

const webSocketServer = new WebSocketServer({ port: Number(PORT), host: '0.0.0.0' });

const clients = new Set<WebSocket>();

webSocketServer.on('connection', (socket: WebSocket) => {
  console.log('Client connected');
  clients.add(socket);

  socket.on('message', (message: WebSocket.Data) => {
    console.log(`Received message: ${message}`);
    // Broadcast the message to all connected clients
    
    for(let client of clients) {
        if(client === socket && client.readyState === client.OPEN) {
            client.send("Back from server: " + message.toString());
        }   
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clients.delete(socket);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
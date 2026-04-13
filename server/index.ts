import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import express from 'express';
// import redisClient from './redis/index.ts';
import RedisClient from './redis/index.ts';

dotenv.config();
const PORT: number | undefined = Number(process.env.PORT) || 8080;

const app = express()
const expressServer = app.listen(PORT, "0.0.0.0", () => {    
    console.log(`HTTP server is running on port ${PORT}`);
});

const wsClients = new Set<WebSocket>();

const redisClient = new RedisClient();

await redisClient.subscribe('chat-room1', async (message) => {
    console.log(`Received message from Redis channel: ${message}`);
    
    for (let client of wsClients) {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    }
});

const webSocketServer = new WebSocketServer({ server: expressServer });

webSocketServer.on('connection', (socket: WebSocket) => {
    console.log('Client connected on WebSocket ', socket);
    wsClients.add(socket);

    socket.on('message', async (message: WebSocket.Data) => {
        console.log(`Received message: ${message}`);
        await redisClient.lPush('chat-room1-messages', message.toString());
        
        for (let client of wsClients) {
            if (client === socket && client.readyState === client.OPEN) {                
                await redisClient.publish('chat-room1', message.toString());                
            }
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        wsClients.delete(socket);
    });
});
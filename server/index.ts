import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import express from 'express';
import { createClient } from 'redis';

dotenv.config();
const PORT: number | undefined = Number(process.env.PORT) || 8080;
let addressInfo: any = null;

const app = express()
const expressServer = app.listen(PORT, '0.0.0.0', () => {
    addressInfo = expressServer.address() as any;
    console.log(`HTTP server is running on ${addressInfo?.address}:${addressInfo?.port}`);
});

const wsClients = new Set<WebSocket>();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Failed to connect to Redis:', err);
});

await redisClient.subscribe('chat-messages', (message) => {
    console.log(`Received message from Redis channel: ${message}`);
    // Broadcast the message to all connected WebSocket wsClients
    for (let client of wsClients) {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    }
});


const webSocketServer = new WebSocketServer({ server: expressServer });

webSocketServer.on('connection', (socket: WebSocket) => {
    console.log('Client connected');
    wsClients.add(socket);

    socket.on('message', async (message: WebSocket.Data) => {
        console.log(`Received message: ${message}`);
        // Broadcast the message to all connected wsClients

        for (let client of wsClients) {
            if (client === socket && client.readyState === client.OPEN) {
                // client.send("Back from server: " + message.toString());
                await redisClient.publish('chat-messages', message.toString());
                console.log(`Echoing back to sender: ${message}`);
            }
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        wsClients.delete(socket);
    });
});
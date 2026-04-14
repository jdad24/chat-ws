import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import express from 'express';
// import redisClient from './redis/index.ts';
import RedisClient from './redis/index.ts';
import { randomUUID } from 'crypto';
import cors from 'cors';
import type { SocketMessage } from './types/index.ts';

dotenv.config();
const PORT: number | undefined = Number(process.env.PORT) || 8080;

const app = express()
app.use(cors());
const expressServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP server is running on port ${PORT}`);
});

const wsClients = new Map<string,WebSocket>();

const redisClient = new RedisClient();

await redisClient.subscribe('chat-room1', async (data) => {
    const { message, clientId, screenName } = JSON.parse(data);
    console.log(`Received message from Redis channel: ${message}`);

    for (let [id, client] of wsClients) {
        if (clientId !== id && client.readyState === client.OPEN) {
            client.send(JSON.stringify({ message, screenName } as SocketMessage));
        }
    }
});

app.get('/messages', async (req, res) => {
    try {
        const redisClient = new RedisClient();
        const messages = await redisClient.lRange('chat-room1-messages', 0, -1);
        const parsedMessages: Array<SocketMessage> = messages.map((msg) => {
            const parsedMsg = JSON.parse(msg);
            const message = parsedMsg?.message || '--';
            const screenName = parsedMsg?.screenName || 'Anonymous';
            return { message, screenName } as SocketMessage;
        });
        res.json(parsedMessages);
    } catch (error) {
        console.error('Error fetching messages from Redis:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

const webSocketServer = new WebSocketServer({ server: expressServer });

webSocketServer.on('connection', (socket: WebSocket) => {
    const clientId = randomUUID();
    console.log('Client connected on WebSocket ', socket);
    wsClients.set(clientId, socket);

    socket.on('message', async (data: WebSocket.Data) => {
        const { message, screenName } = JSON.parse(data.toString());
        console.log(`Received message: ${message}`);        
        await redisClient.publish('chat-room1', JSON.stringify({ 
            message: message.toString(),
            clientId:clientId,
            screenName: screenName.toString()
        }));
        await redisClient.lPush('chat-room1-messages', JSON.stringify({ message: message.toString(), screenName: screenName.toString() }));
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        wsClients.delete(clientId);
    });
});
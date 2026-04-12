import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
const PORT: number | undefined = Number(process.env.PORT) || 8080;
let addressInfo: any = null;

const app = express()
const expressServer = app.listen(PORT, '0.0.0.0', () => {
    addressInfo = expressServer.address() as any;
    console.log(`HTTP server is running on ${addressInfo?.address}:${addressInfo?.port}`);
});


const webSocketServer = new WebSocketServer({ server: expressServer });

const clients = new Set<WebSocket>();

webSocketServer.on('connection', (socket: WebSocket) => {
    console.log('Client connected');
    clients.add(socket);

    socket.on('message', (message: WebSocket.Data) => {
        console.log(`Received message: ${message}`);
        // Broadcast the message to all connected clients

        for (let client of clients) {
            if (client === socket && client.readyState === client.OPEN) {
                client.send("Back from server: " + message.toString());
            }
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
    });
});
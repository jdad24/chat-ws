import WebSocket from "ws";
import Readline  from "readline/promises";

const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ws = new WebSocket("ws://chat-ws-b45f.onrender.com:8080");

ws.on("open", async () => {
  console.log("Connected to the server");

  while (true) {
    const message = await readline.question("Enter a message to send to the server: ");
    ws.send(message);
  }
});

ws.on("message", (data) => {
  console.log(`Received from server: ${data}`);
});

ws.on("close", () => {
  console.log("Disconnected from the server");
});

ws.on("error", (error) => {
  console.error(`WebSocket error: ${error}`);
});
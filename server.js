// server.js
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });
const clients = new Map(); // userId -> ws

wss.on("connection", ws => {
  console.log("New connection");

  ws.on("message", data => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      console.error("Invalid JSON:", data);
      return;
    }

    // 註冊使用者
    if (msg.type === "register") {
      ws.userId = msg.userId;
      clients.set(msg.userId, ws);
      console.log("User connected:", msg.userId);

      // 顯示所有在線使用者
      console.log("🟢 在線使用者:", Array.from(clients.keys()));
      return;
    }

    // 傳訊息
    if (msg.type === "message") {
      const target = clients.get(msg.to);
      if (target && target.readyState === WebSocket.OPEN) {
        target.send(JSON.stringify(msg));
        console.log(`Message from ${msg.from} → ${msg.to}: ${msg.content}`);
      } else {
        console.log(`❌ Target not connected: ${msg.to}`);
        console.log("🟢 在線使用者:", Array.from(clients.keys()));
      }
    }
  });

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log("User disconnected:", ws.userId);
      console.log("🟢 在線使用者:", Array.from(clients.keys()));
    }
  });
});

console.log("✅ WebSocket server running at ws://0.0.0.0:3000");

import express from "express";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectMongoDB } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import { Server } from "socket.io";
import { initChatSocket } from "./socket/chatSocket.js";
import { authUser } from "./middlewares/authUsers.js";
import os from "os";

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://bableup.vercel.app/",
    methods: ["GET", "POST"]
  }
});


app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  })
);
app.use(morgan("short"));

connectMongoDB();

// app.get('/', (req, res) => {
//   res.send("Server is running!");
// })

app.use("/chat", authUser,  chatRoutes);



// Keep track of connected users
const onlineUsers = new Set();

// Example chat/message data
let totalChats = 0;
let totalMessages = 0;

// Socket.IO connection
io.on("connection", (socket) => {
  onlineUsers.add(socket.id);

  // Example: increment messages
  socket.on("chatMessage", () => {
    totalMessages++;
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
  });
});

// Endpoint to return real-time server metrics
app.get("/", (req, res) => {
  const memoryUsage = process.memoryUsage(); // in bytes
  const uptime = process.uptime(); // in seconds
  const load = os.loadavg(); // [1min, 5min, 15min]
  const cpus = os.cpus().length;
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;

  res.json({
    cpu_count: cpus,
    load_average: load,
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
    },
    uptime_seconds: uptime,
    socket_users_online: onlineUsers.size,
    total_chats: totalChats,
    total_messages: totalMessages,
  });
});


const PORT = process.env.PORT || 8500;
server.listen(PORT, () =>
  console.log(`Server is Running or http://localhost:${PORT}`)
);

initChatSocket(io);



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
    origin: "https://bableup.vercel.app",
    methods: ["GET", "POST"]
  }
});


app.use(express.json());
app.use(
  cors({
    origin: "https://bableup.vercel.app",
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

app.get('/', (req, res) => {
  res.send("Server is running!");
})

app.use("/chat", authUser,  chatRoutes);



const PORT = process.env.PORT || 8500;
server.listen(PORT, () =>
  console.log(`Server is Running or http://localhost:${PORT}`)
);

initChatSocket(io);



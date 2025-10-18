import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as IOServer } from "socket.io";
// import { createClient } from "redis"; // ❌ Redis disabled

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import seedPosts from "./seedPosts.js";
import popupRoute from "./routes/popup.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic route
app.get("/", (req, res) => res.send("💘 HeartConnect API is running..."));

// Routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/popup", popupRoute);

// ---------------------------
// Redis section (COMMENTED OUT)
// ---------------------------

// const redisUrl = process.env.REDIS_URL || "rediss://default:...";
// const redisClient = createClient({
//   url: redisUrl,
//   socket: { tls: true, rejectUnauthorized: false },
// });

// redisClient.on("error", (err) => {
//   console.error("Redis Client Error:", err.message);
// });

// redisClient.on("connect", () => console.log("🚀 Connected to Redis"));

// async function connectRedisWithRetry(client, retries = 5, delay = 1000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       await client.connect();
//       return;
//     } catch (err) {
//       console.error(`Redis connection attempt ${i + 1} failed:`, err.message);
//       await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }
// }

// await connectRedisWithRetry(redisClient);
// const redisPubSub = redisClient.duplicate();
// await connectRedisWithRetry(redisPubSub);

// const PRESENCE_TTL_SECONDS = 60;

// ---------------------------
// End of Redis section
// ---------------------------

const server = http.createServer(app);

// Socket.IO setup
const io = new IOServer(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);

  // Temporary simplified presence without Redis
  socket.on("identify", (userId) => {
    socket.userId = userId;
    console.log(`👤 User identified: ${userId}`);
    io.emit("presence", { userId, online: true });
  });

  socket.on("typing", ({ toUserId, isTyping }) => {
    io.emit("typing", { from: socket.userId, toUserId, isTyping });
  });

  socket.on("messageRead", ({ messageId, fromUserId }) => {
    io.emit("messageRead", { messageId, readBy: socket.userId, fromUserId });
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.userId} joined room: ${roomId}`);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`👤 User ${socket.userId} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      io.emit("presence", { userId: socket.userId, online: false });
    }
  });
});

// Expose to controllers
app.locals.io = io;

// No Redis clients now
// app.locals.redisClient = redisClient;
// app.locals.redisPubSub = redisPubSub;

await seedPosts();

// Define port and start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Cleanup (no Redis now)
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down server...");
  server.close(() => process.exit(0));
});

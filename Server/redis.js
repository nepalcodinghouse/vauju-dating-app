import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  socket: {
    host: "redis-13945.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13945,
    tls: true, // 👈 this enables secure connection
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("✅ Connected to Redis Cloud"));
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

await redisClient.connect();

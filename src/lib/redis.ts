import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const redis = createClient({
  url: redisUrl,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

// Connect automatically when the module is imported
redis.connect().catch(console.error);

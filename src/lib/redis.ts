import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const redisPassword = process.env.REDIS_PASSWORD;
const redisUsername = process.env.REDIS_USERNAME;

export const redis = createClient({
  url: redisUrl,
  password: redisPassword,
  username: redisUsername,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

// Connect automatically when the module is imported
redis.connect().catch(console.error);

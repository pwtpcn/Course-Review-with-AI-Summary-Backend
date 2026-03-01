import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { dataSource } from "./lib/data-source";
import { userController } from "./controller/user_controllers";
import { courseController } from "./controller/course_controllers";
import { reviewController } from "./controller/review_controllers";
import { jobController } from "./controller/job_controllers";
import { reportController } from "./controller/report_controllers";
import { aiController } from "./controller/ai_controllers";
import { swagger } from "@elysiajs/swagger";
import { initQdrantCollections } from "./lib/qdrant";

await dataSource.initialize();
await initQdrantCollections();

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(userController)
  .use(courseController)
  .use(reviewController)
  .use(jobController)
  .use(reportController)
  .use(aiController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

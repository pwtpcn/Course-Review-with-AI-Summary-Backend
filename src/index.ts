import { Elysia } from "elysia";
import { dataSource } from "./data-source";
import { userController } from "./controller/user_controllers";
import { courseController } from "./controller/course_controllers";
import { teacherController } from "./controller/teacher_controller";
import { swagger } from "@elysiajs/swagger";

await dataSource.initialize();

const app = new Elysia()
  .use(swagger())
  .use(userController)
  .use(courseController)
  .use(teacherController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

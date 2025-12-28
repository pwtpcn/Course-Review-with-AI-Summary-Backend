import { Elysia } from "elysia";
import { dataSource } from "./data-source";
import { userController } from "./controller/user_controllers";
import {swagger} from "@elysiajs/swagger";

await dataSource.initialize();

const app = new Elysia().use(swagger()).use(userController).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

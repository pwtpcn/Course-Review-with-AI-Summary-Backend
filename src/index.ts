import { Elysia } from "elysia";
import { DataSource } from "typeorm";
import { User } from "./schema/user";
import { Course } from "./schema/course";

const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user",
    password: "password",
    database: "db",
    entities: [User, Course],
    migrations: [],
    synchronize: true,
});

await dataSource.initialize();

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

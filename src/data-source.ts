import { DataSource } from "typeorm";
import { User } from "./schema/user";
import { Course } from "./schema/course";
import { Review } from "./schema/review";
import { Job } from "./schema/job";
import { Report } from "./schema/report";

export const dataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "db",
  entities: [User, Course, Review, Job, Report],
  migrations: [],
  synchronize: true,
});

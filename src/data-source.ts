import { DataSource } from "typeorm";
import { User } from "./schema/user";
import { Course } from "./schema/course";
import { Review } from "./schema/review";
import { CareerPath } from "./schema/career_path";
import { Teacher } from "./schema/teacher";

export const dataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "db",
  entities: [User, Course, Review, CareerPath, Teacher],
  migrations: [],
  synchronize: true,
});

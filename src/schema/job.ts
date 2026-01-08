import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Metadata } from "./common/metadata";
import { Course } from "./course";

@Entity()
export class Job extends Metadata {
  @Column()
  name!: string;

  @Column()
  details!: string;

  @JoinTable({ name: "course_jobs" })
  @ManyToMany(() => Course, (course) => course.jobs)
  courses!: Course[];
}

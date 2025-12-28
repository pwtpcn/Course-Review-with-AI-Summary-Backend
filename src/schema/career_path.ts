import { Column, Entity, JoinColumn, JoinTable, ManyToMany } from "typeorm";
import { Metadata } from "./common/metadata";
import { Course } from "./course";

@Entity()
export class CareerPath extends Metadata {
  @Column()
  name!: string;

  @Column()
  details!: string;

  @ManyToMany(() => Course, (course) => course.careerPaths)
  courses!: Course[];
}

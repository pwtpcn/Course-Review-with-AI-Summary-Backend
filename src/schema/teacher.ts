import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Metadata } from "./common/metadata";
import { Course } from "./course";

@Entity()
export class Teacher extends Metadata {
    @Column()
    name!: string;

    @Column()
    email!: string;

    @JoinTable({ name: "teacher_courses" })
    @ManyToMany(() => Course, (course) => course.teachers)
    courses!: Course[];
}
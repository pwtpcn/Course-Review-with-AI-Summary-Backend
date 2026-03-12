import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Metadata } from "./common/metadata";

import { User } from "./user";
import type { User as UserType } from "./user";
import { Course } from "./course";
import type { Course as CourseType } from "./course";
import { Report } from "./report";

@Entity()
export class Review extends Metadata {
  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserType;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course!: CourseType;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text" })
  pros!: string;

  @Column({ nullable: true, default: "-", type: "text" })
  cons?: string;

  @Column({ type: "smallint" })
  rating!: number;

  @Column({ nullable: true, default: "-", type: "text" })
  testPrepare?: string;

  @Column({ default: 0, type: "int" })
  like!: number;

  @Column({ default: 0, type: "int" })
  dislike!: number;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({
    type: "enum",
    enum: ["active", "hidden"],
    default: "active",
  })
  status!: "active" | "hidden";

  @OneToMany(() => Report, (report) => report.review)
  reports!: Report[];
}

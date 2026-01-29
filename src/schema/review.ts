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

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: "userId" })
  user!: UserType;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.reviews)
  @JoinColumn({ name: "courseId" })
  course!: CourseType;

  @Column()
  content!: string;

  @Column()
  pros!: string;

  @Column({ nullable: true })
  cons?: string;

  @Column()
  rating!: number;

  @Column({ nullable: true })
  job?: string;

  @Column({ default: 0 })
  like!: number;

  @Column({ default: 0 })
  dislike!: number;

  @OneToMany(() => Report, (report) => report.review)
  reports!: Report[];
}

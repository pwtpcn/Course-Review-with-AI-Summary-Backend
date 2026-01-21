import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Metadata } from "./common/metadata";

import { User } from "./user";
import { Course } from "./course";

@Entity()
export class Review extends Metadata {
  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.reviews)
  @JoinColumn({ name: "courseId" })
  course!: Course;

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
}

import { Column, Entity } from "typeorm";
import { Metadata } from "./common/metadata";

@Entity()
export class Review extends Metadata {
  @Column()
  userId!: string;

  @Column()
  courseId!: string;

  @Column()
  contentDetail!: string;

  @Column()
  difficulty!: string;

  @Column()
  teachingStyle!: string;

  @Column()
  grade?: string;

  @Column({ nullable: true })
  disadvantage?: string;

  @Column()
  rating1!: number;

  @Column()
  rating2!: number;

  @Column()
  rating3!: number;
}
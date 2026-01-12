import { Column, Entity } from "typeorm";
import { Metadata } from "./common/metadata";

@Entity()
export class Review extends Metadata {
  @Column()
  userId!: string;

  @Column()
  courseId!: string;

  @Column()
  content!: string;

  @Column()
  pros!: string;

  @Column({nullable: true})
  cons?: string;

  @Column()
  rating!: number;

  @Column({nullable: true})
  job?: string;
}
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { MetadataWithoutId } from "./common/metadata_without_id";
import { Job } from "./job";
import { Review } from "./review";

@Entity()
export class Course extends MetadataWithoutId {
  @PrimaryColumn()
  id!: string;

  @Column()
  nameTh!: string;

  @Column()
  nameEn!: string;

  @Column()
  description!: string;

  @Column()
  credits!: number;

  @Column()
  year!: number;

  @JoinTable({ name: "course_jobs" })
  @ManyToMany(() => Job, (job) => job.courses)
  jobs!: Job[];

  @OneToMany(() => Review, (review) => review.course)
  reviews!: Review[];
}

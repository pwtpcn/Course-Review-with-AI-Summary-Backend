import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { MetadataWithoutId } from "./common/metadata_without_id";
import { CareerPath } from "./career_path";
import { Review } from "./review";

@Entity()
export class Course extends MetadataWithoutId {
  @PrimaryColumn()
  courseId!: string;

  @Column()
  nameTh!: string;

  @Column()
  nameEn!: string;

  @Column()
  description!: string;

  @Column()
  credits!: number;

  @JoinTable({ name: "course_career_paths" })
  @ManyToMany(() => CareerPath, (careerPath) => careerPath.courses)
  careerPaths!: CareerPath[];

  @OneToMany(() => Review, (review) => review.courseId)
  reviews!: Review[];
}

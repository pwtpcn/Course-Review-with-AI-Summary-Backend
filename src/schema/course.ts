import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { MetadataWithoutId } from "./common/metadata_without_id";
import { CareerPath } from "./career_path";
import { Review } from "./review";
import { Teacher } from "./teacher";

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

  @Column()
  year!: number;

  @JoinTable({ name: "course_career_paths" })
  @ManyToMany(() => CareerPath, (careerPath) => careerPath.courses)
  careerPaths!: CareerPath[];

  @OneToMany(() => Review, (review) => review.courseId)
  reviews!: Review[];

  @JoinTable({ name: "teacher_courses" })
  @ManyToMany(() => Teacher, (teacher) => teacher.courses)
  teachers!: Teacher[];
}

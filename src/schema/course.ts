import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { MetadataWithoutId } from "./common/metadata_without_id";
import { CareerPath } from "./career_path";

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
}

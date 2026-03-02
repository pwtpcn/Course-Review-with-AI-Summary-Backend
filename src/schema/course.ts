import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { MetadataWithoutId } from "./common/metadata_without_id";
import { Review } from "./review";

@Entity()
export class Course extends MetadataWithoutId {
  @PrimaryColumn({ length: 10 })
  id!: string;

  @Column({ length: 255 })
  nameTh!: string;

  @Column({ length: 255 })
  nameEn!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "smallint" })
  credits!: number;

  @Column({ type: "smallint" })
  year!: number;

  @Column({
    type: "enum",
    enum: ["Core", "Elective"],
    default: "Core",
  })
  category!: "Core" | "Elective";

  @OneToMany(() => Review, (review) => review.course)
  reviews!: Review[];
}

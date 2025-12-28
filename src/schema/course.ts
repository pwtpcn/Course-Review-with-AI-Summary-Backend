import { Column, Entity, PrimaryColumn } from "typeorm"
import { MetadataWithoutId } from "./metadata_without_id"

@Entity()
export class Course extends MetadataWithoutId {
    @PrimaryColumn()
    courseId!: string

    @Column()
    nameTh!: string

    @Column()
    nameEn!: string

    @Column()
    description!: string

    @Column()
    credits!: number
}
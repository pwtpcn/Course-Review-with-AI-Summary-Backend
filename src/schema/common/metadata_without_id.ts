import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class MetadataWithoutId {
    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
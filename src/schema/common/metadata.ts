import { Column, PrimaryColumn } from "typeorm";

export abstract class Metadata {
    @PrimaryColumn('uuid', { default: () => "uuidv7()" })
    id!: string

    @Column('timestamp', { default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column('timestamp', { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date
}
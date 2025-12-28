import { Column } from "typeorm";

export abstract class MetadataWithoutId {
    @Column('timestamp', { default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column('timestamp', { default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date
}
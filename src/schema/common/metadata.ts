import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export abstract class Metadata {
  @PrimaryColumn("uuid", { default: () => "uuidv7()" })
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}

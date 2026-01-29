import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export abstract class Metadata {
  @PrimaryColumn("uuid", { default: () => "uuidv7()" })
  id!: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "timezone('Asia/Bangkok', now())",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "timezone('Asia/Bangkok', now())",
  })
  updatedAt!: Date;
}

import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export abstract class Metadata {
  @PrimaryColumn("uuid", { default: () => "gen_random_uuid()" })
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

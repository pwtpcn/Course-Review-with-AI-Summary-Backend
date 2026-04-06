import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class MetadataWithoutId {
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

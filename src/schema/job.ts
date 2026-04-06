import { Column, Entity } from "typeorm";
import { Metadata } from "./common/metadata";

@Entity()
export class Job extends Metadata {
  @Column({ length: 255 })
  name!: string;

  @Column({ type: "text" })
  details!: string;
}

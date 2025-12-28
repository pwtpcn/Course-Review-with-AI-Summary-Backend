import { Column, Entity } from "typeorm";
import { Metadata } from "./common/metadata";

@Entity()
export class User extends Metadata {
  @Column({unique: true})
  email!: string;

  @Column({unique: true})
  username!: string;

  @Column()
  hashedPassword!: string;

  @Column()
  salt!: string;

  @Column({ default: "user" })
  role!: string;
}

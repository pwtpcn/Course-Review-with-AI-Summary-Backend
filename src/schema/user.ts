import { Column, Entity, OneToMany } from "typeorm";
import { Metadata } from "./common/metadata";
import { Review } from "./review";
import { Report } from "./report";

@Entity()
export class User extends Metadata {
  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  hashedPassword!: string;

  @Column()
  salt!: string;

  @Column({ default: "user" })
  role!: string;

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => Report, (report) => report.user)
  reports!: Report[];
}

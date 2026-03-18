import { Column, Entity, OneToMany } from "typeorm";
import { Metadata } from "./common/metadata";
import { Review } from "./review";
import { Report } from "./report";
import { ReviewReaction } from "./review_reaction";

@Entity()
export class User extends Metadata {
  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ unique: true, length: 30 })
  username!: string;

  @Column({
    type: "enum",
    enum: ["user", "admin"],
    default: "user",
  })
  role!: "user" | "admin";

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => Report, (report) => report.user)
  reports!: Report[];

  @OneToMany(() => ReviewReaction, (reaction) => reaction.user)
  reactions!: ReviewReaction[];
}

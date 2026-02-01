import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Metadata } from "./common/metadata";

import { User } from "./user";
import type { User as UserType } from "./user";
import { Review } from "./review";
import type { Review as ReviewType } from "./review";

@Entity()
export class Report extends Metadata {
  @Column()
  content!: string;

  @Column({
    type: "enum",
    enum: ["pending", "rejected", "approved"],
    default: "pending",
  })
  status!: "pending" | "rejected" | "approved";

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: "userId" })
  user!: UserType;

  @Column()
  reviewId!: string;

  @ManyToOne(() => Review, (review) => review.reports)
  @JoinColumn({ name: "reviewId" })
  review!: ReviewType;
}

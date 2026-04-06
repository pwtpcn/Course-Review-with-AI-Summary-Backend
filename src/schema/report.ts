import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Metadata } from "./common/metadata";

import { User } from "./user";
import type { User as UserType } from "./user";
import { Review } from "./review";
import type { Review as ReviewType } from "./review";

@Entity()
export class Report extends Metadata {
  @Column({ length: 500 })
  content!: string;

  @Column({
    type: "enum",
    enum: ["spam", "inappropriate", "irrelevant", "other"],
  })
  reason!: "spam" | "inappropriate" | "irrelevant" | "other";

  @Column({
    type: "enum",
    enum: ["pending", "rejected", "approved"],
    default: "pending",
  })
  status!: "pending" | "rejected" | "approved";

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserType;

  @Column()
  reviewId!: string;

  @ManyToOne(() => Review, (review) => review.reports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reviewId" })
  review!: ReviewType;
}

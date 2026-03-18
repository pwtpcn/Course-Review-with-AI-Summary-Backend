import { Column, Entity, ManyToOne } from "typeorm";
import { Metadata } from "./common/metadata";
import { Review } from "./review";
import type { Review as ReviewType } from "./review";
import { User } from "./user";
import type { User as UserType } from "./user";

@Entity()
export class ReviewReaction extends Metadata {
    @Column({
        type: "enum",
        enum: ["like", "dislike"],
    })
    type!: "like" | "dislike";

    @Column()
    reviewId!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => Review, (review) => review.reactions)
    review!: ReviewType;

    @ManyToOne(() => User, (user) => user.reactions)
    user!: UserType;
}
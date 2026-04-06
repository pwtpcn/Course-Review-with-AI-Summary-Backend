import { DataSource } from "typeorm";
import { dataSource } from "../lib/data-source";
import { ReviewReaction } from "../schema/review_reaction";
import { Review } from "../schema/review";

export class ReactionService {
  private static instance: ReactionService;
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  public static getInstance(): ReactionService {
    if (!ReactionService.instance) {
      ReactionService.instance = new ReactionService();
    }
    return ReactionService.instance;
  }

  async toggleReaction(userId: string, reviewId: string, type: 'like' | 'dislike')
  {
    return await this.dataSource.transaction(async () => {
        const existedReaction = await this.dataSource.manager.findOne(ReviewReaction, {where: {userId, reviewId}});

        if(!existedReaction) {
            await this.addNewReaction(userId, reviewId, type);
        } else if(existedReaction.type === type) {
            await this.removeReaction(existedReaction);
        } else {
            await this.switchReaction(existedReaction, type);
        }
    })
  }

  // reaction ครั้งแรก
  private async addNewReaction(userId: string, reviewId: string, type: "like" | "dislike") {
    await this.dataSource.manager.save(ReviewReaction, {userId, reviewId, type});
    await this.updateReviewCount(reviewId, type, 1);
  }

  // ลบ reaction เดิม
  private async removeReaction(reaction: ReviewReaction) {
    const type = reaction.type;
    await this.dataSource.manager.remove(ReviewReaction, reaction);
    await this.updateReviewCount(reaction.reviewId, type, -1);
  }

  // เปลี่ยน reaction
  private async switchReaction(reaction: ReviewReaction, newType: 'like' | 'dislike') {
    const oldType = reaction.type;
    reaction.type = newType;

    await this.dataSource.manager.save(ReviewReaction, reaction);
    await this.updateReviewCount(reaction.reviewId, oldType, -1);
    await this.updateReviewCount(reaction.reviewId, newType, 1);
  }

  // update review like/dislike count
  private async updateReviewCount(reviewId: string, type: "like" | "dislike", amount: 1|-1) {
    const column = type;
    
    if(amount>0){
        await this.dataSource.manager.increment(Review, { id: reviewId }, column, amount);
    }
    else{
        await this.dataSource.manager.decrement(Review, { id: reviewId }, column, Math.abs(amount));
    }
  }
}

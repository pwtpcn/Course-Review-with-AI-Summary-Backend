import { DataSource } from "typeorm";
import { dataSource } from "../data-source";
import { Review } from "../schema/review";

export class ReviewServices {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createReview(reviewData: Partial<Review>) {
    const review = new Review();
    review.userId = reviewData.userId!;
    review.courseId = reviewData.courseId!;
    review.content = reviewData.content!;
    review.pros = reviewData.pros!;
    review.cons = reviewData.cons;
    review.rating = reviewData.rating!;
    review.job = reviewData.job;

    return this.dataSource.manager.save(Review, review);
  }

  async getAllReviews(sortBy?: "newest" | "oldest") {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }

    return this.dataSource.manager.find(Review, { order });
  }

  async getReviewById(id: string) {
    return this.dataSource.manager.findOne(Review, { where: { id } });
  }

  async getReviewByIdOrThrow(id: string) {
    const review = await this.getReviewById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  }

  async getReviewByUserId(userId: string) {
    return this.dataSource.manager.find(Review, { where: { userId } });
  }

  async getReviewByCourseId(courseId: string) {
    return this.dataSource.manager.find(Review, { where: { courseId } });
  }

  async updateReview(id: string, reviewData: Partial<Review>) {
    const review = await this.getReviewByIdOrThrow(id);

    const updatedReview = new Review();
    updatedReview.rating = reviewData.rating ?? review.rating;
    updatedReview.content = reviewData.content ?? review.content;
    updatedReview.pros = reviewData.pros ?? review.pros;
    updatedReview.cons = reviewData.cons ?? review.cons;
    updatedReview.job = reviewData.job ?? review.job;
    updatedReview.updatedAt = new Date();

    await this.dataSource.manager.update(Review, id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string) {
    const deletedReview = await this.getReviewByIdOrThrow(id);
    await this.dataSource.manager.delete(Review, id);

    return deletedReview;
  }
}

export default ReviewServices;

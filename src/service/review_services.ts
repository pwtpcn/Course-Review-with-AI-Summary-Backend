import { DataSource } from "typeorm";
import { dataSource } from "../lib/data-source";
import { Review } from "../schema/review";
import { CreateReviewInput, UpdateReviewInput } from "../dto/review.dto";

export class ReviewServices {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createReview(reviewData: CreateReviewInput) {
    const review = new Review();
    review.userId = reviewData.userId!;
    review.courseId = reviewData.courseId!;
    review.content = reviewData.content!;
    review.pros = reviewData.pros!;
    review.cons = reviewData.cons;
    review.rating = reviewData.rating!;
    review.testPrepare = reviewData.testPrepare;

    return this.dataSource.manager.save(Review, review);
  }

  async getAllReviews(
    sortBy?: "newest" | "oldest",
    status?: "active" | "hidden",
    search?: string,
  ) {
    const query = this.dataSource.manager.createQueryBuilder(Review, "review")
      .leftJoinAndSelect("review.course", "course")
      .leftJoinAndSelect("review.reports", "reports");

    if (status) {
      query.andWhere("review.status = :status", { status });
    }

    if (search) {
      query.andWhere(
        "(review.courseId::text LIKE :search OR review.content LIKE :search OR review.userId::text LIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (sortBy === "newest") {
      query.orderBy("review.createdAt", "DESC");
    } else if (sortBy === "oldest") {
      query.orderBy("review.createdAt", "ASC");
    } else {
      query.orderBy("review.createdAt", "DESC");
    }

    return query.getMany();
  }

  async getReviewById(id: string) {
    return this.dataSource.manager.findOne(Review, {
      where: { id },
      relations: ["course", "reports"],
    });
  }

  async getReviewByIdOrThrow(id: string) {
    const review = await this.getReviewById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  }

  async getReviewByUserId(
    userId: string,
    sortBy?: "newest" | "oldest",
    includeHidden = false,
  ) {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }

    const where: any = { userId };
    if (!includeHidden) {
      where.status = "active";
    }

    return this.dataSource.manager.find(Review, {
      where,
      order,
      relations: ["course", "reports"],
    });
  }

  async getReviewByCourseId(
    courseId: string,
    sortBy?: "newest" | "oldest",
    includeHidden = false,
  ) {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }

    const where: any = { courseId };
    if (!includeHidden) {
      where.status = "active";
    }

    return this.dataSource.manager.find(Review, {
      where,
      order,
      relations: ["course", "reports"],
    });
  }

  async updateReview(id: string, reviewData: UpdateReviewInput) {
    const review = await this.getReviewByIdOrThrow(id);

    if (review.isEdited) {
      throw new Error("Review has already been edited");
    }

    Object.assign(review, reviewData);
    review.isEdited = true;
    return await this.dataSource.manager.save(review);
  }

  async deleteReview(id: string) {
    const deletedReview = await this.getReviewByIdOrThrow(id);
    await this.dataSource.manager.remove(Review, deletedReview);

    return deletedReview;
  }

  async hideReview(id: string) {
    const review = await this.getReviewByIdOrThrow(id);
    review.status = "hidden";
    return this.dataSource.manager.save(Review, review);
  }
}

export default ReviewServices;

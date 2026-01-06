import { DataSource } from "typeorm";
import { dataSource } from "../data-source";
import { Review } from "../schema/review";

export class ReviewServices {
    private dataSource: DataSource;
    
    constructor() {
        this.dataSource = dataSource;
    }

    async createReview(review: Review) {
        return this.dataSource.getRepository(Review).save(review);
    }

    async getAllReviews() {
        return this.dataSource.getRepository(Review).find();
    }

    async getReviewById(id: string) {
        return this.dataSource.getRepository(Review).findOneBy({ id });
    }

    async getReviewByIdOrThrow(id: string) {
        const review = await this.getReviewById(id);
        if (!review) {
            throw new Error("Review not found");
        }
        return review;
    }

    async getReviewByUserId(userId: string) {
        return this.dataSource.getRepository(Review).find({ where: { userId } });
    }

    async getReviewByCourseId(courseId: string) {
        return this.dataSource.getRepository(Review).find({ where: { courseId } });
    }

    // async updateReview(id: string, reviewData: Partial<Review>) {
    //     const review = await this.getReviewByIdOrThrow(id);

    //     const updatedReview = new Review();
    //     updatedReview.id = review.id;
    //     updatedReview.userId = reviewData.userId ?? review.userId;
    //     updatedReview.courseId = reviewData.courseId ?? review.courseId;
    //     updatedReview.rating = reviewData.rating ?? review.rating;
    //     updatedReview.comment = reviewData.comment ?? review.comment;
    //     updatedReview.createdAt = review.createdAt;
    //     updatedReview.updatedAt = new Date();

    //     await this.dataSource.getRepository(Review).update(id, updatedReview);
    //     return updatedReview;
    // }

    async deleteReview(id: string) {
        const deletedReview = await this.getReviewByIdOrThrow(id);
        await this.dataSource.getRepository(Review).delete(deletedReview);
        
        return deletedReview;
    }
}

export default ReviewServices;
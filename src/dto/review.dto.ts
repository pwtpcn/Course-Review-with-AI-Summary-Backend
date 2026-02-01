export interface CreateReviewInput {
    userId: string;
    courseId: string;
    content: string;
    pros: string;
    cons?: string;
    rating: number;
    job?: string;
}

export interface UpdateReviewInput {
    content?: string;
    pros?: string;
    cons?: string;
    rating?: number;
    job?: string;
}
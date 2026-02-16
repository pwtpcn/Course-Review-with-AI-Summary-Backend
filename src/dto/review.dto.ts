export interface CreateReviewInput {
    userId: string;
    courseId: string;
    content: string;
    pros: string;
    cons?: string;
    rating: number;
    testPrepare?: string;
}

export interface UpdateReviewInput {
    content?: string;
    pros?: string;
    cons?: string;
    rating?: number;
    testPrepare?: string;
}
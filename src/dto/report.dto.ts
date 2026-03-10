export interface CreateReportInput {
  content: string;
  reason: "spam" | "inappropriate" | "irrelevant" | "other";
  userId: string;
  reviewId: string;
}

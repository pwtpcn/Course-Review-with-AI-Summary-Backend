export interface CreateReportInput {
  content: string;
  status: "pending" | "rejected" | "approved";
  userId: string;
  reviewId: string;
}

import { Elysia, t } from "elysia";
import { AiService } from "../service/ai_services";

const aiService = new AiService();

export const aiController = new Elysia({
  prefix: "/ai",
  detail: { tags: ["AI"] },
})
  .post(
    "/sync",
    async () => {
      console.log("Starting sync...");
      const courses = await aiService.syncCourses();
      const jobs = await aiService.syncJobs();
      const reviews = await aiService.syncReviews();
      return {
        success: true,
        synced: {
          courses: courses.count,
          jobs: jobs.count,
          reviews: reviews.count,
        },
      };
    },
    {
      detail: {
        summary: "Sync all data to Qdrant",
        tags: ["AI"],
      },
    },
  )

  .post(
    "/recommend",
    async ({ body }) => {
      const result = await aiService.recommendCourses(body.jobDescription);
      return result;
    },
    {
      body: t.Object({
        jobDescription: t.String(),
      }),
      detail: {
        summary: "Recommend courses based on job description",
        tags: ["AI"],
      },
    },
  )

  .get(
    "/reviews/:courseId/summary",
    async ({ params }) => {
      const summary = await aiService.summarizeReviews(params.courseId);
      return { summary };
    },
    {
      params: t.Object({
        courseId: t.String(),
      }),
      detail: {
        summary: "Summarize reviews for a course",
        tags: ["AI"],
      },
    },
  );

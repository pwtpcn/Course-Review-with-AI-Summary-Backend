import { Elysia, t } from "elysia";
import { AiService } from "../service/ai_services";

const aiService = new AiService();

export const aiController = new Elysia({
  prefix: "/ai",
  detail: { tags: ["AI"] },
})
  .post(
    "/sync",
    async ({ set }) => {
      try {
        console.log("Starting sync...");
        const courses = await aiService.syncCourses();
        const jobs = await aiService.syncJobs();
        const reviews = await aiService.syncReviews();
        set.status = 200;
        console.log("Sync completed.");
        return {
          success: true,
          synced: {
            courses: courses.count,
            jobs: jobs.count,
            reviews: reviews.count,
          },
        };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI sync:", e);
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Sync all data to Qdrant",
        summary: "Sync all data to Qdrant",
      },
    },
  )

  .post(
    "/sync/reviews",
    async ({ set }) => {
      try {
        console.log("Starting sync...");
        const reviews = await aiService.syncReviews();
        set.status = 200;
        console.log("Sync completed.");
        return {
          success: true,
          synced: {
            reviews: reviews.count,
          },
        };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI sync:", e);
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Sync reviews to Qdrant",
        summary: "Sync reviews to Qdrant",
      },
    },
  )

  .post(
    "/sync/jobs",
    async ({ set }) => {
      try {
        console.log("Starting sync...");
        const jobs = await aiService.syncJobs();
        set.status = 200;
        console.log("Sync completed.");
        return {
          success: true,
          synced: {
            jobs: jobs.count,
          },
        };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI sync:", e);
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Sync jobs to Qdrant",
        summary: "Sync jobs to Qdrant",
      },
    },
  )

  .post(
    "/sync/courses",
    async ({ set }) => {
      try {
        console.log("Starting sync...");
        const courses = await aiService.syncCourses();
        set.status = 200;
        console.log("Sync completed.");
        return {
          success: true,
          synced: {
            courses: courses.count,
          },
        };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI sync:", e);
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Sync courses to Qdrant",
        summary: "Sync courses to Qdrant",
      },
    },
  )

  .get(
    "/job/recommend/:jobId",
    async ({ params, set }) => {
      try {
        const result = await aiService.recommendCourses(params.jobId);
        set.status = 200;
        return { result };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI recommendation:", e);
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        jobId: t.String(),
      }),
      detail: {
        description: "Recommend courses based on job ID using vector search",
        summary: "Recommend courses based on job ID using vector search",
      },
    },
  )

  .get(
    "/reviews/:courseId/summary-qdrant",
    async ({ params, set }) => {
      try {
        const result = await aiService.summarizeReviewsFromQdrant(
          params.courseId,
        );
        set.status = 200;
        return { result };
      } catch (e: any) {
        set.status = 500;
        console.error("Error in AI summary:", e);
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        courseId: t.String(),
      }),
      detail: {
        description: "Summarize reviews for a course (Qdrant Source)",
        summary: "Summarize reviews for a course (Qdrant Source)",
      },
    },
  );

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
        return { error: e.message };
      }
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
    async ({ body, set }) => {
      try {
        const result = await aiService.recommendCourses(body.jobDescription);
        set.status = 200;
        return result;
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
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
    async ({ params, set }) => {
      try {
        const summary = await aiService.summarizeReviews(params.courseId);
        set.status = 200;
        return { summary };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        courseId: t.String(),
      }),
      detail: {
        summary: "Summarize reviews for a course (Database)",
        tags: ["AI"],
      },
    },
  )

  .get(
    "/reviews/:courseId/summary-qdrant",
    async ({ params, set }) => {
      try {
        const summary = await aiService.summarizeReviewsFromQdrant(
          params.courseId,
        );
        // Clean markdown code blocks if present
        const cleanSummary = summary.replace(/```json\n?|\n?```/g, "").trim();
        const result = JSON.parse(cleanSummary);
        set.status = 200;
        return { result };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        courseId: t.String(),
      }),
      detail: {
        summary: "Summarize reviews for a course (Qdrant Source)",
        tags: ["AI"],
      },
    },
  );

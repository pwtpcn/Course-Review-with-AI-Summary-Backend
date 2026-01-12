import Elysia, { t } from "elysia";
import { ReviewServices } from "../service/review_services";

const service = new ReviewServices();

export const reviewController = new Elysia({
  prefix: "/review",
  detail: { tags: ["Review"] },
})

  .post(
    "/create",
    async ({ body }) => {
      try {
        const response = await service.createReview(body);
        return { message: "Review created successfully", review: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        userId: t.String(),
        courseId: t.String(),
        content: t.String(),
        pros: t.String(),
        cons: t.Optional(t.String()),
        rating: t.Number(),
        job: t.Optional(t.String()),
      }),
      detail: {
        description: "Create a new review",
        summary: "Create a new review",
      },
    }
  )

  .get(
    "/getall",
    async ({ query: { sortBy } }) => {
      try {
        const response = await service.getAllReviews(sortBy);
        return { message: "Reviews fetched successfully", reviews: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
      }),
      detail: {
        description: "Get all reviews",
        summary: "Get all reviews",
      },
    }
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getReviewByIdOrThrow(id);
        return { message: "Review fetched successfully", review: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a review by id",
        summary: "Get a review by id",
      },
    }
  )

  .get(
    "/getbyuserid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getReviewByUserId(id);
        return { message: "Reviews fetched successfully", reviews: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get all reviews by user id",
        summary: "Get all reviews by user id",
      },
    }
  )

  .get(
    "/getbycourseid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getReviewByCourseId(id);
        return { message: "Reviews fetched successfully", reviews: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get all reviews by course id",
        summary: "Get all reviews by course id",
      },
    }
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body }) => {
      try {
        const response = await service.updateReview(id, body);
        return { message: "Review updated successfully", review: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        courseId: t.String(),
        content: t.String(),
        pros: t.String(),
        cons: t.Optional(t.String()),
        rating: t.Number(),
        job: t.Optional(t.String()),
      }),
      detail: {
        description: "Update a review",
        summary: "Update a review",
      },
    }
  )

  .delete(
    "/delete/:id",
    async ({ params: { id } }) => {
      try {
        const deletedReview = await service.deleteReview(id);
        return { message: "Review deleted successfully", deletedReview };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a review",
        summary: "Delete a review",
      },
    }
  );

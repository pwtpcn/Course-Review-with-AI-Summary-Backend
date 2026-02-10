import Elysia, { t } from "elysia";
import { ReviewServices } from "../service/review_services";

const service = new ReviewServices();

export const reviewController = new Elysia({
  prefix: "/review",
  detail: { tags: ["Review"] },
})

  .post(
    "/create",
    async ({ body, set }) => {
      try {
        const review = await service.createReview(body);
        set.status = 201;
        return { message: "Review created successfully", review };
      } catch (e: any) {
        set.status = 500;
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
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy, includeHidden }, set }) => {
      try {
        const isHidden = includeHidden === "true";
        const reviews = await service.getAllReviews(sortBy, isHidden);
        set.status = 200;
        return { message: "Reviews fetched successfully", reviews };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
        includeHidden: t.Optional(t.String()),
      }),
      detail: {
        description: "Get all reviews",
        summary: "Get all reviews",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id }, set }) => {
      try {
        const review = await service.getReviewByIdOrThrow(id);
        set.status = 200;
        return { message: "Review fetched successfully", review };
      } catch (e: any) {
        if (e.message === "Review not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a review by id",
        summary: "Get a review by id",
      },
    },
  )

  .get(
    "/getbyuserid/:id",
    async ({ params: { id }, query: { sortBy, includeHidden }, set }) => {
      try {
        const isHidden = includeHidden === "true";
        const reviews = await service.getReviewByUserId(id, sortBy, isHidden);
        set.status = 200;
        return { message: "Reviews fetched successfully", reviews };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
        includeHidden: t.Optional(t.String()),
      }),
      detail: {
        description: "Get all reviews by user id",
        summary: "Get all reviews by user id",
      },
    },
  )

  .get(
    "/getbycourseid/:id",
    async ({ params: { id }, query: { sortBy, includeHidden }, set }) => {
      try {
        const isHidden = includeHidden === "true";
        const reviews = await service.getReviewByCourseId(
          id,
          sortBy,
          isHidden,
        );
        set.status = 200;
        return { message: "Reviews fetched successfully", reviews };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
        includeHidden: t.Optional(t.String()),
      }),
      detail: {
        description: "Get all reviews by course id",
        summary: "Get all reviews by course id",
      },
    },
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const updatedReview = await service.updateReview(id, body);
        set.status = 200;
        return {
          message: "Review updated successfully",
          review: updatedReview,
        };
      } catch (e: any) {
        if (e.message === "Review not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
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
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id }, set }) => {
      try {
        const deletedReview = await service.deleteReview(id);
        set.status = 200;
        return { message: "Review deleted successfully", deletedReview };
      } catch (e: any) {
        if (e.message === "Review not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a review",
        summary: "Delete a review",
      },
    },
  )

  .patch(
    "/hide/:id",
    async ({ params: { id }, set }) => {
      try {
        const review = await service.hideReview(id);
        set.status = 200;
        return { message: "Review hidden successfully", review };
      } catch (e: any) {
        if (e.message === "Review not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Hide a review",
        summary: "Hide a review",
      },
    },
  );

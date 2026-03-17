import Elysia, { t } from "elysia";
import { ReviewServices } from "../service/review_services";
import { authMiddleware } from "../middleware/auth";

const service = new ReviewServices();

export const reviewController = new Elysia({
  prefix: "/review",
  detail: { tags: ["Review"] },
})
  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const review = await service.createReview({ ...body, userId: user.id });
        set.status = 201;
        return { message: "Review created successfully", review };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        courseId: t.String(),
        content: t.String(),
        pros: t.String(),
        cons: t.Optional(t.String()),
        rating: t.Number(),
        testPrepare: t.Optional(t.String()),
      }),
      detail: {
        description: "Create a new review",
        summary: "Create a new review",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy, status, search }, set }) => {
      try {
        const reviews = await service.getAllReviews(sortBy, status, search);
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
        status: t.Optional(t.Union([t.Literal("active"), t.Literal("hidden")])),
        search: t.Optional(t.String()),
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
        const reviews = await service.getReviewByCourseId(id, sortBy, isHidden);
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
    "/hide/:id",
    async ({ params: { id }, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      if (user.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
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
        description: "Hide a review by id (Soft Delete)",
        summary: "Hide a review by id",
      },
    },
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const existingReview = await service.getReviewByIdOrThrow(id);
        if (existingReview.userId !== user.id && user.role !== "admin") {
          set.status = 403;
          return { error: "Forbidden" };
        }

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
        content: t.Optional(t.String()),
        pros: t.Optional(t.String()),
        cons: t.Optional(t.String()),
        rating: t.Optional(t.Number()),
        testPrepare: t.Optional(t.String()),
      }),
      detail: {
        description: "Update a review",
        summary: "Update a review",
      },
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id }, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        // Fetch review to check ownership
        const existingReview = await service.getReviewByIdOrThrow(id);
        if (existingReview.userId !== user.id && user.role !== "admin") {
          set.status = 403;
          return { error: "Forbidden" };
        }

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
    async ({ params: { id }, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      if (user.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
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
  )

  .patch(
    "/unhide/:id",
    async ({ params: { id }, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      if (user.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const review = await service.unhideReview(id);
        set.status = 200;
        return { message: "Review unhidden successfully", review };
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
        description: "Unhide a review",
        summary: "Unhide a review",
      },
    },
  );

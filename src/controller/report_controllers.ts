import { Elysia, t } from "elysia";
import { ReportService } from "../service/report_services";
import { authMiddleware } from "../middleware/auth";

const reportService = new ReportService();

export const reportController = new Elysia({
  prefix: "/reports",
  detail: { tags: ["Report"] },
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
        const report = await reportService.createReport({
          ...body,
          userId: user.id,
        });
        set.status = 201;
        return { message: "Report created successfully", report };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        content: t.String(),
        reviewId: t.String(),
        reason: t.Union([t.Literal("spam"), t.Literal("inappropriate"), t.Literal("irrelevant"), t.Literal("other")]),
      }),
      detail: {
        description: "Create a new report",
        summary: "Create a new report",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy }, set }) => {
      try {
        const reports = await reportService.getAllReports(sortBy);
        set.status = 200;
        return { message: "Reports fetched successfully", reports };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
      }),
      detail: {
        description: "Get all reports",
        summary: "Get all reports",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id }, set }) => {
      try {
        const report = await reportService.getReportByIdOrThrow(id);
        set.status = 200;
        return { message: "Report fetched successfully", report };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a report by id",
        summary: "Get a report by id",
      },
    },
  )

  .get(
    "/getbyreviewid/:reviewId",
    async ({ params: { reviewId }, set }) => {
      try {
        const reports = await reportService.getReportByReviewId(reviewId);
        set.status = 200;
        return { message: "Report fetched successfully", reports };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a report by review id",
        summary: "Get a report by review id",
      },
    },
  )

  .get(
    "/getbyuserid/:userId",
    async ({ params: { userId }, set }) => {
      try {
        const reports = await reportService.getReportByUserId(userId);
        set.status = 200;
        return { message: "Report fetched successfully", reports };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a report by user id",
        summary: "Get a report by user id",
      },
    },
  )

  .patch(
    "/cancel/:id",
    async ({ params: { id }, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        // Check ownership
        const report = await reportService.getReportByIdOrThrow(id);
        if (report.user.id !== user.id && user.role !== "admin") {
          set.status = 403;
          return { error: "Forbidden" };
        }

        const canceledReport = await reportService.cancelReport(id);
        set.status = 200;
        return {
          message: "Report canceled successfully",
          report: canceledReport,
        };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Cancel a report",
        summary: "Cancel a report",
      },
    },
  )

  .patch(
    "/approve/:id",
    async ({ params: { id }, set, user }) => {
      // Admin only
      if (user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const report = await reportService.approveReport(id);
        set.status = 200;
        return { message: "Report approved successfully", report };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Approve a report",
        summary: "Approve a report",
      },
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id }, set, user }) => {
      // Admin only
      if (user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const deletedReport = await reportService.deleteReport(id);
        set.status = 200;
        return { message: "Report deleted successfully", deletedReport };
      } catch (e: any) {
        if (e.message === "Report not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a report",
        summary: "Delete a report",
      },
    },
  );

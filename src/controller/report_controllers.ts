import { Elysia, t } from "elysia";
import { ReportService } from "../service/report_services";
import type { CreateReportInput } from "../dto/report.dto";

const reportService = new ReportService();

export const reportController = new Elysia({
  prefix: "/reports",
  detail: { tags: ["Report"] },
})

  .post(
    "/create",
    async ({ body, set }) => {
      try {
        const report = await reportService.createReport(
          body as CreateReportInput,
        );
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
        status: t.String(),
        userId: t.String(),
        reviewId: t.String(),
      }),
    },
  )
  .get(
    "/getall",
    async ({ query, set }) => {
      try {
        const sortBy = query.sortBy as "newest" | "oldest" | undefined;
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
    },
  )

  .patch("/cancel/:id", async ({ params, set }) => {
    try {
      const report = await reportService.cancelReport(params.id);
      set.status = 200;
      return { message: "Report canceled successfully", report };
    } catch (e: any) {
      if (e.message === "Report not found") {
        set.status = 404;
        return { error: e.message };
      }
      set.status = 500;
      return { error: e.message };
    }
  })

  .patch("/approve/:id", async ({ params, set }) => {
    try {
      const report = await reportService.approveReport(params.id);
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
  })

  .delete("/delete/:id", async ({ params, set }) => {
    try {
      const deletedReport = await reportService.deleteReport(params.id);
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
  })
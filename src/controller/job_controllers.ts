import Elysia from "elysia";
import JobServices from "../service/job_services";
import { t } from "elysia";
const service = new JobServices();

export const jobController = new Elysia({
  prefix: "/job",
  detail: { tags: ["Job"] },
})

  .post(
    "/create",
    async ({ body, set }) => {
      try {
        const response = await service.createJob({
          name: body.name,
          details: body.details,
        });
        set.status = 201;
        return { message: "Job created successfully", job: response };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        details: t.String(),
      }),
      detail: {
        description: "Create a new job",
        summary: "Create a new job",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy }, set }) => {
      try {
        const response = await service.getAllJobs(sortBy);
        set.status = 200;
        return { message: "Jobs fetched successfully", jobs: response };
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
        description: "Get all jobs",
        summary: "Get all jobs",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id }, set }) => {
      try {
        const response = await service.getJobByIdOrThrow(id);
        set.status = 200;
        return { message: "Job fetched successfully", job: response };
      } catch (e: any) {
        if (e.message == "Job not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a job by id",
        summary: "Get a job by id",
      },
    },
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const response = await service.updateJob(id, body);
        set.status = 200;
        return { message: "Job updated successfully", job: response };
      } catch (e: any) {
        if (e.message == "Job not found") {
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
        name: t.Optional(t.String()),
        details: t.Optional(t.String()),
      }),
      detail: {
        description: "Update a job",
        summary: "Update a job",
      },
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id }, set }) => {
      try {
        const deletedJob = await service.deleteJob(id);
        set.status = 200;
        return { message: "Job deleted successfully", deletedJob };
      } catch (e: any) {
        if (e.message == "Job not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a job",
        summary: "Delete a job",
      },
    },
  );

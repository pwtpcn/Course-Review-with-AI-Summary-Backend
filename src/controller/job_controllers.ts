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
    async ({ body }) => {
      try {
        const response = await service.createJob({
          name: body.name,
          details: body.details,
        });
        return { message: "Job created successfully", job: response };
      } catch (e: any) {
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
    async ({ query: { sortBy } }) => {
      try {
        const response = await service.getAllJobs(sortBy);
        return { message: "Jobs fetched successfully", jobs: response };
      } catch (e: any) {
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
    async ({ params: { id } }) => {
      try {
        const response = await service.getJobByIdOrThrow(id);
        return { message: "Job fetched successfully", job: response };
      } catch (e: any) {
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
    async ({ params: { id }, body }) => {
      try {
        const response = await service.updateJob(id, body);
        return { message: "Job updated successfully", job: response };
      } catch (e: any) {
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
    async ({ params: { id } }) => {
      try {
        const deletedJob = await service.deleteJob(id);
        return { message: "Job deleted successfully", deletedJob };
      } catch (e: any) {
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

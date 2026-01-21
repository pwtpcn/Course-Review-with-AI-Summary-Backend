import Elysia from "elysia";
import { CourseServices } from "../service/course_services";
import { t } from "elysia";

const service = new CourseServices();

export const courseController = new Elysia({
  prefix: "/course",
  detail: { tags: ["Course"] },
})

  .post(
    "/create",
    async ({ body }) => {
      try {
        const response = await service.createCourse({
          courseId: body.courseId,
          nameTh: body.nameTh,
          nameEn: body.nameEn,
          description: body.description,
          credits: body.credits,
          year: body.year,
        });
        return { message: "Course created successfully", course: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        courseId: t.String(),
        nameTh: t.String(),
        nameEn: t.String(),
        description: t.String(),
        credits: t.Number(),
        year: t.Number(),
      }),
      detail: {
        description: "Create a new course",
        summary: "Create a new course",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy } }) => {
      try {
        const response = await service.getAllCourses(sortBy);
        return { message: "Courses fetched successfully", courses: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
      }),
      detail: {
        description: "Get all courses",
        summary: "Get all courses",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getCourseByIdOrThrow(id);
        return { message: "Course fetched successfully", course: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a course by id",
        summary: "Get a course by id",
      },
    },
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body }) => {
      try {
        const response = await service.updateCourse(id, body);
        return { message: "Course updated successfully", course: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        nameTh: t.Optional(t.String()),
        nameEn: t.Optional(t.String()),
        description: t.Optional(t.String()),
        credits: t.Optional(t.Number()),
        year: t.Optional(t.Number()),
      }),
      detail: {
        description: "Update a course",
        summary: "Update a course",
      },
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id } }) => {
      try {
        const deletedCourse = await service.deleteCourse(id);
        return { message: "Course deleted successfully", deletedCourse };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a course",
        summary: "Delete a course",
      },
    },
  );

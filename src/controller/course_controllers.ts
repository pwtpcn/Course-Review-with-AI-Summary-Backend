import Elysia, { t } from "elysia";
import { CourseServices } from "../service/course_services";
import { authMiddleware } from "../middleware/auth";

const service = new CourseServices();

export const courseController = new Elysia({
  prefix: "/course",
  detail: { tags: ["Course"] },
})
  .use(authMiddleware)

  .post(
    "/create",
    async ({ body, set, user }) => {
      // Admin only
      if (user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const course = await service.createCourse(body);
        set.status = 201;
        return { message: "Course created successfully", course };
      } catch (e: any) {
        if (e.message === "Course already exists") {
          set.status = 409;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        id: t.String({ minLength: 8, maxLength: 8 }),
        nameTh: t.String({ minLength: 1, maxLength: 255 }),
        nameEn: t.String({ minLength: 1, maxLength: 255 }),
        description: t.String({ minLength: 1, maxLength: 255 }),
        credits: t.Number({ min: 1, max: 6 }),
        year: t.Number({ min: 1, max: 4 }),
      }),
      detail: {
        description: "Create a new course",
        summary: "Create a new course",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy }, set }) => {
      try {
        const courses = await service.getAllCourses(sortBy);
        set.status = 200;
        return { message: "Courses fetched successfully", courses };
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
        description: "Get all courses",
        summary: "Get all courses",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id }, set }) => {
      try {
        const course = await service.getCourseByIdOrThrow(id);
        set.status = 200;
        return { message: "Course fetched successfully", course };
      } catch (e: any) {
        if (e.message === "Course not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
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
    async ({ params: { id }, body, set, user }) => {
      // Admin only
      if (user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const updatedCourse = await service.updateCourse(id, body);
        set.status = 200;
        return {
          message: "Course updated successfully",
          course: updatedCourse,
        };
      } catch (e: any) {
        if (e.message === "Course not found") {
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
    async ({ params: { id }, set, user }) => {
      // Admin only
      if (user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }
      try {
        const deletedCourse = await service.deleteCourse(id);
        set.status = 200;
        return { message: "Course deleted successfully", deletedCourse };
      } catch (e: any) {
        if (e.message === "Course not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
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

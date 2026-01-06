import Elysia from "elysia";
import TeacherServices from "../service/teacher_services";
import { t } from "elysia";

const service = new TeacherServices();

export const teacherController = new Elysia({
  prefix: "/teacher",
  detail: { tags: ["Teacher"] },
})

  .post(
    "/create",
    async ({ body }) => {
      try {
        const response = await service.createTeacher(body);
        return { message: "Teacher created successfully", teacher: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
      }),
      detail: {
        description: "Create a new teacher",
        summary: "Create a new teacher",
      },
    }
  )

  .get(
    "/getall",
    async () => {
      try {
        const response = await service.getAllTeachers();
        return { message: "Teachers fetched successfully", teachers: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get all teachers",
        summary: "Get all teachers",
      },
    }
  )

  .get(
    "/getbyid/:id",
    async ({ params }) => {
      try {
        const response = await service.getTeacherByIdOrThrow(params.id);
        return { message: "Teacher fetched successfully", teacher: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        description: "Get a teacher by id",
        summary: "Get a teacher by id",
      },
    }
  )

  .put(
    "/update/:id",
    async ({ params: { id }, body }) => {
      try {
        const response = await service.updateTeacher(id, body);
        return { message: "Teacher updated successfully", teacher: response };
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
        email: t.Optional(t.String({ format: "email" })),
      }),
      detail: {
        description: "Update a teacher",
        summary: "Update a teacher",
      },
    }
  )

  .delete(
    "/delete/:id",
    async ({ params: { id } }) => {
      try {
        const deletedTeacher = await service.deleteTeacher(id);
        return {
          message: "Teacher deleted successfully",
          teacher: deletedTeacher,
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        description: "Delete a teacher",
        summary: "Delete a teacher",
      },
    }
  );

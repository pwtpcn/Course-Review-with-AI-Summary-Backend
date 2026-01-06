import Elysia from "elysia";
import TeacherServices from "../service/teacher_services";
import { t } from "elysia";
import { Teacher } from "../schema/teacher";

const service = new TeacherServices();

export const teacherController = new Elysia({
  prefix: "/teacher",
  detail: { tags: ["Teacher"] },
})

  .post(
    "/create",
    async ({ body }) => {
      const teacher = new Teacher();
      teacher.name = body.name;
      teacher.email = body.email;

      const response = await service.createTeacher(teacher);
      return { teacher: response };
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
      const response = await service.getAllTeachers();
      return { teachers: response };
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
      const response = await service.getTeacherById(params.id);
      if (!response) return { error: "Teacher not found" };

      return { teacher: response };
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
      const teacher = await service.getTeacherById(id);
      if (!teacher) return { error: "Teacher not found" };

      teacher.name = body.name ?? teacher.name;
      teacher.email = body.email ?? teacher.email;
      teacher.updatedAt = new Date();

      const response = await service.updateTeacher(id, teacher);

      return { teacher: response };
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
    async ({ params }) => {
      const response = await service.deleteTeacher(params.id);
      if (!response) return { error: "Teacher not found" };

      return { teacher: response };
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

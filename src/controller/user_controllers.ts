import Elysia, { t } from "elysia";
import UserServices from "../service/user_services";
import { authMiddleware } from "../middleware/auth";

const service = new UserServices();

export const userController = new Elysia({
  prefix: "/user",
  detail: { tags: ["User"] },
})
  .use(authMiddleware)

  .get(
    "/me",
    ({ user }) => {
      return { message: "User synced", user };
    },
    {
      detail: {
        description: "Get current user profile (syncs with Supabase)",
        summary: "Get current user profile",
      },
    },
  )

  .get(
    "/getall",
    async ({ query: { sortBy } }) => {
      const response = await service.getAllUsers(sortBy);
      return { message: "Users fetched successfully", users: response };
    },
    {
      query: t.Object({
        sortBy: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")])),
      }),
      detail: {
        description: "Get all users",
        summary: "Get all users",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getUserByIdOrThrow(id);
        return { message: "User fetch successfully", user: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a user by id",
        summary: "Get a user by id",
      },
    },
  )

  .put(
    "/changeUsername/:id",
    async ({ params: { id }, body: { username }, user }) => {
      // Authorization Check
      if (user?.id !== id && user?.role !== "admin") {
        return { error: "Forbidden" };
      }

      try {
        const { oldUsername, newUsername } = await service.changeUsername(
          id,
          username,
        );
        return {
          message: "Username changed successfully",
          oldUsername,
          newUsername,
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        username: t.String({
          minLength: 3,
          maxLength: 20,
        }),
      }),
      detail: {
        description: "Change username of a user",
        summary: "Change username of a user",
      },
    },
  )

  .delete(
    "/delete/:id",
    async ({ params: { id }, user }) => {
      // Authorization Check
      if (user?.id !== id && user?.role !== "admin") {
        return { error: "Forbidden" };
      }

      try {
        const result = await service.deleteUser(id);
        return { message: "User deleted successfully", user: result };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a user",
        summary: "Delete a user",
      },
    },
  );

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
    ({ user, set }) => {
      set.status = 200;
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
    async ({ query: { sortBy }, set }) => {
      try {
        const response = await service.getAllUsers(sortBy);
        set.status = 200;
        return { message: "Users fetched successfully", users: response };
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
        description: "Get all users",
        summary: "Get all users",
      },
    },
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id }, set }) => {
      try {
        const response = await service.getUserByIdOrThrow(id);
        set.status = 200;
        return { message: "User fetch successfully", user: response };
      } catch (e: any) {
        if (e.message === "User not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
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

  .get(
    "/getbyemail/:email",
    async ({ params: { email }, set }) => {
      try {
        const response = await service.getUserByEmailOrThrow(email);
        set.status = 200;
        return { message: "User fetch successfully", user: response };
      } catch (e: any) {
        if (e.message === "User not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a user by email",
        summary: "Get a user by email",
      },
    },
  )

  .get(
    "/getbyusername/:username",
    async ({ params: { username }, set }) => {
      try {
        const response = await service.getUserByUsernameOrThrow(username);
        set.status = 200;
        return { message: "User fetch successfully", user: response };
      } catch (e: any) {
        if (e.message === "User not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a user by username",
        summary: "Get a user by username",
      },
    },
  )

  .put(
    "/changeUsername/:id",
    async ({ params: { id }, body: { username }, user, set }) => {
      // Authorization Check
      if (user?.id !== id) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      try {
        const { oldUsername, newUsername } = await service.changeUsername(
          id,
          username,
        );
        set.status = 200;
        return {
          message: "Username changed successfully",
          oldUsername,
          newUsername,
        };
      } catch (e: any) {
        if (e.message === "Username already taken") {
          set.status = 409;
          return { error: e.message };
        }
        if (e.message === "User not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
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
    async ({ params: { id }, user, set }) => {
      // Authorization Check
      if (user?.id !== id && user?.role !== "admin") {
        set.status = 403;
        return { error: "Forbidden" };
      }

      try {
        const result = await service.deleteUser(id);
        set.status = 200;
        return { message: "User deleted successfully", user: result };
      } catch (e: any) {
        if (e.message === "User not found") {
          set.status = 404;
          return { error: e.message };
        }
        set.status = 500;
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

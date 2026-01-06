import Elysia from "elysia";
import UserServices from "../service/user_services";
import { t } from "elysia";
import { User } from "../schema/user";
import { UserLoginResponse } from "../dto/user_login_response";
import { jwt } from "@elysiajs/jwt";

const service = new UserServices();

export const userController = new Elysia({
  prefix: "/user",
  detail: { tags: ["User"] },
})
  .use(
    jwt({
      name: "jwt",
      secret: "Fischl-Von-Luftschloss-Narfidort",
    })
  )

  .post(
    "/register",
    async ({ body: { username, email, password } }) => {
      try {
        const user = await service.registerUser({ username, email, password });
        return { user };
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
        email: t.String({
          format: "email",
        }),
        password: t.String({
          format: "regex",
          regex:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          minLength: 8,
          maxLength: 15,
        }),
      }),
      detail: {
        description: "Register a new user",
        summary: "Register a new user",
      },
    }
  )

  .post(
    "/login",
    async ({ body: { email, password }, jwt, cookie: { auth } }) => {
      const user = await service.verifyCredentials(email, password);

      if (!user) {
        return { error: "Invalid email or password" }; // Unified error message for security
      }

      const accessToken = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      auth.set({
        value: accessToken,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
      });

      const userLoginResponse = new UserLoginResponse(
        user.email,
        user.username,
        user.role,
        accessToken
      );

      return { userLoginResponse };
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
        password: t.String(),
      }),
      detail: {
        description: "Login a user",
        summary: "Login a user",
      },
    }
  )

  .get(
    "/getall",
    async () => {
      const response = await service.getAllUsers();
      return { users: response };
    },
    {
      detail: {
        description: "Get all users",
        summary: "Get all users",
      },
    }
  )

  .get(
    "/getbyid/:id",
    async ({ params: { id } }) => {
      try {
        const response = await service.getUserByIdOrThrow(id);
        return { user: response };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Get a user by id",
        summary: "Get a user by id",
      },
    }
  )

  .put(
    "/changeUsername/:id",
    async ({ params: { id }, body: { username } }) => {
      try {
        await service.changeUsername(id, username);
        return {
          message: "Username changed successfully",
          newUsername: username,
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
    }
  )

  .put(
    "/changePassword/:id",
    async ({
      params: { id },
      body: { password, oldPassword },
      jwt,
      headers: { authorization },
      cookie: { auth },
    }) => {
      // 1. Verify Token
      const profile = await jwt.verify(authorization ?? (auth.value as string));
      if (!profile) return { error: "Unauthorized" };

      // 2. Authorization (ID Check)
      if (profile.sub !== id) return { error: "Forbidden" };

      // 3. Call Service
      try {
        await service.changePassword(id, oldPassword, password);
        const user = await service.getUserById(id); // Re-fetch for response if needed, or just return success
        return {
          message: "Password changed successfully",
          username: user?.username,
        };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        password: t.String({
          format: "regex",
          regex:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          minLength: 8,
          maxLength: 15,
        }),
      }),
      detail: {
        description: "Change password of a user",
        summary: "Change password of a user",
      },
    }
  )

  .delete(
    "/delete/:id",
    async ({ params: { id } }) => {
      try {
        const user = await service.getUserByIdOrThrow(id);
        await service.deleteUser(id);
        return { message: "User deleted successfully", user };
      } catch (e: any) {
        return { error: e.message };
      }
    },
    {
      detail: {
        description: "Delete a user",
        summary: "Delete a user",
      },
    }
  );

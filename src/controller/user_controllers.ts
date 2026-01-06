import Elysia from "elysia";
import UserServices from "../service/user_services";
import { t } from "elysia";
import { User } from "../schema/user";
import { hashPassword } from "../util/hash_password";
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
      const existsEmail = await service.getUserByEmail(email);
      const existsUsername = await service.getUserByUsername(username);

      if (existsEmail) {
        return { error: "Email already used" };
      } else if (existsUsername) {
        return { error: "Username already used" };
      }

      const user = new User();
      user.username = username;
      user.email = email;

      const { hashedPassword, salt } = await hashPassword(password);

      user.hashedPassword = hashedPassword;
      user.salt = salt;

      return { user: await service.registerUser(user) };
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
      const user = await service.getUserByEmail(email);
      if (!user) {
        return { error: "User not found" };
      }
      const { hashedPassword, salt } = user;
      const passwordWithSalt = password + salt;
      const isMatch = await Bun.password.verify(
        passwordWithSalt,
        hashedPassword
      );
      if (!isMatch) {
        return { error: "Invalid password" };
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
      const user = await service.getUserById(id);
      if (!user) {
        return { error: "User not found" };
      }
      
      const response = await service.getUserById(id);
      return { user: response };
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
      const user = await service.getUserById(id);
      if (!user) {
        return { error: "User not found" };
      }

      user.username = username;

      await service.changeUsername(id, username);

      const response = { message: "Username changed successfully", newUsername: username }; 
      return response; 
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

      const user = await service.getUserById(id);
      if (!user) {
        return { error: "User not found" };
      }

      // 3. Verify Old Password
      const { hashedPassword: storedHash, salt } = user;
      const passwordWithSalt = oldPassword + salt;
      const isMatch = await Bun.password.verify(passwordWithSalt, storedHash);
      if (!isMatch) {
        return { error: "Invalid old password" };
      }

      const { hashedPassword, salt: newSalt } = await hashPassword(password);
      user.hashedPassword = hashedPassword;
      user.salt = newSalt;

      await service.changePassword(
        id,
        hashedPassword,
        newSalt
      );

      const response = { message: "Password changed successfully", username: user.username };
      return response;
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
      const user = await service.getUserById(id);
      if (!user) {
        return { error: "User not found" };
      }

      await service.deleteUser(id);

      const response = { message: "User deleted successfully", user };
      return response;
    },
    {
      detail: {
        description: "Delete a user",
        summary: "Delete a user",
      },
    }
  );

import Elysia from "elysia";
import UserServices from "../service/user_services";
import { t } from "elysia";
import { User } from "../schema/user";
import { hashPassword } from "../util/hash_password";
import { UserLoginResponse } from "../dto/user_login_response";
const service = new UserServices();

export const userController = new Elysia({
  prefix: "/user",
  detail: { tags: ["User"] },
})

  .post(
    "/register",
    async ({ body: { username, email, password } }) => {
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
    async ({ body: { email, password } }) => {
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
      const userLoginResponse = new UserLoginResponse(
        user.email,
        user.username,
        user.role
      );

      return { userLoginResponse };
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
        password: t.String({}),
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
      return { users: await service.getAllUsers() };
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
      return { user: await service.getUserById(id) };
    },
    {
      detail: {
        description: "Get a user by id",
        summary: "Get a user by id",
      },
    }
  )

  .post(
    "/changeUsername",
    async ({ body: { id, username } }) => {
      const response = await service.changeUsername(id, username);
      return { user: response };
    },
    {
      body: t.Object({
        id: t.String(),
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

  .post(
    "/changePassword",
    async ({ body: { id, password } }) => {
      const response = await service.changePassword(id, password);
      return { user: response };
    },
    {
      body: t.Object({
        id: t.String(),
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
      const response = await service.deleteUser(id);
      return { user: response };
    },
    {
      detail: {
        description: "Delete a user",
        summary: "Delete a user",
      },
    }
  )
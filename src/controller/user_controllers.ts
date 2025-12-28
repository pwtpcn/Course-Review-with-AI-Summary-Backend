import Elysia from "elysia";
import UserServices from "../service/user_services";
import { t } from "elysia";
import { User } from "../schema/user";
import { hashPassword } from "../util/hash_password";
import { UserLoginResponse } from "../dto/user_login_response";
const service = new UserServices();

export const userController = new Elysia({ prefix: "/user" })
  .post(
    "/register",
    async ({ body: { username, email, password } }) => {
      const user = new User();
      user.username = username;
      user.email = email;
      
      const { hashedPassword, salt } = await hashPassword(password);

      user.hashedPassword = hashedPassword;
      user.salt = salt;
      
      return {user: await service.registerUser(user)};
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
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            minLength: 8,
            maxLength: 15,
        }),
      }),
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
      const isMatch = await Bun.password.verify(passwordWithSalt, hashedPassword);
      if (!isMatch) {
        return { error: "Invalid password" };
      }
      const userLoginResponse = new UserLoginResponse(user.email, user.username, user.role);    
      
      return { userLoginResponse };
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
        password: t.String({

        }),
      }),
    }
  )
import { User } from "../schema/user";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";
import { hashPassword } from "../util/hash_password";

class UserServices {
  private dataSource: DataSource;
  constructor() {
    this.dataSource = dataSource;
  }

  async registerUser(userData: Partial<User> & { password?: string }) {
    const existsEmail = await this.getUserByEmail(userData.email!);
    const existsUsername = await this.getUserByUsername(userData.username!);

    if (existsEmail) {
      throw new Error("Email already used");
    }
    if (existsUsername) {
      throw new Error("Username already used");
    }

    const { hashedPassword, salt } = await hashPassword(userData.password!);

    const user = new User();
    user.email = userData.email!;
    user.username = userData.username!;
    user.hashedPassword = hashedPassword;
    user.salt = salt;
    // user.role is effectively default or optional in partial

    return this.dataSource.manager.save(user);
  }

  async verifyCredentials(identifier: string, password: string) {
    const user = await this.dataSource.manager.findOne(User, {
      where: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return null;

    const { hashedPassword, salt } = user;
    const passwordWithSalt = password + salt;
    const isMatch = await Bun.password.verify(passwordWithSalt, hashedPassword);

    if (!isMatch) return null;
    return user;
  }

  async getUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async getUserById(id: string) {
    return this.dataSource.manager.findOne(User, { where: { id } });
  }

  async getUserByIdOrThrow(id: string) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getAllUsers() {
    return this.dataSource.manager.find(User);
  }

  async getUserByUsername(username: string) {
    return this.dataSource.manager.findOne(User, { where: { username } });
  }

  async changeUsername(id: string, newUsername: string) {
    const user = await this.getUserByIdOrThrow(id);
    await this.dataSource.manager.update(User, id, {
      username: newUsername,
    });

    return { oldUsername: user.username, newUsername };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.getUserByIdOrThrow(id);

    const { hashedPassword: storedHash, salt } = user;
    const passwordWithSalt = oldPassword + salt;
    const isMatch = await Bun.password.verify(passwordWithSalt, storedHash);

    if (!isMatch) {
      throw new Error("Invalid old password");
    }

    const { hashedPassword, salt: newSalt } = await hashPassword(newPassword);

    return this.dataSource.manager.update(User, id, {
      hashedPassword,
      salt: newSalt,
    });
  }

  async deleteUser(id: string) {
    const user = await this.getUserByIdOrThrow(id);
    await this.dataSource.manager.delete(User, id);
    return user;
  }
}

export default UserServices;

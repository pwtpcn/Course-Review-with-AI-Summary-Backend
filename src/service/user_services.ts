import { User } from "../schema/user";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";
import { hashPassword } from "../util/hash_password";

class UserServices {
  private dataSource: DataSource;
  constructor() {
    this.dataSource = dataSource;
  }

  async registerUser(user: User) {
    return this.dataSource.manager.save(user);
  }

  async getUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async getUserById(id: string) {
    return this.dataSource.manager.findOne(User, { where: { id } });
  }

  async getAllUsers() {
    return this.dataSource.manager.find(User);
  }

  async changeUsername(id: string, username: string) {
    return this.dataSource.manager.update(User, id, { username });
  }

  async changePassword(id: string, password: string) {
    const { hashedPassword, salt } = await hashPassword(password);
    return this.dataSource.manager.update(User, id, { hashedPassword, salt });
  }

  async deleteUser(id: string) {
    return this.dataSource.manager.delete(User, id);
  }
}

export default UserServices;

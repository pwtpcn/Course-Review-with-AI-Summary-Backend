import { User } from "../schema/user";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";

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
}

export default UserServices;

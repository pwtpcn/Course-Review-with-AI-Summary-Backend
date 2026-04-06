import { User } from "../schema/user";
import { dataSource } from "../lib/data-source";
import { DataSource } from "typeorm";
import { User as SupabaseUser } from "@supabase/supabase-js";

class UserServices {
  private dataSource: DataSource;
  constructor() {
    this.dataSource = dataSource;
  }

  async syncUser(supabaseUser: SupabaseUser) {
    const { id, email, user_metadata } = supabaseUser;

    let user = await this.getUserById(id);

    if (!user) {
      user = new User();
      user.id = id;
      user.email = email!;
      
      // Use logic to determine username (e.g. from metadata or email)
      user.username =
        user_metadata?.username ||
        user_metadata?.name ||
        email?.split("@")[0] ||
        "user_" + id.slice(0, 8);
      user.role = "user"; // Default role
      await this.dataSource.manager.save(user);
    } else {
      // Optional: Update user details if needed
    }

    return user;
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

  async getUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async getUserByEmailOrThrow(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUserByUsername(username: string) {
    return this.dataSource.manager.findOne(User, { where: { username } });
  }

  async getUserByUsernameOrThrow(username: string) {
    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getAllUsers(sortBy?: "newest" | "oldest") {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }
    return this.dataSource.manager.find(User, { order });
  }

  async changeUsername(id: string, newUsername: string) {
    const user = await this.getUserByIdOrThrow(id);

    // Check if username is taken
    const existing = await this.dataSource.manager.findOne(User, {
      where: { username: newUsername },
    });
    if (existing && existing.id !== id) {
      throw new Error("Username already taken");
    }

    await this.dataSource.manager.update(User, id, {
      username: newUsername,
    });

    return { oldUsername: user.username, newUsername };
  }

  // Delete user (might need to delete from Supabase too via Admin API if strict sync required)
  async deleteUser(id: string) {
    const user = await this.getUserByIdOrThrow(id);
    await this.dataSource.manager.delete(User, id);
    return user;
  }
}

export default UserServices;

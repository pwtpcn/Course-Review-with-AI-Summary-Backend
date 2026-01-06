import { DataSource } from "typeorm";
import { dataSource } from "../data-source";
import { Teacher } from "../schema/teacher";

export class TeacherServices {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createTeacher(teacherData: Partial<Teacher>) {
    if (!teacherData.name || !teacherData.email) {
      throw new Error("Name and email are required");
    }

    const existEmail = await this.getTeacherByEmail(teacherData.email);
    if (existEmail) {
      throw new Error("Email already exists");
    }

    const teacher = new Teacher();
    teacher.name = teacherData.name;
    teacher.email = teacherData.email;

    return this.dataSource.manager.save(Teacher, teacher);
  }

  async getAllTeachers() {
    return this.dataSource.manager.find(Teacher);
  }

  async getTeacherById(id: string) {
    return this.dataSource.manager.findOne(Teacher, { where: { id } });
  }

  async getTeacherByEmail(email: string) {
    return this.dataSource.manager.findOne(Teacher, { where: { email } });
  }

  async getTeacherByIdOrThrow(id: string) {
    const teacher = await this.getTeacherById(id);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    return teacher;
  }

  async updateTeacher(id: string, teacherData: Partial<Teacher>) {
    const teacher = await this.getTeacherByIdOrThrow(id);
    await this.dataSource.manager.update(Teacher, id, teacher);

    const updatedTeacher = new Teacher();
    updatedTeacher.name = teacherData.name ?? teacher.name;
    updatedTeacher.email = teacherData.email ?? teacher.email;
    updatedTeacher.updatedAt = new Date();

    await this.dataSource.manager.update(Teacher, id, updatedTeacher);

    return await this.getTeacherByIdOrThrow(id);
  }

  async deleteTeacher(id: string) {
    const deletedTeacher = await this.getTeacherByIdOrThrow(id);
    await this.dataSource.manager.delete(Teacher, id);

    return deletedTeacher;
  }
}

export default TeacherServices;

import { DataSource } from "typeorm";
import { dataSource } from "../data-source";
import { Teacher } from "../schema/teacher";

export class TeacherController {
    private dataSource: DataSource;
    
    constructor() {
        this.dataSource = dataSource;
    }

    async createTeacher(teacher: Teacher) {
        return this.dataSource.manager.save(Teacher, teacher);
    }

    async getAllTeachers() {
        return this.dataSource.manager.find(Teacher);
    }

    async getTeacherById(id: string) {
        return this.dataSource.manager.findOne(Teacher, { where: { id } });
    }

    async updateTeacher(id: string, teacher: Teacher) {
        return this.dataSource.manager.update(Teacher, id, teacher);
    }

    async deleteTeacher(id: string) {
        return this.dataSource.manager.delete(Teacher, id);
    }
}

export default TeacherController;
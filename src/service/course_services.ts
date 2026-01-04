import { Course } from "../schema/course";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";

export class CourseServices {
    private dataSource: DataSource;
    
    constructor() {
        this.dataSource = dataSource;
    }

    async createCourse(course: Course) {
        return this.dataSource.manager.save(Course, course);
    }

    async getAllCourses() {
        return this.dataSource.manager.find(Course);
    }

    async getCourseById(id: string) {
        return this.dataSource.manager.findOne(Course, { where: { courseId: id } });
    }

    async updateCourse(id: string, course: Course) {
        return this.dataSource.manager.update(Course, id, course);
    }

    async deleteCourse(id: string) {
        return this.dataSource.manager.delete(Course, id);
    }
}

export default CourseServices;
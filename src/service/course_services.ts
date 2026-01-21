import { Course } from "../schema/course";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";

export class CourseServices {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createCourse(courseData: Partial<Course>) {
    if (!courseData.courseId) {
      throw new Error("Course ID is required");
    }

    const existsCourse = await this.getCourseById(courseData.courseId!);
    if (existsCourse) {
      throw new Error("Course already exists");
    }

    const course = new Course();
    course.courseId = courseData.courseId;
    course.nameTh = courseData.nameTh!;
    course.nameEn = courseData.nameEn!;
    course.description = courseData.description!;
    course.credits = courseData.credits!;
    course.year = courseData.year!;

    return this.dataSource.manager.save(Course, course);
  }

  async getAllCourses(sortBy?: "newest" | "oldest") {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }
    return this.dataSource.manager.find(Course, { order });
  }

  async getCourseById(id: string) {
    return this.dataSource.manager.findOne(Course, { where: { courseId: id } });
  }

  async getCourseByIdOrThrow(id: string) {
    const course = await this.getCourseById(id);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  async getCourseByYear(year: number) {
    return this.dataSource.manager.find(Course, { where: { year } });
  }

  async getCourseByTeacherId(teacherId: string) {
    return this.dataSource.manager.find(Course, {
      where: { teachers: { id: teacherId } },
    });
  }

  async updateCourse(id: string, courseData: Partial<Course>) {
    const course = await this.getCourseByIdOrThrow(id);

    Object.assign(course, courseData);
    return await this.dataSource.manager.save(course);
  }

  async deleteCourse(id: string) {
    const deletedCourse = await this.getCourseByIdOrThrow(id);
    await this.dataSource.manager.delete(Course, id);
    return deletedCourse;
  }
}

export default CourseServices;

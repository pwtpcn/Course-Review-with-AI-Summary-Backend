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

    await this.getCourseByIdOrThrow(courseData.courseId);

    const course = new Course();
    course.courseId = courseData.courseId;
    course.nameTh = courseData.nameTh!;
    course.nameEn = courseData.nameEn!;
    course.description = courseData.description!;
    course.credits = courseData.credits!;
    course.year = courseData.year!;

    return this.dataSource.manager.save(Course, course);
  }

  async getAllCourses() {
    return this.dataSource.manager.find(Course);
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

    const updatedCourse = new Course();
    updatedCourse.courseId = course.courseId;
    updatedCourse.nameTh = courseData.nameTh ?? course.nameTh;
    updatedCourse.nameEn = courseData.nameEn ?? course.nameEn;
    updatedCourse.description = courseData.description ?? course.description;
    updatedCourse.credits = courseData.credits ?? course.credits;
    updatedCourse.year = courseData.year ?? course.year;
    updatedCourse.updatedAt = new Date();

    await this.dataSource.manager.update(Course, id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: string) {
    const deletedCourse = await this.getCourseByIdOrThrow(id);
    await this.dataSource.manager.delete(Course, id);
    return deletedCourse;
  }
}

export default CourseServices;

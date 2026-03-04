import { Course } from "../schema/course";
import { dataSource } from "../lib/data-source";
import { DataSource } from "typeorm";
import { CreateCourseInput, UpdateCourseInput } from "../dto/course.dto";
import { Review } from "../schema/review";

export class CourseServices {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createCourse(courseData: CreateCourseInput) {
    const existsCourse = await this.getCourseById(courseData.id);
    if (existsCourse) {
      throw new Error("Course already exists");
    }

    const course = new Course();
    course.id = courseData.id;
    course.nameTh = courseData.nameTh;
    course.nameEn = courseData.nameEn;
    course.description = courseData.description;
    course.credits = courseData.credits;
    course.year = courseData.year;

    return this.dataSource.manager.save(Course, course);
  }

  async getAllCourses(
    sortBy?: "newest" | "oldest",
    category?: "Core" | "Elective",
    year?: number,
    search?: string,
  ) {
    const query = this.dataSource.manager.createQueryBuilder(Course, "course");

    if (category) {
      query.andWhere("course.category = :category", { category });
    }

    if (year) {
      query.andWhere("course.year = :year", { year });
    }

    if (search) {
      query.andWhere(
        "(course.nameTh LIKE :search OR course.nameEn LIKE :search OR course.id LIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (sortBy === "newest") {
      query.orderBy("course.createdAt", "DESC");
    } else if (sortBy === "oldest") {
      query.orderBy("course.createdAt", "ASC");
    }

    return query.getMany();
  }

  async getCourseById(id: string) {
    return this.dataSource.manager.findOne(Course, { where: { id } });
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

  async updateCourse(id: string, courseData: UpdateCourseInput) {
    const course = await this.getCourseByIdOrThrow(id);

    Object.assign(course, courseData);
    return await this.dataSource.manager.save(course);
  }

  async recalculateCourseRating(courseId: string) {
    const course = await this.getCourseByIdOrThrow(courseId);

    // Calculate new average and count
    const result = await this.dataSource.manager
      .createQueryBuilder(Review, "review")
      .select("AVG(review.rating)", "average")
      .addSelect("COUNT(review.id)", "count")
      .where("review.courseId = :courseId", { courseId })
      .andWhere("review.status = :status", { status: "active" }) // only count active reviews
      .getRawOne();

    const averageRating = result?.average
      ? parseFloat(parseFloat(result.average).toFixed(1))
      : 0;
    const reviewCount = result?.count ? parseInt(result.count, 10) : 0;

    // Update course with new values
    course.rating = averageRating;
    course.reviewCount = reviewCount;
    return await this.dataSource.manager.save(course);
  }

  async deleteCourse(id: string) {
    const deletedCourse = await this.getCourseByIdOrThrow(id);
    await this.dataSource.manager.delete(Course, id);
    return deletedCourse;
  }
}

export default CourseServices;

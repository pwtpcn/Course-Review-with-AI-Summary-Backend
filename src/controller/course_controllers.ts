import Elysia from "elysia";
import { CourseServices } from "../service/course_services";
import { t } from "elysia";
import { Course } from "../schema/course";

const service = new CourseServices();

export const courseController = new Elysia({
    prefix: "/course",
    detail: { tags: ["Course"] },
})

    .post(
        "/create",
        async ({ body }) => {
            if(await service.getCourseById(body.courseId)) {
                return { error: "Course already exists" };
            }

            const course = new Course();
            course.courseId = body.courseId;
            course.nameTh = body.nameTh;
            course.nameEn = body.nameEn;
            course.description = body.description;
            course.credits = body.credits;

            const response = await service.createCourse(course);
            return { course: response };
        },
        {
            body: t.Object({
                courseId: t.String(),
                nameTh: t.String(),
                nameEn: t.String(),
                description: t.String(),
                credits: t.Number(),
                teacherId: t.String(),
            }),
            detail: {
                description: "Create a new course",
                summary: "Create a new course",
            },
        }
    )

    .get(
        "/getall",
        async () => {
            const response = await service.getAllCourses();
            return { courses: response };
        },
        {
            detail: {
                description: "Get all courses",
                summary: "Get all courses",
            },
        }
    )   
    
    .get(
        "/getbyid/:id",
        async ({ params: { id } }) => {
            const response = await service.getCourseById(id);
            if(!response) {
                return { error: "Course not found" };
            }

            return { course: response };
        },
        {
            detail: {
                description: "Get a course by id",
                summary: "Get a course by id",
            },
        }
    )

    .post(
        "/update/:id",
        async ({ params: { id }, body }) => {
            const course = await service.getCourseById(id);
            if (!course) {
                return { error: "Course not found" };
            }

            const newCourse = new Course();
            newCourse.courseId = body.courseId ?? id;
            newCourse.nameTh = body.nameTh ?? course.nameTh;
            newCourse.nameEn = body.nameEn ?? course.nameEn;
            newCourse.description = body.description ?? course.description;
            newCourse.credits = body.credits ?? course.credits;

            const response = await service.updateCourse(id, newCourse);
            return { course: response };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                courseId: t.String(),
                nameTh: t.Optional(t.String()),
                nameEn: t.Optional(t.String()),
                description: t.Optional(t.String()),
                credits: t.Optional(t.Number()),
                teacherId: t.Optional(t.String()),
            }),
            detail: {
                description: "Update a course",
                summary: "Update a course",
            },
        }
    )
    
    .delete(
        "/delete/:id",
        async ({ params: { id } }) => {
            return { course: await service.deleteCourse(id) };
        },
        {
            detail: {
                description: "Delete a course",
                summary: "Delete a course",
            },
        }
    )
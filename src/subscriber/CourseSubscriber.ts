import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { Course } from "../schema/course";
import { AiService } from "../service/ai_services";

@EventSubscriber()
export class CourseSubscriber implements EntitySubscriberInterface<Course> {
  private get aiService() {
    return new AiService();
  }

  listenTo() {
    return Course;
  }

  async afterInsert(event: InsertEvent<Course>) {
    if (event.entity && event.entity.id) {
      console.log(
        `[CourseSubscriber] Syncing new course to Qdrant: ${event.entity.id}`,
      );
      this.aiService.syncCourse(event.entity.id).catch((err) => {
        console.error("Failed to sync new course to Qdrant:", err);
      });
    }
  }

  async afterUpdate(event: UpdateEvent<Course>) {
    if (event.entity && event.entity.id) {
      console.log(
        `[CourseSubscriber] Syncing updated course to Qdrant: ${event.entity.id}`,
      );
      this.aiService.syncCourse(event.entity.id).catch((err) => {
        console.error("Failed to sync updated course to Qdrant:", err);
      });
    }
  }
}

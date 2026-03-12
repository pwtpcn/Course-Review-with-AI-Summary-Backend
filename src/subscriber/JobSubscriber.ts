import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { Job } from "../schema/job";
import { AiService } from "../service/ai_services";

@EventSubscriber()
export class JobSubscriber implements EntitySubscriberInterface<Job> {
  private get aiService() {
    return new AiService();
  }

  listenTo() {
    return Job;
  }

  async afterInsert(event: InsertEvent<Job>) {
    if (event.entity && event.entity.id) {
      console.log(
        `[JobSubscriber] Syncing new job to Qdrant: ${event.entity.id}`,
      );
      this.aiService.syncJob(event.entity.id).catch((err) => {
        console.error("Failed to sync new job to Qdrant:", err);
      });
    }
  }

  async afterUpdate(event: UpdateEvent<Job>) {
    if (event.entity && event.entity.id) {
      console.log(
        `[JobSubscriber] Syncing updated job to Qdrant: ${event.entity.id}`,
      );
      this.aiService.syncJob(event.entity.id).catch((err) => {
        console.error("Failed to sync updated job to Qdrant:", err);
      });
    }
  }

  async afterRemove(event: RemoveEvent<Job>) {
    const entityId =
      event.entityId ||
      event.databaseEntity?.id ||
      (event.entity && event.entity.id);
    if (entityId) {
      console.log(`[JobSubscriber] Deleting job from Qdrant: ${entityId}`);
      this.aiService.deleteJob(entityId).catch((err) => {
        console.error("Failed to delete job from Qdrant:", err);
      });
    }
  }
}

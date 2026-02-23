import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from "typeorm";
import { Review } from "../schema/review";
import { AiService } from "../service/ai_services";

@EventSubscriber()
export class ReviewSubscriber implements EntitySubscriberInterface<Review> {
  private get aiService() {
    return new AiService();
  }

  listenTo() {
    return Review;
  }

  async afterInsert(event: InsertEvent<Review>) {
    if (event.entity && event.entity.id) {
      console.log(
        `[ReviewSubscriber] Syncing new review to Qdrant: ${event.entity.id}`,
      );
      this.aiService.syncReview(event.entity.id).catch((err) => {
        console.error("Failed to sync new review to Qdrant:", err);
      });
    }
  }

  async afterUpdate(event: UpdateEvent<Review>) {
    const entityId = event.entity?.id || event.databaseEntity?.id;

    if (entityId) {
      console.log(
        `[ReviewSubscriber] Syncing updated review to Qdrant: ${entityId}`,
      );
      this.aiService.syncReview(entityId).catch((err) => {
        console.error("Failed to sync updated review to Qdrant:", err);
      });
    }
  }
}

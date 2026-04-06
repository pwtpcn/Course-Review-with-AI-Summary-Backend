import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
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
    const currentStatus = event.entity?.status || event.databaseEntity?.status;

    if (entityId) {
      if (currentStatus === "hidden") {
        console.log(
          `[ReviewSubscriber] Deleting hidden review from Qdrant: ${entityId}`,
        );
        this.aiService.deleteReview(entityId).catch((err) => {
          console.error("Failed to delete hidden review from Qdrant:", err);
        });
      } else {
        console.log(
          `[ReviewSubscriber] Syncing updated review to Qdrant: ${entityId}`,
        );
        this.aiService.syncReview(entityId).catch((err) => {
          console.error("Failed to sync updated review to Qdrant:", err);
        });
      }
    }
  }

  async afterRemove(event: RemoveEvent<Review>) {
    const entityId =
      event.entityId ||
      event.databaseEntity?.id ||
      (event.entity && event.entity.id);
    if (entityId) {
      console.log(
        `[ReviewSubscriber] Deleting review from Qdrant: ${entityId}`,
      );
      this.aiService.deleteReview(entityId).catch((err) => {
        console.error("Failed to delete review from Qdrant:", err);
      });
    }
  }
}

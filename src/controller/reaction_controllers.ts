import Elysia, { t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { ReactionService } from "../service/reaction_services";

const service = ReactionService.getInstance();

export const reactionController = new Elysia({
  prefix: "/reaction",
  detail: { tags: ["Reaction"] },
})
  .use(authMiddleware)

  .post(
    "/toggle",
    async ({ body, set, user }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const reaction = await service.toggleReaction(
          user.id,
          body.reviewId,
          body.type,
        );
        set.status = 200;
        return { message: "Reaction toggled successfully", reaction };
      } catch (e: any) {
        set.status = 500;
        return { error: e.message };
      }
    },
    {
      body: t.Object({
        reviewId: t.String(),
        type: t.Union([t.Literal("like"), t.Literal("dislike")]),
      }),
      detail: {
        description: "Toggle reaction",
        summary: "Toggle reaction",
      },
    },
  );

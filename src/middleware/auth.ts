import { Elysia } from "elysia";
import { supabase } from "../lib/supabase";
import UserServices from "../service/user_services";

const userServices = new UserServices();

export const authMiddleware = (app: Elysia) =>
  app.derive(async ({ headers, set }) => {
    const authHeader = headers["authorization"];

    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.split(" ")[1];

    try {
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        return { user: null };
      }

      // Check if user exists in local DB, if not sync it
      let localUser = await userServices.getUserById(supabaseUser.id);

      if (!localUser) {
        // Auto-sync user from Supabase to local DB on first access
        // We might need to fetch metadata if not present in getUser
        localUser = await userServices.syncUser(supabaseUser);
      }

      return { user: localUser };
    } catch (err) {
      console.error("Auth middleware error:", err);
      return { user: null };
    }
  });

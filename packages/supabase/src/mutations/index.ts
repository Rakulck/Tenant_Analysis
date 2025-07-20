import { logger } from "@v1/logger";
import { createServerClientFromEnv } from "@v1/supabase/server";
import type { Database, Tables, TablesUpdate } from "../types";

export async function updateUser(userId: string, data: TablesUpdate<"user_profiles">) {
  const supabase = createServerClientFromEnv();

  try {
    const result = await supabase.from("user_profiles").update(data).eq("id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

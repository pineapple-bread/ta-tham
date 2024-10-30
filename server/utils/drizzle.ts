import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

// inferSelect, inferInput

// Array of id

import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { rolePrivilegeTable, userRoleTable } from "~/server/database/schema";

const deleteUserRoleSchema = z.object({
  id: z.array(
    createSelectSchema(userRoleTable).pick({
      id: true,
    }),
  ),
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, (body) =>
    deleteUserRoleSchema.safeParse(body),
  );
  if (!body.success) {
    return createError({
      statusCode: 400,
      message: "body is required to process! ╥﹏╥",
    });
  }
  await useDrizzle()
    .delete(userRoleTable)
    .where(
      inArray(
        userRoleTable.id,
        body.data.id.map((ur) => ur.id),
      ),
    );
  return {
    message: "Successfully deleted!",
  };
});

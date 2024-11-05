import { createSelectSchema } from "drizzle-zod";
import { userRoleTable } from "~/server/database/schema";

const paramSchema = createSelectSchema(userRoleTable).pick({
  id: true,
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const param = await getValidatedRouterParams(event, (param) =>
    paramSchema.safeParse(param),
  );
  if (!param.success) {
    return createError({
      statusCode: 400,
      message: "id is required to process! ╥﹏╥",
    });
  }
  await useDrizzle()
    .delete(userRoleTable)
    .where(eq(userRoleTable.id, param.data.id));
  return {
    message: "Successfully deleted!",
  };
});

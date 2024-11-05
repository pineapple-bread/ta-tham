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
  const result = await useDrizzle().query.userRoleTable.findFirst({
    where: eq(userRoleTable.id, param.data.id),
    columns: {
      id: true,
      name: true,
    },
    with: {
      rolePrivilege: {
        columns: {
          privilege: true,
        },
      },
    },
  });
  return result;
});

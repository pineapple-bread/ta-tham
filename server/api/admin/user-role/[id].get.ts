import { createSelectSchema } from "drizzle-zod";
import { userRole } from "~/server/database/schema";

const MIN_ID_LENGTH = 1;
const querySchema = createSelectSchema(userRole, {
  id: (schema) => schema.id.min(MIN_ID_LENGTH),
}).pick({
  id: true,
});

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const param = await getValidatedRouterParams(event, (param) =>
    querySchema.safeParse(param),
  );
  if (!param.data?.id) {
    return createError({
      statusCode: 400,
      message: "Id is required to process! ╥﹏╥",
    });
  }
  const result = await useDrizzle().query.userRole.findFirst({
    where: eq(userRole.id, param.data.id),
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

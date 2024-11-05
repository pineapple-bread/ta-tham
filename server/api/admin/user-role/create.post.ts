import { createInsertSchema } from "drizzle-zod";
import { v4 as uuidv4 } from "uuid";
import { userRoleTable, rolePrivilegeTable } from "~/server/database/schema";
import { z } from "zod";

const insertRolePrivilege = z.object({
  rolePrivilege: z.array(
    createInsertSchema(rolePrivilegeTable).pick({
      privilege: true,
    }),
  ),
});

const createUserRoleSchema = createInsertSchema(userRoleTable, {
  name: (schema) => schema.name.regex(USER_ROLE_NAME_REGEX),
})
  .pick({
    name: true,
  })
  .merge(insertRolePrivilege);

// Ensure user have enough role. API keys is not required rnow
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, (body) =>
    createUserRoleSchema.safeParse(body),
  );
  if (!body.success) {
    return createError({
      statusCode: 400,
      message: "body is invalid! ╥﹏╥",
    });
  }
  const userRoleId = uuidv4();
  await useDrizzle().batch([
    useDrizzle()
      .insert(userRoleTable)
      .values({ id: userRoleId, name: body.data.name }),
    useDrizzle()
      .insert(rolePrivilegeTable)
      .values(
        body.data.rolePrivilege.map((rp) => ({
          user_role_id: userRoleId,
          privilege: rp.privilege,
        })),
      ),
  ]);
  return {
    message: "Successfully created!",
  };
});

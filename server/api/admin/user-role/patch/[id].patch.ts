// insert -> delete if not in array
import { z } from "zod";
import { userRoleTable, rolePrivilegeTable } from "~/server/database/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

const paramSchema = createSelectSchema(userRoleTable).pick({
  id: true,
});

const insertRolePrivilege = z.object({
  rolePrivilege: z.array(
    createInsertSchema(rolePrivilegeTable).pick({
      privilege: true,
    }),
  ),
});

const updateUserRoleSchema = createInsertSchema(userRoleTable, {
  name: (schema) => schema.name.regex(USER_ROLE_NAME_REGEX),
})
  .pick({
    name: true,
  })
  .merge(insertRolePrivilege);

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const param = await getValidatedRouterParams(event, (param) =>
    paramSchema.safeParse(param),
  );
  const body = await readValidatedBody(event, (body) =>
    updateUserRoleSchema.safeParse(body),
  );
  if (!param.success) {
    return createError({
      statusCode: 400,
      message: "id is required to process! ╥﹏╥",
    });
  }
  if (!body.success) {
    return createError({
      statusCode: 400,
      message: "body is invalid! ╥﹏╥",
    });
  }
  await useDrizzle().batch([
    useDrizzle()
      .update(userRoleTable)
      .set({ name: body.data.name })
      .where(
        and(
          eq(userRoleTable.id, param.data.id),
          ne(userRoleTable.name, body.data.name),
        ),
      ),
    useDrizzle()
      .insert(rolePrivilegeTable)
      .values(
        body.data.rolePrivilege.map((rp) => ({
          user_role_id: param.data.id,
          privilege: rp.privilege,
        })),
      )
      .onConflictDoNothing(),
    useDrizzle()
      .delete(rolePrivilegeTable)
      .where(
        and(
          eq(rolePrivilegeTable.user_role_id, param.data.id),
          notInArray(
            rolePrivilegeTable.privilege,
            body.data.rolePrivilege.map((p) => p.privilege),
          ),
        ),
      ),
  ]);
  return {
    message: "Successfully updated!",
  };
});

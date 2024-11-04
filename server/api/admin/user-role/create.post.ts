import { createInsertSchema } from "drizzle-zod";
import { v4 as uuidv4 } from "uuid";
import { userRole, rolePrivilege } from "~/server/database/schema";
import { z } from "zod";
import { BatchItem } from "drizzle-orm/batch";

const USER_ROLE_NAME_REGEX = /^[a-zA-Z0-9]{1,}$/;

const insertRolePrivilege = z.object({
  rolePrivilege: z.array(
    createInsertSchema(rolePrivilege).pick({
      privilege: true,
    }),
  ),
});

const createUserRoleSchema = createInsertSchema(userRole, {
  name: (schema) => schema.name.regex(USER_ROLE_NAME_REGEX),
})
  .pick({
    name: true,
  })
  .merge(insertRolePrivilege);

// Ensure user have enough role. API keys is not required rnow
export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const createUserRoleInput = await readValidatedBody(event, (body) =>
      createUserRoleSchema.safeParse(body),
    );
    const userRoleId = uuidv4();
    const batchRequestArray: [BatchItem<"sqlite">] = [
      useDrizzle()
        .insert(userRole)
        .values({ id: userRoleId, name: createUserRoleInput.data!.name }),
    ];

    const rolePrivilegeInsertArray: Array<InsertRolePrivilege> = [];
    if (createUserRoleInput.data?.rolePrivilege.length) {
      for (let i = 0; i < createUserRoleInput.data.rolePrivilege.length; i++) {
        rolePrivilegeInsertArray.push({
          user_role_id: userRoleId,
          privilege: createUserRoleInput.data.rolePrivilege[i].privilege,
        });
      }
      batchRequestArray.push(
        useDrizzle().insert(rolePrivilege).values(rolePrivilegeInsertArray),
      );
    }
    await useDrizzle().batch(batchRequestArray);
    return {
      message: "Successfully created!",
    };
  } catch (error) {
    console.error(error);
    return createError({
      statusCode: 500,
      message: "Something went wrong! ╥﹏╥",
    });
  }
});

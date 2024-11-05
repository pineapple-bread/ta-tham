// This route is to create user
// If there is a role field -> adding using zod extend
// Insert the role field into zod.
// Remember to hash password.
import { createInsertSchema } from "drizzle-zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { userTable, userOnUserRoleTable } from "~/server/database/schema";

const insertUserRoleSchema = z.object({
  userRole: z.array(
    createInsertSchema(userOnUserRoleTable).pick({
      user_role_id: true,
    }),
  ),
});

const createUserSchema = createInsertSchema(userTable, {
  email: (schema) => schema.email.email(),
  username: (schema) => schema.username.regex(USERNAME_REGEX),
  first_name: (schema) => schema.first_name.regex(NAME_REGEX),
  last_name: (schema) => schema.last_name.regex(NAME_REGEX),
  password_hash: (schema) => schema.password_hash.regex(PASSWORD_REGEX),
})
  .pick({
    email: true,
    username: true,
    first_name: true,
    last_name: true,
    password_hash: true,
  })
  .merge(insertUserRoleSchema);

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const body = await readValidatedBody(event, (body) =>
    createUserSchema.safeParse(body),
  );
  if (!body.success) {
    return createError({
      statusCode: 400,
      message: "body is required to process! ╥﹏╥",
    });
  }
  const passwordHash = await hashPassword(body.data.password_hash);
  const userRoleId = uuidv4();
  await useDrizzle().batch([
    useDrizzle().insert(userTable).values({
      id: userRoleId,
      email: body.data.email,
      username: body.data.username,
      first_name: body.data.first_name,
      last_name: body.data.last_name,
      password_hash: passwordHash,
    }),
    useDrizzle()
      .insert(userOnUserRoleTable)
      .values(
        body.data.userRole.map((ur) => ({
          user_id: userRoleId,
          user_role_id: ur.user_role_id,
        })),
      ),
  ]);
  return {
    message: "Successfully created!",
  };
});

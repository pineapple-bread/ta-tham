import { createInsertSchema } from "drizzle-zod";
import {
  userTable,
  userRoleTable,
  userOnUserRoleTable,
} from "~/server/database/schema";

const signInSchema = createInsertSchema(userTable, {
  email: (schema) => schema.email.email(),
  password_hash: (schema) => schema.password_hash.regex(PASSWORD_REGEX),
}).pick({
  email: true,
  password_hash: true,
});

// I won't change password_hash -> password (◕ω◕✿)

// Remember to put captcha!
// Not putting email verified here yet!
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    signInSchema.safeParse(body),
  );
  if (!body.success) {
    return createError({
      statusCode: 403,
      message: "Wrong credentials! ╥﹏╥",
    });
  }
  // This is only one item since email is unique
  const userCredential = await useDrizzle()
    .select({
      id: userTable.id,
      username: userTable.username,
      password_hash: userTable.password_hash,
      is_email_verified: userTable.is_email_verified,
      password_retry_counter: userTable.password_retry_counter,
    })
    .from(userTable)
    .where(eq(userTable.email, body.data.email));
  if (!userCredential.length) {
    return createError({
      statusCode: 403,
      message: "Wrong credentials! ╥﹏╥",
    });
  }
  if (userCredential[0].password_retry_counter > 5) {
    return createError({
      statusCode: 429,
      message: "Please contact support! (◕‸ ◕✿)",
    });
  }
  if (
    !(await verifyPassword(
      userCredential[0].password_hash,
      body.data.password_hash,
    ))
  ) {
    await useDrizzle()
      .update(userTable)
      .set({
        password_retry_counter: userCredential[0].password_retry_counter + 1,
      })
      .where(eq(userTable.id, userCredential[0].id));
    return createError({
      statusCode: 403,
      message: "Wrong credentials! ╥﹏╥",
    });
  }
  // Update user counter to 0
  await useDrizzle().update(userTable).set({ password_retry_counter: 0 });
  await setUserSession(event, {
    user: {
      id: userCredential[0].id,
      username: userCredential[0].username,
    },
  });
  return {
    message: `You will be logged in under username: ${userCredential[0].username}`,
  };
});

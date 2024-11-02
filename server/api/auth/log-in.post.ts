import { createInsertSchema } from "drizzle-zod";
import { user, userRole, userOnUserRole } from "~/server/database/schema";

const MIN_INPUT_LENGTH = 1;

const insertUserSchema = createInsertSchema(user, {
  email: (schema) => schema.email.email(),
  password_hash: (schema) => schema.password_hash.min(MIN_INPUT_LENGTH),
});

// I won't change password_hash -> password (◕ω◕✿)
const signInSchema = insertUserSchema.pick({
  email: true,
  password_hash: true,
});

// Remember to put captcha!
// Not putting email verified here yet!
export default defineEventHandler(async (event) => {
  try {
    const signInInput = await readValidatedBody(event, (body) =>
      signInSchema.safeParse(body),
    );
    if (!signInInput.success) {
      return createError({
        statusCode: 403,
        message: "Wrong credentials! ╥﹏╥",
      });
    }
    // This is only one item since email is unique
    const userCredential = await useDrizzle()
      .select({
        id: user.id,
        username: user.username,
        password_hash: user.password_hash,
        is_email_verified: user.is_email_verified,
        password_retry_counter: user.password_retry_counter,
      })
      .from(user)
      .where(eq(user.email, signInInput.data.email));
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
        signInInput.data.password_hash,
      ))
    ) {
      await useDrizzle()
        .update(user)
        .set({
          password_retry_counter: userCredential[0].password_retry_counter + 1,
        })
        .where(eq(user.id, userCredential[0].id));
      return createError({
        statusCode: 403,
        message: "Wrong credentials! ╥﹏╥",
      });
    }
    // Update user counter to 0
    await useDrizzle().update(user).set({ password_retry_counter: 0 });
    await setUserSession(event, {
      user: {
        id: userCredential[0].id,
        username: userCredential[0].username,
      },
    });
    return {
      message: `You will be logged in under username: ${userCredential[0].username}`,
    };
  } catch (error) {
    console.error(error);
    return createError({
      statusCode: 500,
      message: "Something gone wrong! ╥﹏╥",
    });
  }
});

import { createInsertSchema } from "drizzle-zod";
import { count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  user,
  userOnUserRole,
  rolePrivilege,
  userRole,
} from "~/server/database/schema";

const MAX_AGE = 60 * 60 * 24 * 1;

const USERNAME_REGEX = /^[a-zA-Z0-9]{8,25}$/;

const NAME_REGEX = /^[a-zA-Z]{1,}$/;

const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const insertUserSchema = createInsertSchema(user, {
  email: (schema) => schema.email.email(),
  username: (schema) => schema.username.regex(USERNAME_REGEX),
  first_name: (schema) => schema.first_name.regex(NAME_REGEX),
  last_name: (schema) => schema.last_name.regex(NAME_REGEX),
  password_hash: (schema) => schema.password_hash.regex(PASSWORD_REGEX),
});

const signUpSchema = insertUserSchema.pick({
  email: true,
  username: true,
  first_name: true,
  last_name: true,
  password_hash: true,
});

// Remember to put captcha
export default defineEventHandler(async (event) => {
  try {
    const userCount = await useDrizzle().select({ count: count() }).from(user);
    if (userCount[0].count > 0) {
      return createError({
        statusCode: 409,
        message: "User already exists! ╥﹏╥",
      });
    }
    const signUpInput = await readValidatedBody(event, (body) =>
      signUpSchema.safeParse(body),
    );
    if (!signUpInput.success) {
      return createError({
        statusCode: 400,
        message: "Invalid sign up data! ╥﹏╥",
      });
    }
    const userRoleId = uuidv4();
    const rolePrivilegeId = uuidv4();
    const userId = uuidv4();
    const passwordHash = await hashPassword(signUpInput.data.password_hash);
    // Admin must be the first user! (◕‸ ◕✿). Don't delete the admin otherwise you will make me sad! ╥﹏╥
    // Delete all userRole and rolePrivilege before proceeding.
    await useDrizzle().batch([
      useDrizzle().delete(userRole),
      useDrizzle().insert(userRole).values({ id: userRoleId, name: "admin" }),
      useDrizzle().insert(rolePrivilege).values({
        id: rolePrivilegeId,
        user_role_id: userRoleId,
        privilege: "admin.all",
      }),
      useDrizzle().insert(user).values({
        id: userId,
        email: signUpInput.data.email,
        username: signUpInput.data.username,
        first_name: signUpInput.data.first_name,
        last_name: signUpInput.data.last_name,
        password_hash: passwordHash,
      }),
      useDrizzle().insert(userOnUserRole).values({
        user_id: userId,
        user_role_id: userRoleId,
      }),
    ]);
    // For creating first user we can use the data defining to create instead!
    await setUserSession(
      event,
      {
        user: {
          id: userId,
          username: signUpInput.data.username,
        },
      },
      {
        maxAge: MAX_AGE,
      },
    );
    return {
      message: `You will be logged in under username: ${signUpInput.data.username}`,
    };
  } catch (error) {
    console.error(error);
    return createError({
      statusCode: 500,
      message: "Something gone wrong! ╥﹏╥",
    });
  }
});

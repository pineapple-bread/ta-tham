import { createInsertSchema } from "drizzle-zod";
import { count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  userTable,
  userOnUserRoleTable,
  rolePrivilegeTable,
  userRoleTable,
} from "~/server/database/schema";

const MAX_AGE = 60 * 60 * 24 * 1;

const USERNAME_REGEX = /^[a-zA-Z0-9]{8,25}$/;

const NAME_REGEX = /^[a-zA-Z]{1,}$/;

const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// Not validating these 2 because it's not the value input by user
const USER_ROLE_NAME = "admin";
const USER_PRIVILEGE = "admin.all";

const signUpSchema = createInsertSchema(userTable, {
  email: (schema) => schema.email.email(),
  username: (schema) => schema.username.regex(USERNAME_REGEX),
  first_name: (schema) => schema.first_name.regex(NAME_REGEX),
  last_name: (schema) => schema.last_name.regex(NAME_REGEX),
  password_hash: (schema) => schema.password_hash.regex(PASSWORD_REGEX),
}).pick({
  email: true,
  username: true,
  first_name: true,
  last_name: true,
  password_hash: true,
});

// Remember to put captcha
export default defineEventHandler(async (event) => {
  const userCount = await useDrizzle()
    .select({ count: count() })
    .from(userTable);
  if (userCount[0].count > 0) {
    return createError({
      statusCode: 409,
      message: "User already exists! ╥﹏╥",
    });
  }
  const body = await readValidatedBody(event, (body) =>
    signUpSchema.safeParse(body),
  );
  if (!body.success) {
    return createError({
      statusCode: 400,
      message: "Invalid sign up data! ╥﹏╥",
    });
  }
  const userRoleId = uuidv4();
  const userId = uuidv4();
  const passwordHash = await hashPassword(body.data.password_hash);
  // Admin must be the first user! (◕‸ ◕✿). Don't delete the admin otherwise you will make me sad! ╥﹏╥
  // Delete all userRole and rolePrivilege before proceeding.
  await useDrizzle().batch([
    useDrizzle().delete(userRoleTable),
    useDrizzle()
      .insert(userRoleTable)
      .values({ id: userRoleId, name: USER_ROLE_NAME }),
    useDrizzle().insert(rolePrivilegeTable).values({
      user_role_id: userRoleId,
      privilege: USER_PRIVILEGE,
    }),
    useDrizzle().insert(userTable).values({
      id: userId,
      email: body.data.email,
      username: body.data.username,
      first_name: body.data.first_name,
      last_name: body.data.last_name,
      password_hash: passwordHash,
    }),
    useDrizzle().insert(userOnUserRoleTable).values({
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
        username: body.data.username,
      },
    },
    {
      maxAge: MAX_AGE,
    },
  );
  return {
    message: `You will be logged in under username: ${body.data.username}`,
  };
});

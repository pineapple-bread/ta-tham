export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);
  } catch (error) {
    console.error(error);
    return createError({
      statusCode: 500,
      message: "Something gone wrong! ╥﹏╥",
    });
  }
});

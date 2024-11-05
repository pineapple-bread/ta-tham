// Because of using client side table in frontend so we don't need to validate query
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const result = await useDrizzle().query.userRoleTable.findMany({
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

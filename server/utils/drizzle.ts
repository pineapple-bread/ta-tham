import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

export type SelectUser = typeof schema.user.$inferSelect;
export type InsertUser = typeof schema.user.$inferInsert;

export type SelectUserRole = typeof schema.userRole.$inferSelect;
export type InsertUserRole = typeof schema.userRole.$inferInsert;

export type SelectRolePrivilege = typeof schema.rolePrivilege.$inferSelect;
export type InsertRolePrivilege = typeof schema.rolePrivilege.$inferInsert;

export type SelectUserOnUserRole = typeof schema.userOnUserRole.$inferSelect;
export type InsertUserOnUserRole = typeof schema.userOnUserRole.$inferInsert;

export type SelectCustomerMessage = typeof schema.customerMessage.$inferSelect;
export type InsertCustomerMessage = typeof schema.customerMessage.$inferInsert;

export type SelectLanguage = typeof schema.language.$inferSelect;
export type InsertLanguage = typeof schema.language.$inferInsert;

export type SelectProduct = typeof schema.product.$inferSelect;
export type InsertProduct = typeof schema.product.$inferInsert;

export type SelectProductStock = typeof schema.productStock.$inferSelect;
export type InsertProductStock = typeof schema.productStock.$inferInsert;

export type SelectProductTranslation =
  typeof schema.productTranslation.$inferSelect;
export type InsertProductTranslation =
  typeof schema.productTranslation.$inferInsert;

export type SelectProductImage = typeof schema.productImage.$inferSelect;
export type InsertProductImage = typeof schema.productImage.$inferInsert;

export type SelectProductCategory = typeof schema.productCategory.$inferSelect;
export type InsertProductCategory = typeof schema.productCategory.$inferInsert;

export type SelectProductCategoryTranslation =
  typeof schema.productCategoryTranslation.$inferSelect;
export type InsertProductCategoryTranslation =
  typeof schema.productCategoryTranslation.$inferInsert;

export type SelectProductCategorySpecificationItem =
  typeof schema.productCategorySpecificationItem.$inferSelect;
export type InsertProductCategorySpecificationItem =
  typeof schema.productCategorySpecificationItem.$inferInsert;

export type SelectProductCategorySpecificationItemTranslation =
  typeof schema.productCategorySpecificationItemTranslation.$inferSelect;
export type InsertProductCategorySpecificationItemTranslation =
  typeof schema.productCategorySpecificationItemTranslation.$inferInsert;

export type SelectProductSpecificationItem =
  typeof schema.productSpecificationItem.$inferSelect;
export type InsertProductSpecificationItem =
  typeof schema.productSpecificationItem.$inferInsert;

export type SelectProductSpecificationItemTranslation =
  typeof schema.productSpecificationItemTranslation.$inferSelect;
export type InsertProductSpecificationItemTranslation =
  typeof schema.productSpecificationItemTranslation.$inferInsert;

export type SelectOrder = typeof schema.order.$inferSelect;
export type InsertOrder = typeof schema.order.$inferInsert;

export type SelectOrderProductItem =
  typeof schema.orderProductItem.$inferSelect;
export type InsertOrderProductItem =
  typeof schema.orderProductItem.$inferInsert;

export type SelectOrderBillingInformation =
  typeof schema.orderBillingInformation.$inferSelect;
export type InsertOrderBillingInformation =
  typeof schema.orderBillingInformation.$inferInsert;

export type SelectOrderShippingInformation =
  typeof schema.orderShippingInformation.$inferSelect;
export type InsertOrderShippingInformation =
  typeof schema.orderShippingInformation.$inferInsert;

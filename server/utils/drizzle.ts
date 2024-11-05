import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or, ne, notInArray, inArray } from "drizzle-orm";

import * as schema from "../database/schema";

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

export type SelectUser = typeof schema.userTable.$inferSelect;
export type InsertUser = typeof schema.userTable.$inferInsert;

export type SelectUserRole = typeof schema.userRoleTable.$inferSelect;
export type InsertUserRole = typeof schema.userRoleTable.$inferInsert;

export type SelectRolePrivilege = typeof schema.rolePrivilegeTable.$inferSelect;
export type InsertRolePrivilege = typeof schema.rolePrivilegeTable.$inferInsert;

export type SelectUserOnUserRole =
  typeof schema.userOnUserRoleTable.$inferSelect;
export type InsertUserOnUserRole =
  typeof schema.userOnUserRoleTable.$inferInsert;

export type SelectCustomerMessage =
  typeof schema.customerMessageTable.$inferSelect;
export type InsertCustomerMessage =
  typeof schema.customerMessageTable.$inferInsert;

export type SelectLanguage = typeof schema.languageTable.$inferSelect;
export type InsertLanguage = typeof schema.languageTable.$inferInsert;

export type SelectProduct = typeof schema.productTable.$inferSelect;
export type InsertProduct = typeof schema.productTable.$inferInsert;

export type SelectProductStock = typeof schema.productStockTable.$inferSelect;
export type InsertProductStock = typeof schema.productStockTable.$inferInsert;

export type SelectProductTranslation =
  typeof schema.productTranslationTable.$inferSelect;
export type InsertProductTranslation =
  typeof schema.productTranslationTable.$inferInsert;

export type SelectProductImage = typeof schema.productImageTable.$inferSelect;
export type InsertProductImage = typeof schema.productImageTable.$inferInsert;

export type SelectProductCategory =
  typeof schema.productCategoryTable.$inferSelect;
export type InsertProductCategory =
  typeof schema.productCategoryTable.$inferInsert;

export type SelectProductCategoryTranslation =
  typeof schema.productCategoryTranslationTable.$inferSelect;
export type InsertProductCategoryTranslation =
  typeof schema.productCategoryTranslationTable.$inferInsert;

export type SelectProductCategorySpecificationItem =
  typeof schema.productCategorySpecificationItemTable.$inferSelect;
export type InsertProductCategorySpecificationItem =
  typeof schema.productCategorySpecificationItemTable.$inferInsert;

export type SelectProductCategorySpecificationItemTranslation =
  typeof schema.productCategorySpecificationItemTranslationTable.$inferSelect;
export type InsertProductCategorySpecificationItemTranslation =
  typeof schema.productCategorySpecificationItemTranslationTable.$inferInsert;

export type SelectProductSpecificationItem =
  typeof schema.productSpecificationItemTable.$inferSelect;
export type InsertProductSpecificationItem =
  typeof schema.productSpecificationItemTable.$inferInsert;

export type SelectProductSpecificationItemTranslation =
  typeof schema.productSpecificationItemTranslationTable.$inferSelect;
export type InsertProductSpecificationItemTranslation =
  typeof schema.productSpecificationItemTranslationTable.$inferInsert;

export type SelectOrder = typeof schema.orderTable.$inferSelect;
export type InsertOrder = typeof schema.orderTable.$inferInsert;

export type SelectOrderProductItem =
  typeof schema.orderProductItemTable.$inferSelect;
export type InsertOrderProductItem =
  typeof schema.orderProductItemTable.$inferInsert;

export type SelectOrderBillingInformation =
  typeof schema.orderBillingInformationTable.$inferSelect;
export type InsertOrderBillingInformation =
  typeof schema.orderBillingInformationTable.$inferInsert;

export type SelectOrderShippingInformation =
  typeof schema.orderShippingInformationTable.$inferSelect;
export type InsertOrderShippingInformation =
  typeof schema.orderShippingInformationTable.$inferInsert;

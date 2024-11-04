import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  AnySQLiteColumn,
  unique,
} from "drizzle-orm/sqlite-core";

// user
export const user = sqliteTable("user", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  is_email_verified: integer({ mode: "boolean" }).notNull().default(false),
  password_retry_counter: integer().notNull().default(0),
  password_hash: text().notNull(),
});

export const userRelation = relations(user, ({ many }) => ({
  userOnUserRole: many(userOnUserRole),
}));

// One user can have many roles and one roles can be assigned to multiple users
export const userRole = sqliteTable("user_role", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
});

export const userRoleRelation = relations(userRole, ({ many }) => ({
  userOnUserRole: many(userOnUserRole),
  rolePrivilege: many(rolePrivilege),
}));

export const rolePrivilege = sqliteTable(
  "role_privilege",
  {
    user_role_id: text()
      .notNull()
      .references(() => userRole.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    privilege: text({
      enum: [
        "admin.all",
        "user.create",
        "user.read",
        "user.update",
        "user.delete",
        "category.read",
        "category.write",
        "category.update",
        "category.delete",
        "product.create",
        "product.read",
        "product.update",
        "product.delete",
        "stock.update",
        "order.create",
        "order.read",
        "order.update",
        "order.delete",
      ],
    }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.privilege, table.user_role_id] }),
    };
  },
);

export const rolePrivilegeRelation = relations(rolePrivilege, ({ one }) => ({
  userRole: one(userRole, {
    fields: [rolePrivilege.user_role_id],
    references: [userRole.id],
  }),
}));

export const userOnUserRole = sqliteTable(
  "user_on_user_role",
  {
    user_id: text()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user_role_id: text()
      .notNull()
      .references(() => userRole.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user_id, table.user_role_id] }),
    };
  },
);

export const userOnUserRoleRelation = relations(userOnUserRole, ({ one }) => ({
  user: one(user, {
    fields: [userOnUserRole.user_id],
    references: [user.id],
  }),
  userRole: one(userRole, {
    fields: [userOnUserRole.user_role_id],
    references: [userRole.id],
  }),
}));

// customer message
export const customerMessage = sqliteTable("customer_message", {
  id: text().primaryKey(),
  type: text({ enum: ["question", "support", "feedback", "other"] }).notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull(),
  message: text().notNull(),
  status: text({ enum: ["pending", "seen", "solved"] }).notNull(),
});

// language has to be unique
export const language = sqliteTable("language", {
  id: text().primaryKey(),
  name: text({ enum: ["en-US", "vi-VN"] })
    .notNull()
    .unique(),
});

export const languageRelation = relations(language, ({ many }) => ({
  productTranslation: many(productTranslation),
  productCategoryTranslation: many(productCategoryTranslation),
  productCategorySpecificationItemTranslation: many(
    productCategorySpecificationItemTranslation,
  ),
  productSpecificationItemTranslation: many(
    productSpecificationItemTranslation,
  ),
}));

// product
// time is in UTC
export const product = sqliteTable("product", {
  id: text().primaryKey(),
  code: text().notNull(),
  price: integer(),
  status: text({ enum: ["draft", "published", "discontinued"] })
    .notNull()
    .default("draft"),
  product_category_id: text().references(() => productCategory.id),
  created_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const productRelation = relations(product, ({ one, many }) => ({
  productStock: many(productStock),
  productTranslation: many(productTranslation),
  productImage: many(productImage),
  productCategory: one(productCategory, {
    fields: [product.product_category_id],
    references: [productCategory.id],
  }),
}));

// Deleting productStock upon deleting product
export const productStock = sqliteTable("product_stock", {
  product_id: text()
    .references(() => product.id, { onDelete: "cascade", onUpdate: "cascade" })
    .primaryKey(),
  import_quantity: integer().notNull().default(0),
  export_quantity: integer().notNull().default(0),
  stock_quantity: integer().generatedAlwaysAs(
    sql`import_quantity - export_quantity`,
    { mode: "stored" },
  ),
});

export const productStockRelation = relations(productStock, ({ one }) => ({
  product: one(product, {
    fields: [productStock.product_id],
    references: [product.id],
  }),
}));

// weak entity - product, language
export const productTranslation = sqliteTable(
  "product_translation",
  {
    product_id: text()
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => language.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text().notNull(),
    description: text(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.product_id, table.language_id] }),
    };
  },
);

export const productTranslationRelation = relations(
  productTranslation,
  ({ one }) => ({
    product: one(product, {
      fields: [productTranslation.product_id],
      references: [product.id],
    }),
    language: one(language, {
      fields: [productTranslation.language_id],
      references: [language.id],
    }),
  }),
);

// weak entity - product
// display first image on display_order
// Need id for easier fix
export const productImage = sqliteTable("product_image", {
  id: text().primaryKey(),
  product_id: text()
    .notNull()
    .references(() => product.id, { onDelete: "cascade", onUpdate: "cascade" }),
  image_url: text().notNull(),
  display_order: integer(),
});

export const productImageRelation = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.product_id],
    references: [product.id],
  }),
}));

// product category
// need to be null for the first one -> only use with for max depth <= 3
// if product_category_id == NULL -> it's the first item. Next item can't be liek that
export const productCategory = sqliteTable("product_category", {
  id: text().primaryKey(),
  display_order: integer(),
  product_category_id: text().references(
    (): AnySQLiteColumn => productCategory.id,
  ),
});

export const productCategoryRelation = relations(
  productCategory,
  ({ one, many }) => ({
    productCategory: one(productCategory, {
      fields: [productCategory.product_category_id],
      references: [productCategory.id],
    }),
    product: many(product),
    productCategoryTranslation: many(productCategoryTranslation),
  }),
);

export const productCategoryTranslation = sqliteTable(
  "product_category_translation",
  {
    product_category_id: text()
      .notNull()
      .references(() => productCategory.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => language.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text().notNull(),
    description: text(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.product_category_id, table.language_id],
      }),
    };
  },
);

export const productCategoryTranslationRelation = relations(
  productCategoryTranslation,
  ({ one }) => ({
    productCategory: one(productCategory, {
      fields: [productCategoryTranslation.product_category_id],
      references: [productCategory.id],
    }),
    language: one(language, {
      fields: [productCategoryTranslation.language_id],
      references: [language.id],
    }),
  }),
);

// Becareful -> it has to be no child in order to be set the product_category
export const productCategorySpecificationItem = sqliteTable(
  "product_category_specification_item",
  {
    id: text().primaryKey(),
    product_category_id: text()
      .notNull()
      .references(() => productCategory.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    display_order: integer(),
  },
);

export const productCategorySpecificationItemRelation = relations(
  productCategorySpecificationItem,
  ({ one, many }) => ({
    productCategory: one(productCategory, {
      fields: [productCategorySpecificationItem.product_category_id],
      references: [productCategory.id],
    }),
    productCategorySpecificationItemTranslation: many(
      productCategorySpecificationItemTranslation,
    ),
    productSpecificationItem: many(productSpecificationItem),
  }),
);

export const productCategorySpecificationItemTranslation = sqliteTable(
  "product_category_specification_item_translation",
  {
    product_category_specification_item_id: text()
      .notNull()
      .references(() => productCategorySpecificationItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => language.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [
          table.product_category_specification_item_id,
          table.language_id,
        ],
      }),
    };
  },
);

export const productCategorySpecificationItemTranslationRelation = relations(
  productCategorySpecificationItemTranslation,
  ({ one }) => ({
    productCategorySpecificationItem: one(productCategorySpecificationItem, {
      fields: [
        productCategorySpecificationItemTranslation.product_category_specification_item_id,
      ],
      references: [productCategorySpecificationItem.id],
    }),
    language: one(language, {
      fields: [productCategorySpecificationItemTranslation.language_id],
      references: [language.id],
    }),
  }),
);

// Check if the product if it's inside the product_category
export const productSpecificationItem = sqliteTable(
  "product_specification_item",
  {
    id: text().primaryKey(),
    product_id: text()
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    product_category_specification_item_id: text()
      .notNull()
      .references(() => productCategorySpecificationItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
);

export const productSpecificationItemRelation = relations(
  productSpecificationItem,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productSpecificationItem.product_id],
      references: [product.id],
    }),
    productCategorySpecificationItem: one(productCategorySpecificationItem, {
      fields: [productSpecificationItem.product_category_specification_item_id],
      references: [productCategorySpecificationItem.id],
    }),
    productSpecificationItemTranslation: many(
      productSpecificationItemTranslation,
    ),
  }),
);

export const productSpecificationItemTranslation = sqliteTable(
  "product_specification_item_translation",
  {
    product_specification_item_id: text()
      .notNull()
      .references(() => productSpecificationItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => language.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    value: text().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.product_specification_item_id, table.language_id],
      }),
    };
  },
);

export const productSpecificationItemTranslationRelation = relations(
  productSpecificationItemTranslation,
  ({ one }) => ({
    productSpecificationItem: one(productSpecificationItem, {
      fields: [
        productSpecificationItemTranslation.product_specification_item_id,
      ],
      references: [productSpecificationItem.id],
    }),
    language: one(language, {
      fields: [productSpecificationItemTranslation.language_id],
      references: [language.id],
    }),
  }),
);

// Delete

// creating view to see grand_total
export const order = sqliteTable("order", {
  id: text().primaryKey(),
  status: text({
    enum: [
      "pending",
      "processing",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ],
  })
    .notNull()
    .default("pending"),
  is_stock_subtracted: integer({ mode: "boolean" }).notNull().default(false),
  discount_type: text({ enum: ["percentage", "fixed"] }).default("percentage"),
  discount_value: integer().default(0),
  total_discount: integer().generatedAlwaysAs(
    sql`discount_type * discount_value`,
    { mode: "stored" },
  ),
  note: text(),
  created_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

export const orderRelation = relations(order, ({ one, many }) => ({
  orderProductItem: many(orderProductItem),
  orderBillingInformation: one(orderShippingInformation),
  orderShippingInformation: one(orderShippingInformation),
}));

// only delete on order_id change. product_id can not be null but don't get delete on product delete
export const orderProductItem = sqliteTable("order_product_item", {
  id: text().primaryKey(),
  order_id: text()
    .notNull()
    .references(() => order.id, { onDelete: "cascade", onUpdate: "cascade" }),
  product_id: text()
    .notNull()
    .references(() => product.id),
  product_price: integer().notNull(),
  quantity: integer().notNull(),
  subtotal: integer().generatedAlwaysAs(sql`product_price * quantity`, {
    mode: "stored",
  }),
});

export const orderProductItemRelation = relations(
  orderProductItem,
  ({ one }) => ({
    order: one(order, {
      fields: [orderProductItem.order_id],
      references: [order.id],
    }),
    product: one(product, {
      fields: [orderProductItem.product_id],
      references: [product.id],
    }),
  }),
);

export const orderBillingInformation = sqliteTable(
  "order_billing_information",
  {
    order_id: text()
      .references(() => order.id, { onDelete: "cascade", onUpdate: "cascade" })
      .primaryKey(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().notNull(),
    phone_number: text().notNull(),
    company: text(),
    address_line_1: text().notNull(),
    address_line_2: text(),
    city: text().notNull(),
    state: text(),
    zip_code: text().notNull(),
    country: text().notNull(),
  },
);

export const orderBillingInformationRelation = relations(
  orderBillingInformation,
  ({ one }) => ({
    order: one(order, {
      fields: [orderBillingInformation.order_id],
      references: [order.id],
    }),
  }),
);

export const orderShippingInformation = sqliteTable(
  "order_shipping_information",
  {
    order_id: text()
      .references(() => order.id, { onDelete: "cascade", onUpdate: "cascade" })
      .primaryKey(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    phone_number: text().notNull(),
    company: text(),
    address_line_1: text().notNull(),
    address_line_2: text(),
    city: text().notNull(),
    state: text(),
    zip_code: text().notNull(),
    country: text().notNull(),
  },
);

export const orderShippingInformationRelation = relations(
  orderShippingInformation,
  ({ one }) => ({
    order: one(order, {
      fields: [orderShippingInformation.order_id],
      references: [order.id],
    }),
  }),
);

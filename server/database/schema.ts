import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// user
export const userTable = sqliteTable("user", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  is_email_verified: integer({ mode: "boolean" }).notNull().default(false),
  password_retry_counter: integer().notNull().default(0),
  password_hash: text().notNull(),
});

// Checked
export const userRelation = relations(userTable, ({ many }) => ({
  userOnUserRole: many(userOnUserRoleTable),
}));

// One user can have many roles and one roles can be assigned to multiple users
export const userRoleTable = sqliteTable("user_role", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
});

// Checked
export const userRoleRelation = relations(userRoleTable, ({ many }) => ({
  userOnUserRole: many(userOnUserRoleTable),
  rolePrivilege: many(rolePrivilegeTable),
}));

export const rolePrivilegeTable = sqliteTable(
  "role_privilege",
  {
    user_role_id: text()
      .notNull()
      .references(() => userRoleTable.id, {
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

// Checked
export const rolePrivilegeRelation = relations(
  rolePrivilegeTable,
  ({ one }) => ({
    userRole: one(userRoleTable, {
      fields: [rolePrivilegeTable.user_role_id],
      references: [userRoleTable.id],
    }),
  }),
);

export const userOnUserRoleTable = sqliteTable(
  "user_on_user_role",
  {
    user_id: text()
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user_role_id: text()
      .notNull()
      .references(() => userRoleTable.id, {
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

// Checked
export const userOnUserRoleRelation = relations(
  userOnUserRoleTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userOnUserRoleTable.user_id],
      references: [userTable.id],
    }),
    userRole: one(userRoleTable, {
      fields: [userOnUserRoleTable.user_role_id],
      references: [userRoleTable.id],
    }),
  }),
);

// customer message
export const customerMessageTable = sqliteTable("customer_message", {
  id: text().primaryKey(),
  type: text({ enum: ["question", "support", "feedback", "other"] }).notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull(),
  message: text().notNull(),
  status: text({ enum: ["pending", "seen", "solved"] }).notNull(),
});

// language has to be unique
export const languageTable = sqliteTable("language", {
  id: text().primaryKey(),
  name: text({ enum: ["en-US", "vi-VN"] })
    .notNull()
    .unique(),
});

// Checked
export const languageRelation = relations(languageTable, ({ many }) => ({
  productTranslation: many(productTranslationTable),
  productCategoryTranslation: many(productCategoryTranslationTable),
  productCategorySpecificationItemTranslation: many(
    productCategorySpecificationItemTranslationTable,
  ),
  productSpecificationItemTranslation: many(
    productSpecificationItemTranslationTable,
  ),
}));

// product
// time is in UTC
export const productTable = sqliteTable("product", {
  id: text().primaryKey(),
  code: text().notNull(),
  price: integer(),
  status: text({ enum: ["draft", "published", "discontinued"] })
    .notNull()
    .default("draft"),
  product_category_id: text().references(() => productCategoryTable.id),
  created_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Checked
export const productRelation = relations(productTable, ({ one, many }) => ({
  productStock: one(productStockTable),
  productTranslation: many(productTranslationTable),
  productImage: many(productImageTable),
  productSpecificationItem: many(productSpecificationItemTable),
  productCategory: one(productCategoryTable, {
    fields: [productTable.product_category_id],
    references: [productCategoryTable.id],
  }),
  orderProductItem: many(orderProductItemTable),
}));

// Deleting productStock upon deleting product
export const productStockTable = sqliteTable("product_stock", {
  product_id: text()
    .references(() => productTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .primaryKey(),
  import_quantity: integer().notNull().default(0),
  export_quantity: integer().notNull().default(0),
  stock_quantity: integer().generatedAlwaysAs(
    sql`import_quantity - export_quantity`,
    { mode: "stored" },
  ),
});

// Checked
export const productStockRelation = relations(productStockTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productStockTable.product_id],
    references: [productTable.id],
  }),
}));

// weak entity - product, language
export const productTranslationTable = sqliteTable(
  "product_translation",
  {
    product_id: text()
      .notNull()
      .references(() => productTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => languageTable.id, {
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
// Checked
export const productTranslationRelation = relations(
  productTranslationTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productTranslationTable.product_id],
      references: [productTable.id],
    }),
    language: one(languageTable, {
      fields: [productTranslationTable.language_id],
      references: [languageTable.id],
    }),
  }),
);

// weak entity - product
// display first image on display_order
// Need id for easier fix
export const productImageTable = sqliteTable("product_image", {
  id: text().primaryKey(),
  product_id: text()
    .notNull()
    .references(() => productTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  image_url: text().notNull(),
  display_order: integer(),
});

// Checked
export const productImageRelation = relations(productImageTable, ({ one }) => ({
  product: one(productTable, {
    fields: [productImageTable.product_id],
    references: [productTable.id],
  }),
}));

// product category
// need to be null for the first one -> only use with for max depth <= 3
// if product_category_id == NULL -> it's the first item. Next item can't be liek that
export const productCategoryTable = sqliteTable("product_category", {
  id: text().primaryKey(),
  display_order: integer(),
  parent_id: text().references((): AnySQLiteColumn => productCategoryTable.id),
});

// Checked
export const productCategoryRelation = relations(
  productCategoryTable,
  ({ one, many }) => ({
    productCategory: one(productCategoryTable, {
      fields: [productCategoryTable.parent_id],
      references: [productCategoryTable.id],
    }),
    product: many(productTable),
    productCategorySpecificationItem: many(
      productCategorySpecificationItemTable,
    ),
    productCategoryTranslation: many(productCategoryTranslationTable),
  }),
);

export const productCategoryTranslationTable = sqliteTable(
  "product_category_translation",
  {
    product_category_id: text()
      .notNull()
      .references(() => productCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => languageTable.id, {
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

// Checked
export const productCategoryTranslationRelation = relations(
  productCategoryTranslationTable,
  ({ one }) => ({
    productCategory: one(productCategoryTable, {
      fields: [productCategoryTranslationTable.product_category_id],
      references: [productCategoryTable.id],
    }),
    language: one(languageTable, {
      fields: [productCategoryTranslationTable.language_id],
      references: [languageTable.id],
    }),
  }),
);

// Becareful -> it has to be no child in order to be set the product_category
export const productCategorySpecificationItemTable = sqliteTable(
  "product_category_specification_item",
  {
    id: text().primaryKey(),
    product_category_id: text()
      .notNull()
      .references(() => productCategoryTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    display_order: integer(),
  },
);

// Checked
export const productCategorySpecificationItemRelation = relations(
  productCategorySpecificationItemTable,
  ({ one, many }) => ({
    productCategory: one(productCategoryTable, {
      fields: [productCategorySpecificationItemTable.product_category_id],
      references: [productCategoryTable.id],
    }),
    productCategorySpecificationItemTranslation: many(
      productCategorySpecificationItemTranslationTable,
    ),
    productSpecificationItem: many(productSpecificationItemTable),
  }),
);

export const productCategorySpecificationItemTranslationTable = sqliteTable(
  "product_category_specification_item_translation",
  {
    product_category_specification_item_id: text()
      .notNull()
      .references(() => productCategorySpecificationItemTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => languageTable.id, {
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

// Checked
export const productCategorySpecificationItemTranslationRelation = relations(
  productCategorySpecificationItemTranslationTable,
  ({ one }) => ({
    productCategorySpecificationItem: one(
      productCategorySpecificationItemTable,
      {
        fields: [
          productCategorySpecificationItemTranslationTable.product_category_specification_item_id,
        ],
        references: [productCategorySpecificationItemTable.id],
      },
    ),
    language: one(languageTable, {
      fields: [productCategorySpecificationItemTranslationTable.language_id],
      references: [languageTable.id],
    }),
  }),
);

// Check if the product if it's inside the product_category
export const productSpecificationItemTable = sqliteTable(
  "product_specification_item",
  {
    id: text().primaryKey(),
    product_id: text()
      .notNull()
      .references(() => productTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    product_category_specification_item_id: text()
      .notNull()
      .references(() => productCategorySpecificationItemTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
);

// Checked
export const productSpecificationItemRelation = relations(
  productSpecificationItemTable,
  ({ one, many }) => ({
    product: one(productTable, {
      fields: [productSpecificationItemTable.product_id],
      references: [productTable.id],
    }),
    productCategorySpecificationItem: one(
      productCategorySpecificationItemTable,
      {
        fields: [
          productSpecificationItemTable.product_category_specification_item_id,
        ],
        references: [productCategorySpecificationItemTable.id],
      },
    ),
    productSpecificationItemTranslation: many(
      productSpecificationItemTranslationTable,
    ),
  }),
);

export const productSpecificationItemTranslationTable = sqliteTable(
  "product_specification_item_translation",
  {
    product_specification_item_id: text()
      .notNull()
      .references(() => productSpecificationItemTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: text()
      .notNull()
      .references(() => languageTable.id, {
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

// Checked
export const productSpecificationItemTranslationRelation = relations(
  productSpecificationItemTranslationTable,
  ({ one }) => ({
    productSpecificationItem: one(productSpecificationItemTable, {
      fields: [
        productSpecificationItemTranslationTable.product_specification_item_id,
      ],
      references: [productSpecificationItemTable.id],
    }),
    language: one(languageTable, {
      fields: [productSpecificationItemTranslationTable.language_id],
      references: [languageTable.id],
    }),
  }),
);

// Delete

// creating view to see grand_total
export const orderTable = sqliteTable("order", {
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

// Checked
export const orderRelation = relations(orderTable, ({ one, many }) => ({
  orderProductItem: many(orderProductItemTable),
  orderBillingInformation: one(orderBillingInformationTable),
  orderShippingInformation: one(orderShippingInformationTable),
}));

// only delete on order_id change. product_id can not be null but don't get delete on product delete
export const orderProductItemTable = sqliteTable("order_product_item", {
  id: text().primaryKey(),
  order_id: text()
    .notNull()
    .references(() => orderTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  product_id: text()
    .notNull()
    .references(() => productTable.id),
  product_price: integer().notNull(),
  quantity: integer().notNull(),
  subtotal: integer().generatedAlwaysAs(sql`product_price * quantity`, {
    mode: "stored",
  }),
});

// Checked
export const orderProductItemRelation = relations(
  orderProductItemTable,
  ({ one }) => ({
    order: one(orderTable, {
      fields: [orderProductItemTable.order_id],
      references: [orderTable.id],
    }),
    product: one(productTable, {
      fields: [orderProductItemTable.product_id],
      references: [productTable.id],
    }),
  }),
);

export const orderBillingInformationTable = sqliteTable(
  "order_billing_information",
  {
    order_id: text()
      .references(() => orderTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
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

// Checked
export const orderBillingInformationRelation = relations(
  orderBillingInformationTable,
  ({ one }) => ({
    order: one(orderTable, {
      fields: [orderBillingInformationTable.order_id],
      references: [orderTable.id],
    }),
  }),
);

export const orderShippingInformationTable = sqliteTable(
  "order_shipping_information",
  {
    order_id: text()
      .references(() => orderTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
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

// Checked
export const orderShippingInformationRelation = relations(
  orderShippingInformationTable,
  ({ one }) => ({
    order: one(orderTable, {
      fields: [orderShippingInformationTable.order_id],
      references: [orderTable.id],
    }),
  }),
);

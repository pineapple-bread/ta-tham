import { SQL, sql } from "drizzle-orm";
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
  is_email_verified: integer({ mode: "boolean" }).default(false),
  password_retry_counter: integer().notNull().default(0),
  password_hash: text().notNull(),
});

// One user can have many roles and one roles can be assigned to multiple users
export const userRole = sqliteTable("user_role", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
});

// users can create api_keys have the same name but 1 user can not create api_keys the same name
// If some how the hacker is in the database. api_key leak should be the least of concern
export const userApiKey = sqliteTable(
  "user_api_key",
  {
    id: text().primaryKey(),
    user_id: text()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text().notNull(),
    api_key_hash: text().notNull().unique(),
    usage_counter: integer().notNull().default(0),
  },
  (table) => ({ user_id_name: unique().on(table.user_id, table.name) }),
);

// Only one can exist at a time user_role / user_api_key
export const rolePrivilege = sqliteTable("role_privilege", {
  id: text().primaryKey(),
  user_role_id: text().references(() => userRole.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  user_api_key_id: text().references(() => userApiKey.id, {
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
});

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

// customer message
export const customerMessage = sqliteTable("customer_message", {
  id: text().primaryKey(),
  type: text({ enum: ["question", "support", "feedback", "other"] }).notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull(),
  message: text().notNull(),
  status: text({ enum: ["pending", "seen", "solved"] }),
});

// language has to be unique
export const language = sqliteTable("language", {
  id: text().primaryKey(),
  name: text({ enum: ["en-US", "vi-VN"] })
    .notNull()
    .unique(),
});

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
  created_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updated_at: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});

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

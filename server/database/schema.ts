import { SQL, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  primaryKey,
  AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

const privilegeList: [string, ...string[]] = [
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
];

// user
export const user = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  password_retry_counter: integer().notNull().default(0),
  password_hash: text().notNull(),
});

// One user can have many roles and one roles can be assigned to multiple users
export const userRole = sqliteTable("user_role", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});

export const userApiKey = sqliteTable("user_api_key", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: integer()
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text().notNull().unique(),
  api_key: text().notNull().unique(),
});

// Only one can exist at a time user_role / user_api_key
export const rolePrivilege = sqliteTable("role_privilege", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_role_id: integer().references(() => userRole.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  user_api_key_id: integer().references(() => userApiKey.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  privilege: text({ enum: privilegeList }).notNull(),
});

export const userOnUserRole = sqliteTable(
  "user_on_user_role",
  {
    user_id: integer()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user_role_id: integer()
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
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["question", "support", "feedback", "other"] }).notNull(),
  first_name: text().notNull(),
  last_name: text().notNull(),
  email: text().notNull(),
  message: text().notNull(),
  status: text({ enum: ["pending", "seen", "solved"] }),
});

// language has to be unique
export const language = sqliteTable("language", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text({ enum: ["en-US", "vi-VN"] })
    .notNull()
    .unique(),
});

// product
// time is in UTC
export const product = sqliteTable(
  "product",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    code: text().notNull(),
    slug: text().generatedAlwaysAs(
      (): SQL => sql`${product.code}-${product.id}`,
      { mode: "stored" },
    ),
    price: integer(),
    status: text({ enum: ["draft", "published", "discontinued"] })
      .notNull()
      .default("draft"),
    product_category_id: integer().references(() => productCategory.id),
    created_at: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => {
    return { slug_idx: uniqueIndex("slug_idx").on(table.slug) };
  },
);

// Deleting productStock upon deleting product
export const productStock = sqliteTable("product_stock", {
  product_id: integer()
    .notNull()
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
    product_id: integer()
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: integer()
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
export const productImage = sqliteTable("product_image", {
  product_id: integer()
    .notNull()
    .references(() => product.id, { onDelete: "cascade", onUpdate: "cascade" }),
  image_url: text().notNull(),
  display_order: integer(),
});

// product category
// need to be null for the first one -> only use with for max depth <= 3
// if product_category_id == NULL -> it's the first item. Next item can't be liek that
export const productCategory = sqliteTable("product_category", {
  id: integer().primaryKey({ autoIncrement: true }),
  display_order: integer(),
  product_category_id: integer().references(
    (): AnySQLiteColumn => productCategory.id,
  ),
});

export const productCategoryTranslation = sqliteTable(
  "product_category_translation",
  {
    product_category_id: integer()
      .notNull()
      .references(() => productCategory.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: integer()
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
    id: integer().primaryKey({ autoIncrement: true }),
    product_category_id: integer()
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
    product_category_specification_item_id: integer()
      .notNull()
      .references(() => productCategorySpecificationItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: integer()
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
    id: integer().primaryKey({ autoIncrement: true }),
    product_id: integer()
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    product_category_specification_item_id: integer()
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
    product_specification_item_id: integer()
      .notNull()
      .references(() => productSpecificationItem.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    language_id: integer()
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
  id: integer().primaryKey({ autoIncrement: true }),
  status: text({
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
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

// only delete on order_id change. product_id can be null
export const order_product_item = sqliteTable("order_product_item", {
  id: integer().primaryKey({ autoIncrement: true }),
  order_id: integer()
    .notNull()
    .references(() => order.id, { onDelete: "cascade", onUpdate: "cascade" }),
  product_id: integer().references(() => product.id),
  product_price: integer().notNull(),
  quantity: integer().notNull(),
  subtotal: integer().generatedAlwaysAs(sql`product_price * quantity`, {
    mode: "stored",
  }),
});

export const order_billing_information = sqliteTable(
  "order_billing_information",
  {
    order_id: integer()
      .notNull()
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

export const order_shipping_information = sqliteTable(
  "order_shipping_information",
  {
    order_id: integer()
      .notNull()
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

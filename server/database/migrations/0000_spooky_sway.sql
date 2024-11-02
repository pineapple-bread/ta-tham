CREATE TABLE `customer_message` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `language_name_unique` ON `language` (`name`);--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_stock_subtracted` integer DEFAULT false NOT NULL,
	`discount_type` text DEFAULT 'percentage',
	`discount_value` integer DEFAULT 0,
	`total_discount` integer GENERATED ALWAYS AS (discount_type * discount_value) STORED,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_billing_information` (
	`order_id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone_number` text NOT NULL,
	`company` text,
	`address_line_1` text NOT NULL,
	`address_line_2` text,
	`city` text NOT NULL,
	`state` text,
	`zip_code` text NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `order_product_item` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`subtotal` integer GENERATED ALWAYS AS (product_price * quantity) STORED,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_shipping_information` (
	`order_id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone_number` text NOT NULL,
	`company` text,
	`address_line_1` text NOT NULL,
	`address_line_2` text,
	`city` text NOT NULL,
	`state` text,
	`zip_code` text NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`price` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`product_category_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_category` (
	`id` text PRIMARY KEY NOT NULL,
	`display_order` integer,
	`product_category_id` text,
	FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_category_specification_item` (
	`id` text PRIMARY KEY NOT NULL,
	`product_category_id` text NOT NULL,
	`display_order` integer,
	FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_category_specification_item_translation` (
	`product_category_specification_item_id` text NOT NULL,
	`language_id` text NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`product_category_specification_item_id`, `language_id`),
	FOREIGN KEY (`product_category_specification_item_id`) REFERENCES `product_category_specification_item`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_category_translation` (
	`product_category_id` text NOT NULL,
	`language_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	PRIMARY KEY(`product_category_id`, `language_id`),
	FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_image` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`image_url` text NOT NULL,
	`display_order` integer,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_specification_item` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`product_category_specification_item_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`product_category_specification_item_id`) REFERENCES `product_category_specification_item`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_specification_item_translation` (
	`product_specification_item_id` text NOT NULL,
	`language_id` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`product_specification_item_id`, `language_id`),
	FOREIGN KEY (`product_specification_item_id`) REFERENCES `product_specification_item`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_stock` (
	`product_id` text PRIMARY KEY NOT NULL,
	`import_quantity` integer DEFAULT 0 NOT NULL,
	`export_quantity` integer DEFAULT 0 NOT NULL,
	`stock_quantity` integer GENERATED ALWAYS AS (import_quantity - export_quantity) STORED,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_translation` (
	`product_id` text NOT NULL,
	`language_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	PRIMARY KEY(`product_id`, `language_id`),
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`language_id`) REFERENCES `language`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_privilege` (
	`id` text PRIMARY KEY NOT NULL,
	`user_role_id` text,
	`user_api_key_id` text,
	`privilege` text NOT NULL,
	FOREIGN KEY (`user_role_id`) REFERENCES `user_role`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_api_key_id`) REFERENCES `user_api_key`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`is_email_verified` integer DEFAULT false,
	`password_retry_counter` integer DEFAULT 0 NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `user_api_key` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`api_key_hash` text NOT NULL,
	`usage_counter` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_api_key_api_key_hash_unique` ON `user_api_key` (`api_key_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_api_key_user_id_name_unique` ON `user_api_key` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `user_on_user_role` (
	`user_id` text NOT NULL,
	`user_role_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `user_role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_role_id`) REFERENCES `user_role`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_role_name_unique` ON `user_role` (`name`);
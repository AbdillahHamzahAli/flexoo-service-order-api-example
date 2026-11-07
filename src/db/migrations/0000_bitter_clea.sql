CREATE TABLE `project_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`phone` text NOT NULL,
	`company_name` text NOT NULL,
	`company_email` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`source` text,
	`created_at` text NOT NULL,
	CONSTRAINT "project_inquiries_status_check" CHECK("project_inquiries"."status" in ('new', 'contacted', 'qualified', 'archived'))
);
--> statement-breakpoint
CREATE INDEX `inquiries_created_idx` ON `project_inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_email_idx` ON `project_inquiries` (`company_email`);--> statement-breakpoint
CREATE TABLE `service_tech` (
	`service_id` integer NOT NULL,
	`tech_id` integer NOT NULL,
	PRIMARY KEY(`service_id`, `tech_id`),
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tech_id`) REFERENCES `tech_stacks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `service_tech_tech_idx` ON `service_tech` (`tech_id`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`starting_price` integer,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`icon` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `services_active_sort_idx` ON `services` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `tech_stacks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`logo_url` text,
	`website_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tech_stacks_slug_unique` ON `tech_stacks` (`slug`);--> statement-breakpoint
CREATE INDEX `tech_stacks_category_idx` ON `tech_stacks` (`category`);
CREATE TABLE `invite` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`max_uses` text DEFAULT '1' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

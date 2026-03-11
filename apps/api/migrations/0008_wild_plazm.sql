DROP INDEX `field_key_unique`;--> statement-breakpoint
ALTER TABLE `field` ADD `language` text DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `field_site_key_language_unique` ON `field` (`site_id`,`key`,`language`);--> statement-breakpoint
ALTER TABLE `site` ADD `languages` text DEFAULT '["en"]' NOT NULL;
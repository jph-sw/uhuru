PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invite_use` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`invite_code` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invite_code`) REFERENCES `invite`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invite_use`("id", "user_id", "invite_code") SELECT "id", "user_id", "invite_code" FROM `invite_use`;--> statement-breakpoint
DROP TABLE `invite_use`;--> statement-breakpoint
ALTER TABLE `__new_invite_use` RENAME TO `invite_use`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
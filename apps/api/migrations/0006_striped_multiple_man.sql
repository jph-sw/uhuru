CREATE TABLE `invite_use` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`invite_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invite_id`) REFERENCES `invite`(`id`) ON UPDATE no action ON DELETE no action
);

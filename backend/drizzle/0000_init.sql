CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`priority` text DEFAULT 'MEDIUM',
	`status` text DEFAULT 'TODO',
	`due_date` integer DEFAULT 1764764447,
	`project_id` integer,
	`created_at` integer DEFAULT 1764764447,
	`updated_at` integer DEFAULT 1764764447,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);

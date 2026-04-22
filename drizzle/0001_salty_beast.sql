CREATE TABLE `admin_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_credentials_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImage` varchar(1000),
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `country_leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rank` int NOT NULL,
	`country` varchar(100) NOT NULL,
	`countryCode` varchar(5) NOT NULL,
	`description` varchar(500) NOT NULL,
	`score` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `country_leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`dateTime` varchar(100) NOT NULL,
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`frequency` varchar(100),
	`meetingLink` varchar(1000) NOT NULL,
	`passcode` varchar(50),
	`hostName` varchar(200),
	`language` varchar(50) NOT NULL DEFAULT 'English',
	`status` enum('upcoming','live','completed','recurring') NOT NULL DEFAULT 'upcoming',
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`description` text NOT NULL,
	`details` json,
	`active` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phase` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`status` enum('completed','current','upcoming') NOT NULL DEFAULT 'upcoming',
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `roadmap_phases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(200) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`youtubeUrl` varchar(500),
	`directUrl` varchar(1000),
	`category` enum('presentation','how-to-join','withdraw-compound','other') NOT NULL,
	`language` varchar(50) NOT NULL,
	`languageFlag` varchar(10) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);

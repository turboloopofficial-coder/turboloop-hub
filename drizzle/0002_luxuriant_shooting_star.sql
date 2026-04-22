CREATE TABLE `presentations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`language` varchar(50) NOT NULL DEFAULT 'English',
	`fileUrl` varchar(1000),
	`sortOrder` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `presentations_id` PRIMARY KEY(`id`)
);

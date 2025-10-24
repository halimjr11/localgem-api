-- MySQL schema for localgem project
-- Generated from NestJS TypeORM entities

-- Create database
CREATE DATABASE IF NOT EXISTS `localgem`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `localgem`;

-- Users table
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Places table
CREATE TABLE IF NOT EXISTS `place` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `description` VARCHAR(255) NULL,
  `imageUrl` VARCHAR(255) NULL,
  `avgRating` FLOAT NOT NULL DEFAULT 0,
  `reviewsCount` INT NOT NULL DEFAULT 0,
  `tagsSlugs` JSON NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_place_userId` (`userId`),
  CONSTRAINT `FK_place_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags table
CREATE TABLE IF NOT EXISTS `tag` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_tag_name` (`name`),
  UNIQUE KEY `UQ_tag_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS `review` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `userId` INT NOT NULL,
  `placeId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_review_user_place` (`userId`, `placeId`),
  KEY `IDX_review_placeId` (`placeId`),
  KEY `IDX_review_userId` (`userId`),
  CONSTRAINT `FK_review_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_review_place` FOREIGN KEY (`placeId`) REFERENCES `place` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample user
INSERT INTO `user` (`email`, `password`, `name`) VALUES 
('admin@localgem.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User');

-- Insert tags
INSERT INTO `tag` (`name`, `slug`) VALUES 
('Beach', 'beach'),
('Island', 'island'),
('Nature', 'nature'),
('Historical', 'historical'),
('Adventure', 'adventure'),
('Family', 'family'),
('Romantic', 'romantic'),
('Snorkeling', 'snorkeling');

-- Insert Kepri tourism places
INSERT INTO `place` (`name`, `location`, `latitude`, `longitude`, `description`, `imageUrl`, `avgRating`, `reviewsCount`, `tagsSlugs`, `userId`) VALUES
('Penyengat Island', 'Tanjung Pinang, Kepulauan Riau', 0.9292, 104.4339, 'A small island with rich historical value, once the center of the Riau-Lingga Sultanate. Home to the famous Sultan Riau Grand Mosque and royal tombs.', 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/destinations/kepulauan-riau/tanjung-pinang/thumb/penyengat-island-tanjung-pinang.jpg', 4.7, 128, '["island", "historical"]', 1),

('Bintan Resorts', 'Bintan Island, Kepulauan Riau', 1.1364, 104.4258, 'Luxurious beach resorts with white sandy beaches and crystal clear waters. Perfect for family vacations and water sports activities.', 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/destinations/kepulauan-riau/bintan/thumb/bintan-resorts.jpg', 4.8, 245, '["beach", "family", "romantic"]', 1),

('Trikora Beach', 'East Bintan, Kepulauan Riau', 0.9570, 104.7839, 'A beautiful stretch of white sandy beach with turquoise water, known for its pristine condition and stunning sunrises.', 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/destinations/kepulauan-riau/bintan/thumb/trikora-beach.jpg', 4.6, 189, '["beach", "nature", "romantic"]', 1),

('Abang Island', 'Batam, Kepulauan Riau', 1.0667, 104.1500, 'A paradise for divers and snorkelers with its rich marine biodiversity and colorful coral reefs.', 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/destinations/kepulauan-riau/batam/thumb/abang-island.jpg', 4.5, 167, '["island", "snorkeling", "adventure"]', 1),

('Lagoi Bay', 'Bintan, Kepulauan Riau', 1.1583, 104.3500, 'A beautiful bay area with luxury resorts, golf courses, and pristine beaches, perfect for a relaxing getaway.', 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/destinations/kepulauan-riau/bintan/thumb/lagoi-bay.jpg', 4.7, 203, '["beach", "family", "romantic"]', 1);

-- Insert sample reviews
INSERT INTO `review` (`rating`, `comment`, `userId`, `placeId`) VALUES
(5, 'Absolutely stunning beach with crystal clear water. Perfect for a weekend getaway!', 1, 2),
(4, 'Rich in history and culture. The Sultan Mosque is magnificent!', 1, 1),
(5, 'One of the best diving spots I\'ve ever been to. The coral reefs are amazing!', 1, 4);

-- Update place ratings and review counts
UPDATE `place` SET 
  `avgRating` = (SELECT AVG(rating) FROM `review` WHERE `placeId` = 1),
  `reviewsCount` = (SELECT COUNT(*) FROM `review` WHERE `placeId` = 1)
WHERE `id` = 1;

UPDATE `place` SET 
  `avgRating` = (SELECT AVG(rating) FROM `review` WHERE `placeId` = 2),
  `reviewsCount` = (SELECT COUNT(*) FROM `review` WHERE `placeId` = 2)
WHERE `id` = 2;

UPDATE `place` SET 
  `avgRating` = (SELECT AVG(rating) FROM `review` WHERE `placeId` = 4),
  `reviewsCount` = (SELECT COUNT(*) FROM `review` WHERE `placeId` = 4)
WHERE `id` = 4;

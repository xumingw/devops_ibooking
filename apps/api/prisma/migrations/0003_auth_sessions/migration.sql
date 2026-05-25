ALTER TABLE `user`
  ADD COLUMN `password_hash` VARCHAR(255) NOT NULL DEFAULT '';

CREATE TABLE `refresh_token` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `token_hash` VARCHAR(191) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `revoked` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `refresh_token_token_hash_key` (`token_hash`),
  INDEX `refresh_token_user_id_revoked_expires_at_idx` (`user_id`, `revoked`, `expires_at`),
  CONSTRAINT `refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `id` VARCHAR(191) NOT NULL,
  `student_no` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_student_no_key` (`student_no`),
  UNIQUE INDEX `user_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

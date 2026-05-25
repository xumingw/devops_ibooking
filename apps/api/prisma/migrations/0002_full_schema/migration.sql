CREATE TABLE `department` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `department_code_key` (`code`),
  UNIQUE INDEX `department_name_key` (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user`
  ADD COLUMN `department_id` VARCHAR(191) NULL,
  ADD INDEX `user_department_id_idx` (`department_id`),
  ADD CONSTRAINT `user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `role` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `role_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `permission` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(128) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `menu_key` VARCHAR(128) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `permission_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role_permission` (
  `role_id` VARCHAR(191) NOT NULL,
  `permission_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_role` (
  `user_id` VARCHAR(191) NOT NULL,
  `role_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `room` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `building` VARCHAR(128) NOT NULL,
  `floor` INTEGER NOT NULL,
  `capacity` INTEGER NOT NULL,
  `scope_type` ENUM('SCHOOL', 'DEPARTMENT') NOT NULL DEFAULT 'SCHOOL',
  `department_id` VARCHAR(191) NULL,
  `open_hour` INTEGER NOT NULL DEFAULT 7,
  `close_hour` INTEGER NOT NULL DEFAULT 22,
  `overnight` BOOLEAN NOT NULL DEFAULT false,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `room_name_key` (`name`),
  INDEX `room_department_id_idx` (`department_id`),
  CONSTRAINT `room_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seat` (
  `id` VARCHAR(191) NOT NULL,
  `room_id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `x` INTEGER NOT NULL,
  `y` INTEGER NOT NULL,
  `has_power` BOOLEAN NOT NULL DEFAULT false,
  `near_window` BOOLEAN NOT NULL DEFAULT false,
  `attributes` JSON NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `seat_room_id_code_key` (`room_id`, `code`),
  INDEX `seat_room_id_idx` (`room_id`),
  CONSTRAINT `seat_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `room_schedule` (
  `id` VARCHAR(191) NOT NULL,
  `room_id` VARCHAR(191) NOT NULL,
  `date` DATE NOT NULL,
  `open_hour` INTEGER NOT NULL,
  `close_hour` INTEGER NOT NULL,
  `closed` BOOLEAN NOT NULL DEFAULT false,
  `reason` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `room_schedule_room_id_date_key` (`room_id`, `date`),
  CONSTRAINT `room_schedule_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `booking` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `room_id` VARCHAR(191) NOT NULL,
  `seat_id` VARCHAR(191) NOT NULL,
  `start_at` DATETIME(3) NOT NULL,
  `end_at` DATETIME(3) NOT NULL,
  `status` ENUM('PENDING_CHECKIN', 'CHECKED_IN', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ADMIN', 'CANCELLED_AUTO_NO_CHECKIN') NOT NULL DEFAULT 'PENDING_CHECKIN',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `booking_user_id_start_at_end_at_idx` (`user_id`, `start_at`, `end_at`),
  INDEX `booking_seat_id_start_at_end_at_idx` (`seat_id`, `start_at`, `end_at`),
  CONSTRAINT `booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `booking_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `booking_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `booking_slot` (
  `id` VARCHAR(191) NOT NULL,
  `booking_id` VARCHAR(191) NOT NULL,
  `seat_id` VARCHAR(191) NOT NULL,
  `slot_start` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `booking_slot_seat_id_slot_start_key` (`seat_id`, `slot_start`),
  INDEX `booking_slot_booking_id_idx` (`booking_id`),
  CONSTRAINT `booking_slot_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `booking_slot_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `violation` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `booking_id` VARCHAR(191) NOT NULL,
  `room_id` VARCHAR(191) NOT NULL,
  `seat_id` VARCHAR(191) NOT NULL,
  `reason` ENUM('NO_CHECK_IN', 'MANUAL') NOT NULL,
  `occurred_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `violation_booking_id_key` (`booking_id`),
  INDEX `violation_user_id_occurred_at_idx` (`user_id`, `occurred_at`),
  CONSTRAINT `violation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `violation_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `violation_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `violation_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `check_in_code` (
  `id` VARCHAR(191) NOT NULL,
  `room_id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `valid_at` DATETIME(3) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `check_in_code_room_id_valid_at_key` (`room_id`, `valid_at`),
  CONSTRAINT `check_in_code_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `reminder_log` (
  `id` VARCHAR(191) NOT NULL,
  `booking_id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `channel` VARCHAR(32) NOT NULL,
  `sent_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `reminder_log_booking_id_type_idx` (`booking_id`, `type`),
  CONSTRAINT `reminder_log_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_log` (
  `id` VARCHAR(191) NOT NULL,
  `actor_id` VARCHAR(191) NULL,
  `action` VARCHAR(128) NOT NULL,
  `resource` VARCHAR(128) NOT NULL,
  `resource_id` VARCHAR(191) NULL,
  `detail` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `audit_log_actor_id_created_at_idx` (`actor_id`, `created_at`),
  CONSTRAINT `audit_log_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_param` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(128) NOT NULL,
  `value` VARCHAR(512) NOT NULL,
  `value_type` VARCHAR(32) NOT NULL DEFAULT 'string',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `system_param_key_key` (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

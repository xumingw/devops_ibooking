ALTER TABLE `booking_slot`
  ADD COLUMN `user_id` VARCHAR(191) NULL;

UPDATE `booking_slot` AS `slot`
INNER JOIN `booking` AS `booking`
  ON `booking`.`id` = `slot`.`booking_id`
SET `slot`.`user_id` = `booking`.`user_id`;

ALTER TABLE `booking_slot`
  MODIFY `user_id` VARCHAR(191) NOT NULL,
  ADD UNIQUE INDEX `booking_slot_user_id_slot_start_key` (`user_id`, `slot_start`),
  ADD INDEX `booking_slot_user_id_idx` (`user_id`),
  ADD CONSTRAINT `booking_slot_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

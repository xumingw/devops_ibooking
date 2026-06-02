ALTER TABLE `reminder_log`
  ADD COLUMN `read_at` DATETIME(3) NULL,
  ADD INDEX `reminder_log_read_at_idx` (`read_at`);

-- =====================================================================
-- MIGRATION 001 — Display Promo (banner promo + countdown di beranda)
-- Jalankan SEKALI di phpMyAdmin Hostinger:
--   pilih database (u768480753_shop) -> tab SQL -> tempel isi file ini -> Go.
-- Aman dijalankan ulang (pakai IF NOT EXISTS).
-- =====================================================================
SET @OLD_SQL_MODE = @@SQL_MODE;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

CREATE TABLE IF NOT EXISTS `display_promos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `discount_type` ENUM('percentage','fixed_amount') NOT NULL,
  `discount_value` DECIMAL(12,2) NOT NULL,
  `stock` INT UNSIGNED DEFAULT NULL,
  `sold` INT UNSIGNED NOT NULL DEFAULT 0,
  `start_at` TIMESTAMP NOT NULL,
  `end_at` TIMESTAMP NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_display_promos_window` (`is_active`, `start_at`, `end_at`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `display_promo_products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `display_promo_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_dpp_promo` (`display_promo_id`),
  KEY `fk_dpp_product` (`product_id`),
  CONSTRAINT `fk_dpp_promo` FOREIGN KEY (`display_promo_id`) REFERENCES `display_promos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dpp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

SET SQL_MODE = @OLD_SQL_MODE;

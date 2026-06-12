import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Idempotent schema migrations applied automatically on first app use after a
// (re)deploy — so the production DB updates itself without manual phpMyAdmin steps.
// Each migration runs once; applied ones are recorded in `schema_migrations`.
// Statements must be safe to re-run (CREATE TABLE IF NOT EXISTS, etc.).

interface Migration {
  name: string;
  statements: string[];
}

const MIGRATIONS: Migration[] = [
  {
    name: "001_display_promos",
    statements: [
      `CREATE TABLE IF NOT EXISTS display_promos (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT NULL,
        discount_type ENUM('percentage','fixed_amount') NOT NULL,
        discount_value DECIMAL(12,2) NOT NULL,
        stock INT UNSIGNED DEFAULT NULL,
        sold INT UNSIGNED NOT NULL DEFAULT 0,
        start_at TIMESTAMP NOT NULL,
        end_at TIMESTAMP NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_by INT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_display_promos_window (is_active, start_at, end_at)
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS display_promo_products (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        display_promo_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_dpp_promo (display_promo_id),
        KEY fk_dpp_product (product_id),
        CONSTRAINT fk_dpp_promo FOREIGN KEY (display_promo_id) REFERENCES display_promos (id) ON DELETE CASCADE,
        CONSTRAINT fk_dpp_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      ) ENGINE=InnoDB`,
    ],
  },
];

async function runMigrations(): Promise<void> {
  const conn = await db.getConnection();
  try {
    // Permissive mode so TIMESTAMP NOT NULL columns (e.g. end_at) create cleanly
    // under MariaDB/MySQL strict mode.
    await conn.query("SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO'");

    await conn.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(191) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (name)
      ) ENGINE=InnoDB`
    );

    for (const mig of MIGRATIONS) {
      const [rows] = await conn.query<RowDataPacket[]>(
        "SELECT 1 FROM schema_migrations WHERE name = ? LIMIT 1",
        [mig.name]
      );
      if (rows.length > 0) continue;

      for (const stmt of mig.statements) {
        await conn.query(stmt);
      }
      await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [mig.name]);
      console.log(`[migrate] applied ${mig.name}`);
    }
  } finally {
    conn.release();
  }
}

let migrationPromise: Promise<void> | null = null;

// Runs migrations once per server process. Safe to call on every request.
export function ensureMigrated(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigrations().catch((err) => {
      // Allow a retry on the next call if it failed (e.g. transient DB issue).
      migrationPromise = null;
      throw err;
    });
  }
  return migrationPromise;
}
